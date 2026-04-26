#!/usr/bin/env node

/**
 * CLI entry point for the Apolaki data seeding utility.
 *
 * Usage:
 *   node src/index.js               # seed all tables in order
 *   node src/index.js --only users   # seed a single table
 *   node src/index.js --fresh        # teardown then re-seed
 *   node src/index.js --force        # allow running against prod URLs
 *
 * Exit codes:
 *   0 = success
 *   1 = error
 */

import 'dotenv/config';
import { closePool, getPool } from './db.js';
import { logger } from './logger.js';

// ─── Seeder registry (import order = execution order) ─────────────────────
import * as usersSeeder from './seeders/01-users.js';
import * as installationsSeeder from './seeders/02-installations.js';
import * as monitoringSeeder from './seeders/03-monitoring.js';
import * as performanceSeeder from './seeders/04-performance.js';
import * as marketplaceSeeder from './seeders/05-marketplace.js';
import * as contractsSeeder from './seeders/06-contracts.js';
import * as assessmentsSeeder from './seeders/07-assessments.js';
import * as financeSeeder from './seeders/08-finance.js';
import * as maintenanceSeeder from './seeders/09-maintenance.js';

/** Ordered list of all seeders — respects foreign-key dependencies. */
const ALL_SEEDERS = [
  usersSeeder,
  installationsSeeder,
  monitoringSeeder,
  performanceSeeder,
  marketplaceSeeder,
  contractsSeeder,
  assessmentsSeeder,
  financeSeeder,
  maintenanceSeeder,
];

// ─── Dependency map for --only mode ──────────────────────────────────────
// When running a single seeder, its dependencies must be present.
const DEPENDENCY_MAP = {
  users:         [],
  installations: ['users'],
  monitoring:    ['users', 'installations'],
  performance:   ['users', 'installations'],
  marketplace:   [],
  contracts:     ['users'],
  assessments:   ['users'],
  finance:       ['users'],
  maintenance:   ['users', 'installations'],
};

// ─── CLI argument parsing ────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { fresh: false, force: false, only: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fresh':
        opts.fresh = true;
        break;
      case '--force':
        opts.force = true;
        break;
      case '--only':
        i++;
        if (!args[i]) {
          logger.error('--only requires a seeder name (e.g. --only users)');
          process.exit(1);
        }
        opts.only = args[i];
        break;
      default:
        logger.warn(`Unknown flag: ${args[i]}`);
    }
  }

  return opts;
}

// ─── Safety check: prevent accidental production seeding ─────────────────
function guardProduction(dbUrl, force) {
  if (/prod/i.test(dbUrl) && !force) {
    logger.error(
      'DATABASE_URL contains "prod". Pass --force to override this safety check.'
    );
    process.exit(1);
  }
}

// ─── Teardown all seeders in reverse order ───────────────────────────────
async function teardownAll() {
  logger.header('Teardown');
  const reversed = [...ALL_SEEDERS].reverse();
  for (const seeder of reversed) {
    try {
      await seeder.teardown();
      logger.success(`Torn down: ${seeder.name}`);
    } catch (err) {
      logger.warn(`Teardown of ${seeder.name} failed (may not exist): ${err.message}`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs(process.argv);
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    logger.error('DATABASE_URL not set. Copy .env.example → .env and configure it.');
    process.exit(1);
  }

  guardProduction(dbUrl, opts.force);

  // Initialise connection pool
  getPool(dbUrl);
  logger.info('Connected to database');

  const startTime = Date.now();

  try {
    // ── Fresh mode: teardown first ────────────────────────────────────
    if (opts.fresh) {
      await teardownAll();
    }

    // ── Determine which seeders to run ─────────────────────────────────
    let seedersToRun;

    if (opts.only) {
      const target = ALL_SEEDERS.find((s) => s.name === opts.only);
      if (!target) {
        const names = ALL_SEEDERS.map((s) => s.name).join(', ');
        logger.error(`Unknown seeder "${opts.only}". Available: ${names}`);
        process.exit(1);
      }

      // Resolve dependencies — seed them first if --only is used
      const deps = DEPENDENCY_MAP[opts.only] || [];
      seedersToRun = [];
      for (const depName of deps) {
        const dep = ALL_SEEDERS.find((s) => s.name === depName);
        if (dep) seedersToRun.push(dep);
      }
      seedersToRun.push(target);

      logger.header(`Seeding: ${opts.only} (+ ${deps.length} dependencies)`);
    } else {
      seedersToRun = ALL_SEEDERS;
      logger.header('Seeding all tables');
    }

    // ── Execute seeders in order ───────────────────────────────────────
    const summary = [];

    for (const seeder of seedersToRun) {
      const t0 = Date.now();
      logger.info(`Seeding ${seeder.name}…`);

      try {
        const result = await seeder.seed();
        const elapsed = Date.now() - t0;
        logger.success(`${seeder.name} (${elapsed}ms)`);

        if (Array.isArray(result) && result.length > 0) {
          logger.table(result);
        }

        summary.push({ seeder: seeder.name, status: '✔', time: `${elapsed}ms` });
      } catch (err) {
        logger.error(`${seeder.name} failed: ${err.message}`);
        summary.push({ seeder: seeder.name, status: '✖', time: '-' });
        throw err; // fail fast
      }
    }

    // ── Final summary ──────────────────────────────────────────────────
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.header('Seed Summary');
    logger.table(summary);
    logger.success(`All done in ${totalTime}s`);
  } catch (err) {
    logger.error(`Seeding aborted: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

main();
