#!/usr/bin/env node

/**
 * Verification utility — checks row counts for all seeded tables and reports
 * whether the database looks correctly seeded.
 *
 * Usage:
 *   node src/verify.js
 */

import 'dotenv/config';
import { closePool, getPool, query } from './db.js';
import { logger } from './logger.js';

/** Expected minimum row counts for each table (seeded by this utility). */
const EXPECTATIONS = [
  { table: 'users',                minRows: 5,   label: 'Users' },
  { table: 'solar_installations',  minRows: 6,   label: 'Solar Installations' },
  { table: 'monitoring_data',      minRows: 100, label: 'Monitoring Data' },
  { table: 'performance_data',     minRows: 30,  label: 'Performance Data' },
  { table: 'marketplace_products', minRows: 12,  label: 'Marketplace Products' },
  { table: 'contracts',            minRows: 5,   label: 'Contracts' },
  { table: 'assessments',          minRows: 7,   label: 'Assessments' },
  { table: 'finance',              minRows: 10,  label: 'Finance' },
  { table: 'maintenance_log',      minRows: 10,  label: 'Maintenance Logs' },
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    logger.error('DATABASE_URL not set.');
    process.exit(1);
  }

  getPool(dbUrl);
  logger.header('Seed Verification');

  const results = [];
  let allPassed = true;

  for (const { table, minRows, label } of EXPECTATIONS) {
    try {
      const res = await query(`SELECT COUNT(*)::int AS count FROM ${table}`);
      const count = res.rows[0].count;
      const passed = count >= minRows;

      if (!passed) allPassed = false;

      results.push({
        table: label,
        rows: count,
        expected: `≥ ${minRows}`,
        status: passed ? '✔ PASS' : '✖ FAIL',
      });
    } catch (err) {
      allPassed = false;
      results.push({
        table: label,
        rows: '—',
        expected: `≥ ${minRows}`,
        status: `✖ ERROR: ${err.message.slice(0, 50)}`,
      });
    }
  }

  logger.table(results);

  if (allPassed) {
    logger.success('All tables verified — seed data looks good!');
  } else {
    logger.error('Some tables have missing or insufficient data. Run `npm run seed` first.');
    process.exitCode = 1;
  }

  await closePool();
}

main();
