/**
 * Seeder: Financial Transactions
 *
 * Creates demo finance records covering payments, credits, refunds, and
 * recurring billing for seeded users — all in Philippine Peso (PHP).
 */

import { query } from '../db.js';
import { USER_IDS } from './01-users.js';

const FINANCE_IDS = {
  payment_install_home:   '50000000-0000-4000-a000-000000000001',
  payment_install_office: '50000000-0000-4000-a000-000000000002',
  credit_net_metering:    '50000000-0000-4000-a000-000000000003',
  lease_monthly_1:        '50000000-0000-4000-a000-000000000004',
  lease_monthly_2:        '50000000-0000-4000-a000-000000000005',
  maintenance_fee:        '50000000-0000-4000-a000-000000000006',
  energy_sale:            '50000000-0000-4000-a000-000000000007',
  refund_warranty:        '50000000-0000-4000-a000-000000000008',
  subsidy_rebate:         '50000000-0000-4000-a000-000000000009',
  panel_purchase:         '50000000-0000-4000-a000-000000000010',
};

const FINANCE_RECORDS = [
  {
    id: FINANCE_IDS.payment_install_home,
    user_id: USER_IDS.homeowner,
    transaction_id: 'TXN-2025-0001',
    amount: 425000.00,
    currency: 'PHP',
    type: 'payment',
    category: 'installation',
    status: 'completed',
    transaction_date: '2025-01-15T10:00:00Z',
    description: 'Full payment for Makati Residence Solar 8.5 kW installation',
    metadata: {
      payment_method: 'bank_transfer',
      bank: 'BDO',
      reference_number: 'BDO-20250115-8832',
      installation_id: '10000000-0000-4000-a000-000000000001',
    },
  },
  {
    id: FINANCE_IDS.payment_install_office,
    user_id: USER_IDS.homeowner,
    transaction_id: 'TXN-2025-0002',
    amount: 1250000.00,
    currency: 'PHP',
    type: 'payment',
    category: 'installation',
    status: 'completed',
    transaction_date: '2025-02-01T09:30:00Z',
    description: 'Installation payment for Cebu IT Park Office 25 kW system (50% down payment)',
    metadata: {
      payment_method: 'bank_transfer',
      bank: 'BPI',
      reference_number: 'BPI-20250201-4421',
      installment: '1 of 2',
      installation_id: '10000000-0000-4000-a000-000000000002',
    },
  },
  {
    id: FINANCE_IDS.credit_net_metering,
    user_id: USER_IDS.homeowner,
    transaction_id: 'TXN-2025-0003',
    amount: 4200.00,
    currency: 'PHP',
    type: 'credit',
    category: 'net_metering',
    status: 'completed',
    transaction_date: '2025-05-01T00:00:00Z',
    description: 'Net metering credit for April 2025 — Meralco export settlement',
    metadata: {
      kwh_exported: 350,
      rate_per_kwh: 12.0,
      billing_period: '2025-04',
      utility: 'Meralco',
    },
  },
  {
    id: FINANCE_IDS.lease_monthly_1,
    user_id: USER_IDS.homeowner,
    transaction_id: 'TXN-2025-0004',
    amount: 4200.00,
    currency: 'PHP',
    type: 'payment',
    category: 'lease',
    status: 'completed',
    transaction_date: '2025-04-15T08:00:00Z',
    description: 'Monthly solar lease payment — April 2025',
    metadata: {
      payment_method: 'gcash',
      recurring: true,
      contract_id: '30000000-0000-4000-a000-000000000002',
    },
  },
  {
    id: FINANCE_IDS.lease_monthly_2,
    user_id: USER_IDS.homeowner,
    transaction_id: 'TXN-2025-0005',
    amount: 4200.00,
    currency: 'PHP',
    type: 'payment',
    category: 'lease',
    status: 'completed',
    transaction_date: '2025-05-15T08:00:00Z',
    description: 'Monthly solar lease payment — May 2025',
    metadata: {
      payment_method: 'gcash',
      recurring: true,
      contract_id: '30000000-0000-4000-a000-000000000002',
    },
  },
  {
    id: FINANCE_IDS.maintenance_fee,
    user_id: USER_IDS.installer,
    transaction_id: 'TXN-2025-0006',
    amount: 4500.00,
    currency: 'PHP',
    type: 'payment',
    category: 'maintenance',
    status: 'completed',
    transaction_date: '2025-03-20T14:00:00Z',
    description: 'Quarterly maintenance fee — Q1 2025 for Davao Warehouse Array',
    metadata: {
      payment_method: 'credit_card',
      card_last_four: '4421',
      contract_id: '30000000-0000-4000-a000-000000000003',
    },
  },
  {
    id: FINANCE_IDS.energy_sale,
    user_id: USER_IDS.trader,
    transaction_id: 'TXN-2025-0007',
    amount: 8640.00,
    currency: 'PHP',
    type: 'credit',
    category: 'energy_trading',
    status: 'completed',
    transaction_date: '2025-05-10T16:30:00Z',
    description: 'P2P energy sale — 720 kWh at ₱12.00/kWh to commercial buyer',
    metadata: {
      kwh_sold: 720,
      rate_per_kwh: 12.0,
      buyer: 'commercial_buyer_01',
      platform_fee_percent: 2.5,
    },
  },
  {
    id: FINANCE_IDS.refund_warranty,
    user_id: USER_IDS.viewer,
    transaction_id: 'TXN-2025-0008',
    amount: 3500.00,
    currency: 'PHP',
    type: 'refund',
    category: 'warranty',
    status: 'completed',
    transaction_date: '2025-04-28T11:00:00Z',
    description: 'Refund for extended warranty cancellation — Iloilo School Panels',
    metadata: {
      original_transaction: 'TXN-2025-0099',
      reason: 'coverage_overlap_with_manufacturer',
      contract_id: '30000000-0000-4000-a000-000000000005',
    },
  },
  {
    id: FINANCE_IDS.subsidy_rebate,
    user_id: USER_IDS.homeowner,
    transaction_id: 'TXN-2025-0009',
    amount: 85000.00,
    currency: 'PHP',
    type: 'credit',
    category: 'government_rebate',
    status: 'pending',
    transaction_date: '2025-06-01T00:00:00Z',
    description: 'DOE Solar Para Sa Bayan rebate — 20% of installation cost',
    metadata: {
      program: 'Solar Para Sa Bayan',
      application_number: 'SPSB-2025-00234',
      rebate_percent: 20,
      original_cost: 425000,
    },
  },
  {
    id: FINANCE_IDS.panel_purchase,
    user_id: USER_IDS.installer,
    transaction_id: 'TXN-2025-0010',
    amount: 58800.00,
    currency: 'PHP',
    type: 'payment',
    category: 'equipment_purchase',
    status: 'completed',
    transaction_date: '2025-02-20T13:15:00Z',
    description: 'Purchase of 12× JinkoSolar Tiger Neo 580W panels from Apolaki Marketplace',
    metadata: {
      payment_method: 'bank_transfer',
      product_id: '20000000-0000-4000-a000-000000000001',
      quantity: 12,
      unit_price_usd: 245,
      forex_rate: 20.0,
    },
  },
];

export const name = 'finance';

export async function seed() {
  const results = [];

  for (const f of FINANCE_RECORDS) {
    const res = await query(
      `INSERT INTO finance
         (id, user_id, transaction_id, amount, currency, type, category,
          status, transaction_date, description, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [
        f.id, f.user_id, f.transaction_id, f.amount, f.currency,
        f.type, f.category, f.status, f.transaction_date,
        f.description, JSON.stringify(f.metadata),
      ]
    );

    results.push({
      txn: f.transaction_id,
      type: f.type,
      amount: `${f.currency} ${f.amount.toLocaleString()}`,
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(FINANCE_IDS);
  await query(`DELETE FROM finance WHERE id = ANY($1::uuid[])`, [ids]);
}
