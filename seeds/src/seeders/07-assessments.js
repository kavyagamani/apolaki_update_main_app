/**
 * Seeder: Solar Assessments
 *
 * Creates demo solar site assessments for seeded users.
 * Covers various Philippine locations, roof types, and assessment stages.
 */

import { query } from '../db.js';
import { USER_IDS } from './01-users.js';

const ASSESSMENT_IDS = {
  makati_home:       '40000000-0000-4000-a000-000000000001',
  cebu_office:       '40000000-0000-4000-a000-000000000002',
  davao_warehouse:   '40000000-0000-4000-a000-000000000003',
  qc_condo:          '40000000-0000-4000-a000-000000000004',
  batangas_farm:     '40000000-0000-4000-a000-000000000005',
  iloilo_school:     '40000000-0000-4000-a000-000000000006',
  taguig_townhouse:  '40000000-0000-4000-a000-000000000007',
};

const ASSESSMENTS = [
  {
    id: ASSESSMENT_IDS.makati_home,
    user_id: USER_IDS.homeowner,
    address: '123 Ayala Avenue',
    city: 'Makati',
    state: 'Metro Manila',
    zip_code: '1226',
    roof_condition: 'excellent',
    roof_area: 85.0,
    annual_usage: 9600.0,
    sun_exposure: 'full',
    obstruction_level: 'none',
    recommended_capacity: 8.5,
    estimated_cost: 425000.00,
    savings_estimate: {
      monthly_savings_php: 4200,
      annual_savings_php: 50400,
      payback_years: 8.4,
      lifetime_savings_php: 1260000,
      co2_offset_kg_per_year: 5280,
    },
    status: 'completed',
    notes: 'Ideal south-facing roof with no obstructions. Recommended full roof installation with SMA inverter.',
  },
  {
    id: ASSESSMENT_IDS.cebu_office,
    user_id: USER_IDS.homeowner,
    address: 'Cebu IT Park, Lahug',
    city: 'Cebu City',
    state: 'Cebu',
    zip_code: '6000',
    roof_condition: 'good',
    roof_area: 250.0,
    annual_usage: 36000.0,
    sun_exposure: 'full',
    obstruction_level: 'low',
    recommended_capacity: 25.0,
    estimated_cost: 1250000.00,
    savings_estimate: {
      monthly_savings_php: 12500,
      annual_savings_php: 150000,
      payback_years: 8.3,
      lifetime_savings_php: 3750000,
      co2_offset_kg_per_year: 15600,
    },
    status: 'completed',
    notes: 'Commercial rooftop with minor HVAC obstructions on the east corner. High energy consumption makes this an excellent ROI candidate.',
  },
  {
    id: ASSESSMENT_IDS.davao_warehouse,
    user_id: USER_IDS.installer,
    address: 'DMSF Compound, Sasa',
    city: 'Davao City',
    state: 'Davao del Sur',
    zip_code: '8000',
    roof_condition: 'good',
    roof_area: 600.0,
    annual_usage: 72000.0,
    sun_exposure: 'full',
    obstruction_level: 'none',
    recommended_capacity: 50.0,
    estimated_cost: 2500000.00,
    savings_estimate: {
      monthly_savings_php: 25000,
      annual_savings_php: 300000,
      payback_years: 8.3,
      lifetime_savings_php: 7500000,
      co2_offset_kg_per_year: 31200,
    },
    status: 'approved',
    notes: 'Large flat warehouse roof. Perfect for ground-mounted ballasted system. Net metering application in progress with DLPC.',
  },
  {
    id: ASSESSMENT_IDS.qc_condo,
    user_id: USER_IDS.trader,
    address: 'Eastwood Citywalk',
    city: 'Quezon City',
    state: 'Metro Manila',
    zip_code: '1110',
    roof_condition: 'fair',
    roof_area: 45.0,
    annual_usage: 6000.0,
    sun_exposure: 'partial',
    obstruction_level: 'moderate',
    recommended_capacity: 5.5,
    estimated_cost: 275000.00,
    savings_estimate: {
      monthly_savings_php: 2750,
      annual_savings_php: 33000,
      payback_years: 8.3,
      lifetime_savings_php: 825000,
      co2_offset_kg_per_year: 3432,
    },
    status: 'completed',
    notes: 'Rooftop shared with water tanks. Microinverters recommended due to partial shading from adjacent buildings.',
  },
  {
    id: ASSESSMENT_IDS.batangas_farm,
    user_id: USER_IDS.installer,
    address: 'Brgy. Talahib Pandayan',
    city: 'Batangas City',
    state: 'Batangas',
    zip_code: '4200',
    roof_condition: 'not_applicable',
    roof_area: 1500.0,
    annual_usage: 120000.0,
    sun_exposure: 'full',
    obstruction_level: 'none',
    recommended_capacity: 100.0,
    estimated_cost: 5000000.00,
    savings_estimate: {
      monthly_savings_php: 50000,
      annual_savings_php: 600000,
      payback_years: 8.3,
      lifetime_savings_php: 15000000,
      co2_offset_kg_per_year: 62400,
    },
    status: 'in_progress',
    notes: 'Ground-mount solar farm on agricultural land. EIA clearance obtained. Grid interconnection study pending with BATELEC.',
  },
  {
    id: ASSESSMENT_IDS.iloilo_school,
    user_id: USER_IDS.viewer,
    address: 'La Paz District',
    city: 'Iloilo City',
    state: 'Iloilo',
    zip_code: '5000',
    roof_condition: 'good',
    roof_area: 120.0,
    annual_usage: 18000.0,
    sun_exposure: 'full',
    obstruction_level: 'low',
    recommended_capacity: 12.0,
    estimated_cost: 600000.00,
    savings_estimate: {
      monthly_savings_php: 6000,
      annual_savings_php: 72000,
      payback_years: 8.3,
      lifetime_savings_php: 1800000,
      co2_offset_kg_per_year: 7488,
    },
    status: 'completed',
    notes: 'School gymnasium roof. Installation must be scheduled during summer break. Local government subsidy of 20% applied.',
  },
  {
    id: ASSESSMENT_IDS.taguig_townhouse,
    user_id: USER_IDS.admin,
    address: 'BGC, Fort Bonifacio',
    city: 'Taguig',
    state: 'Metro Manila',
    zip_code: '1630',
    roof_condition: 'excellent',
    roof_area: 55.0,
    annual_usage: 7200.0,
    sun_exposure: 'partial',
    obstruction_level: 'moderate',
    recommended_capacity: 6.0,
    estimated_cost: 300000.00,
    savings_estimate: {
      monthly_savings_php: 3000,
      annual_savings_php: 36000,
      payback_years: 8.3,
      lifetime_savings_php: 900000,
      co2_offset_kg_per_year: 3744,
    },
    status: 'draft',
    notes: 'Townhouse with HOA restrictions on panel visibility. Requires all-black modules and flush mounting.',
  },
];

export const name = 'assessments';

export async function seed() {
  const results = [];

  for (const a of ASSESSMENTS) {
    const res = await query(
      `INSERT INTO assessments
         (id, user_id, address, city, state, zip_code, roof_condition, roof_area,
          annual_usage, sun_exposure, obstruction_level, recommended_capacity,
          estimated_cost, savings_estimate, status, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [
        a.id, a.user_id, a.address, a.city, a.state, a.zip_code,
        a.roof_condition, a.roof_area, a.annual_usage, a.sun_exposure,
        a.obstruction_level, a.recommended_capacity, a.estimated_cost,
        JSON.stringify(a.savings_estimate), a.status, a.notes,
      ]
    );

    results.push({
      address: `${a.city} – ${a.address.slice(0, 25)}`,
      capacity: `${a.recommended_capacity} kW`,
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(ASSESSMENT_IDS);
  await query(`DELETE FROM assessments WHERE id = ANY($1::uuid[])`, [ids]);
}
