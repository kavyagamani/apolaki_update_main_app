/**
 * Seeder: Contracts
 *
 * Creates demo contracts (PPA, lease, maintenance agreements) for seeded users.
 */

import { query } from '../db.js';
import { USER_IDS } from './01-users.js';

const CONTRACT_IDS = {
  ppa_homeowner:       '30000000-0000-4000-a000-000000000001',
  lease_homeowner:     '30000000-0000-4000-a000-000000000002',
  maintenance_inst:    '30000000-0000-4000-a000-000000000003',
  ppa_trader:          '30000000-0000-4000-a000-000000000004',
  warranty_viewer:     '30000000-0000-4000-a000-000000000005',
};

const CONTRACTS = [
  {
    id: CONTRACT_IDS.ppa_homeowner,
    user_id: USER_IDS.homeowner,
    contract_type: 'Power Purchase Agreement',
    start_date: '2025-06-01',
    end_date: '2045-06-01',
    term_months: 240,
    amount: 0.08,
    status: 'active',
    metadata: { rate_per_kwh: 0.08, escalation_percent: 2.5, provider: 'SunPower Philippines' },
  },
  {
    id: CONTRACT_IDS.lease_homeowner,
    user_id: USER_IDS.homeowner,
    contract_type: 'Solar Lease',
    start_date: '2025-03-15',
    end_date: '2050-03-15',
    term_months: 300,
    amount: 12500.00,
    status: 'active',
    metadata: { monthly_payment: 4200, buyout_option: true, insurance_included: true },
  },
  {
    id: CONTRACT_IDS.maintenance_inst,
    user_id: USER_IDS.installer,
    contract_type: 'Maintenance Agreement',
    start_date: '2025-01-01',
    end_date: '2027-12-31',
    term_months: 36,
    amount: 18000.00,
    status: 'active',
    metadata: { visits_per_year: 4, includes_cleaning: true, response_time_hours: 24 },
  },
  {
    id: CONTRACT_IDS.ppa_trader,
    user_id: USER_IDS.trader,
    contract_type: 'Power Purchase Agreement',
    start_date: '2024-09-01',
    end_date: '2044-09-01',
    term_months: 240,
    amount: 0.09,
    status: 'active',
    metadata: { rate_per_kwh: 0.09, escalation_percent: 2.0, net_metering: true },
  },
  {
    id: CONTRACT_IDS.warranty_viewer,
    user_id: USER_IDS.viewer,
    contract_type: 'Extended Warranty',
    start_date: '2025-06-01',
    end_date: '2035-06-01',
    term_months: 120,
    amount: 3500.00,
    status: 'pending',
    metadata: { coverage: 'panels + inverter', deductible: 250, transferable: true },
  },
];

export const name = 'contracts';

export async function seed() {
  const results = [];

  for (const c of CONTRACTS) {
    const res = await query(
      `INSERT INTO contracts
         (id, user_id, contract_type, start_date, end_date, term_months, amount, currency, status, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'USD',$8,$9, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [c.id, c.user_id, c.contract_type, c.start_date, c.end_date, c.term_months, c.amount, c.status, JSON.stringify(c.metadata)]
    );

    results.push({
      type: c.contract_type,
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(CONTRACT_IDS);
  await query(`DELETE FROM contracts WHERE id = ANY($1::uuid[])`, [ids]);
}
