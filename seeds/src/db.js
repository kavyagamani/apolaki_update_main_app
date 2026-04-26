/**
 * Database connection for the seed utility.
 *
 * Single responsibility: manage a pg Pool and expose a query helper.
 * This module has ZERO imports from middleware/ — it is fully standalone.
 */

import pg from 'pg';

const { Pool } = pg;

/** @type {pg.Pool | null} */
let pool = null;

/**
 * Initialise (or return existing) connection pool.
 * @param {string} databaseUrl – PostgreSQL connection string
 * @returns {pg.Pool}
 */
export function getPool(databaseUrl) {
  if (pool) return pool;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Copy seeds/.env.example → seeds/.env and configure it.'
    );
  }

  pool = new Pool({ connectionString: databaseUrl });

  pool.on('error', (err) => {
    console.error('[seed:db] Unexpected pool error', err.message);
    process.exit(1);
  });

  return pool;
}

/**
 * Run a parameterised query against the pool.
 * @param {string} text   – SQL with $1, $2… placeholders
 * @param {any[]}  params – Bind values
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params = []) {
  if (!pool) throw new Error('Call getPool() before query()');
  return pool.query(text, params);
}

/**
 * Gracefully close the pool.
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
