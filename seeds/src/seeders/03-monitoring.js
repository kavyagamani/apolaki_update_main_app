/**
 * Seeder: Monitoring Data
 *
 * Generates 7 days of 5-minute-interval monitoring data for each installation.
 * Uses seeded pseudo-random values to produce realistic solar generation curves
 * (low at dawn/dusk, peak at midday, zero at night).
 */

import { query } from '../db.js';
import { INSTALLATION_IDS } from './02-installations.js';

/** Simple seeded PRNG (mulberry32) for deterministic "random" data */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Model solar output as a sine curve peaking at solar noon (12:00).
 * Returns 0 outside 6 AM – 6 PM.
 */
function solarCurve(hour, capacityKw, rand) {
  if (hour < 6 || hour >= 18) return 0;
  const normalised = Math.sin(((hour - 6) / 12) * Math.PI);
  const jitter = 0.85 + rand() * 0.3; // 85 %–115 % of ideal
  return Math.round(capacityKw * normalised * jitter * 100) / 100;
}

const CAPACITY_MAP = {
  [INSTALLATION_IDS.makati_residential]: 8.5,
  [INSTALLATION_IDS.cebu_commercial]: 25.0,
  [INSTALLATION_IDS.davao_industrial]: 50.0,
  [INSTALLATION_IDS.quezon_rooftop]: 5.5,
  [INSTALLATION_IDS.batangas_farm]: 100.0,
  [INSTALLATION_IDS.iloilo_school]: 12.0,
};

export const name = 'monitoring';

export async function seed() {
  const now = new Date();
  const DAYS = 7;
  const INTERVAL_MIN = 5;
  const results = [];
  let totalRows = 0;

  for (const [instId, capacity] of Object.entries(CAPACITY_MAP)) {
    const rand = mulberry32(parseInt(instId.replace(/-/g, '').slice(0, 8), 16));
    const rows = [];

    for (let d = DAYS - 1; d >= 0; d--) {
      for (let m = 0; m < 24 * 60; m += INTERVAL_MIN) {
        const ts = new Date(now);
        ts.setDate(ts.getDate() - d);
        ts.setHours(Math.floor(m / 60), m % 60, 0, 0);

        const hour = ts.getHours() + ts.getMinutes() / 60;
        const power = solarCurve(hour, capacity, rand);
        const voltage = power > 0 ? 220 + rand() * 20 : 0;
        const current = power > 0 ? (power * 1000) / (voltage || 1) : 0;
        const freq = power > 0 ? 49.8 + rand() * 0.4 : 0;
        const temp = 25 + (power / capacity) * 20 + rand() * 5;
        const efficiency = power > 0 ? 80 + rand() * 18 : 0;

        rows.push([
          instId,
          ts.toISOString(),
          Math.round(power * 100) / 100,
          Math.round(voltage * 100) / 100,
          Math.round(current * 100) / 100,
          Math.round(freq * 100) / 100,
          Math.round(temp * 100) / 100,
          Math.round(efficiency * 100) / 100,
          power > 0 ? 'generating' : 'standby',
          null,
        ]);
      }
    }

    // Batch insert in chunks of 500 for performance
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const values = [];
      const placeholders = [];

      chunk.forEach((row, idx) => {
        const offset = idx * 10;
        placeholders.push(
          `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8},$${offset + 9},$${offset + 10})`
        );
        values.push(...row);
      });

      await query(
        `INSERT INTO monitoring_data
           (installation_id, timestamp, power_output, voltage_ac, current_ac,
            frequency, temperature, efficiency, status, error_code)
         VALUES ${placeholders.join(',')}
         ON CONFLICT DO NOTHING`,
        values
      );
    }

    totalRows += rows.length;
    results.push({ installation: instId.slice(-4), rows: rows.length });
  }

  results.push({ total: totalRows });
  return results;
}

export async function teardown() {
  const ids = Object.values(INSTALLATION_IDS);
  await query(
    `DELETE FROM monitoring_data WHERE installation_id = ANY($1::uuid[])`,
    [ids]
  );
}
