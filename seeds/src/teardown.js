#!/usr/bin/env node

/**
 * Teardown utility — removes all seeded data in reverse dependency order.
 *
 * Usage:
 *   node src/teardown.js              # interactive confirmation
 *   node src/teardown.js --confirm    # skip confirmation prompt
 *   node src/teardown.js --force      # allow against prod URLs
 */

import 'dotenv/config';
import { createInterface } from 'readline';
import { closePool, getPool } from './db.js';
import { logger } from './logger.js';

import * as usersSeeder from './seeders/01-users.js';
import * as installationsSeeder from './seeders/02-installations.js';
import * as monitoringSeeder from './seeders/03-monitoring.js';
import * as performanceSeeder from './seeders/04-performance.js';
import * as marketplaceSeeder from './seeders/05-marketplace.js';
import * as contractsSeeder from './seeders/06-contracts.js';
import * as assessmentsSeeder from './seeders/07-assessments.js';
import * as financeSeeder from './seeders/08-finance.js';
import * as maintenanceSeeder from './seeders/09-maintenance.js';

/** Reverse order — child tables first to respect FK constraints. */
const ALL_SEEDERS_REVERSED = [
  maintenanceSeeder,
  financeSeeder,
  assessmentsSeeder,
  contractsSeeder,
  marketplaceSeeder,
  performanceSeeder,
  monitoringSeeder,
  installationsSeeder,
  usersSeeder,
];

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    confirm: args.includes('--confirm'),
    force: args.includes('--force'),
  };
}

function guardProduction(dbUrl, force) {
  if (/prod/i.test(dbUrl) && !force) {
    logger.error(
      'DATABASE_URL contains "prod". Pass --force to override this safety check.'
    );
    process.exit(1);
  }
}

function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv);
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    logger.error('DATABASE_URL not set.');
    process.exit(1);
  }

  guardProduction(dbUrl, opts.force);

  if (!opts.confirm) {
    const answer = await askConfirmation(
      '⚠  This will DELETE all seeded data. Continue? (yes/no) '
    );
    if (answer !== 'yes' && answer !== 'y') {
      logger.info('Teardown cancelled.');
      process.exit(0);
    }
  }

  getPool(dbUrl);
  logger.header('Teardown — removing seeded data');

  const startTime = Date.now();
  let errors = 0;

  for (const seeder of ALL_SEEDERS_REVERSED) {
    try {
      await seeder.teardown();
      logger.success(`Torn down: ${seeder.name}`);
    } catch (err) {
      logger.warn(`${seeder.name}: ${err.message}`);
      errors++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  if (errors === 0) {
    logger.success(`Teardown complete in ${totalTime}s`);
  } else {
    logger.warn(`Teardown finished with ${errors} warning(s) in ${totalTime}s`);
  }

  await closePool();
}

main();
