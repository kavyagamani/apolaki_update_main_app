/**
 * Seeder: Performance Data (daily aggregates)
 *
 * Generates 30 days of daily performance summaries per installation.
 */

import { query } from '../db.js';
import { INSTALLATION_IDS } from './02-installations.js';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CAPACITY_MAP = {
  [INSTALLATION_IDS.makati_residential]: 8.5,
  [INSTALLATION_IDS.cebu_commercial]: 25.0,
  [INSTALLATION_IDS.davao_industrial]: 50.0,
  [INSTALLATION_IDS.quezon_rooftop]: 5.5,
  [INSTALLATION_IDS.batangas_farm]: 100.0,
  [INSTALLATION_IDS.iloilo_school]: 12.0,
};

export const name = 'performance';

export async function seed() {
  const now = new Date();
  const DAYS = 30;
  const results = [];

  for (const [instId, capacity] of Object.entries(CAPACITY_MAP)) {
    const rand = mulberry32(parseInt(instId.replace(/-/g, '').slice(0, 8), 16) + 42);

    for (let d = DAYS - 1; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];

      // ~5 peak sun hours in the Philippines, with weather variance
      const sunHours = 4 + rand() * 2.5;
      const energyGenerated = Math.round(capacity * sunHours * (0.75 + rand() * 0.2) * 100) / 100;
      const peakPower = Math.round(capacity * (0.85 + rand() * 0.15) * 100) / 100;
      const avgEfficiency = Math.round((78 + rand() * 18) * 100) / 100;
      const downtimeMinutes = rand() > 0.9 ? Math.floor(rand() * 60) : 0;

      await query(
        `INSERT INTO performance_data
           (installation_id, date, energy_generated, peak_power, avg_efficiency, downtime_minutes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [instId, dateStr, energyGenerated, peakPower, avgEfficiency, downtimeMinutes]
      );
    }

    results.push({ installation: instId.slice(-4), days: DAYS });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(INSTALLATION_IDS);
  await query(
    `DELETE FROM performance_data WHERE installation_id = ANY($1::uuid[])`,
    [ids]
  );
}
