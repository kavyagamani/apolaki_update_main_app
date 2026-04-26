/**
 * Seeder: Solar Installations
 *
 * Creates demo solar installations for seeded users.
 * Philippine locations with realistic capacity and panel data.
 */

import { query } from '../db.js';
import { USER_IDS } from './01-users.js';

export const INSTALLATION_IDS = {
  makati_residential:  '10000000-0000-4000-a000-000000000001',
  cebu_commercial:     '10000000-0000-4000-a000-000000000002',
  davao_industrial:    '10000000-0000-4000-a000-000000000003',
  quezon_rooftop:      '10000000-0000-4000-a000-000000000004',
  batangas_farm:       '10000000-0000-4000-a000-000000000005',
  iloilo_school:       '10000000-0000-4000-a000-000000000006',
};

const INSTALLATIONS = [
  {
    id: INSTALLATION_IDS.makati_residential,
    user_id: USER_IDS.homeowner,
    name: 'Makati Residence Solar',
    address: '123 Ayala Avenue',
    city: 'Makati',
    state: 'Metro Manila',
    zip_code: '1226',
    latitude: 14.5547,
    longitude: 121.0244,
    capacity: 8.5,
    panel_count: 20,
    inverter_type: 'SMA Sunny Boy 8.0',
    status: 'active',
  },
  {
    id: INSTALLATION_IDS.cebu_commercial,
    user_id: USER_IDS.homeowner,
    name: 'Cebu IT Park Office',
    address: 'Cebu IT Park, Lahug',
    city: 'Cebu City',
    state: 'Cebu',
    zip_code: '6000',
    latitude: 10.3297,
    longitude: 123.9058,
    capacity: 25.0,
    panel_count: 60,
    inverter_type: 'SolarEdge SE25K',
    status: 'active',
  },
  {
    id: INSTALLATION_IDS.davao_industrial,
    user_id: USER_IDS.installer,
    name: 'Davao Warehouse Array',
    address: 'DMSF Compound, Sasa',
    city: 'Davao City',
    state: 'Davao del Sur',
    zip_code: '8000',
    latitude: 7.1066,
    longitude: 125.6367,
    capacity: 50.0,
    panel_count: 120,
    inverter_type: 'Huawei SUN2000-50KTL',
    status: 'active',
  },
  {
    id: INSTALLATION_IDS.quezon_rooftop,
    user_id: USER_IDS.trader,
    name: 'QC Rooftop System',
    address: 'Eastwood Citywalk',
    city: 'Quezon City',
    state: 'Metro Manila',
    zip_code: '1110',
    latitude: 14.6091,
    longitude: 121.0809,
    capacity: 5.5,
    panel_count: 14,
    inverter_type: 'Enphase IQ7+',
    status: 'active',
  },
  {
    id: INSTALLATION_IDS.batangas_farm,
    user_id: USER_IDS.installer,
    name: 'Batangas Solar Farm',
    address: 'Brgy. Talahib Pandayan',
    city: 'Batangas City',
    state: 'Batangas',
    zip_code: '4200',
    latitude: 13.7565,
    longitude: 121.0583,
    capacity: 100.0,
    panel_count: 240,
    inverter_type: 'ABB PVS-100',
    status: 'active',
  },
  {
    id: INSTALLATION_IDS.iloilo_school,
    user_id: USER_IDS.viewer,
    name: 'Iloilo School Panels',
    address: 'La Paz District',
    city: 'Iloilo City',
    state: 'Iloilo',
    zip_code: '5000',
    latitude: 10.7202,
    longitude: 122.5621,
    capacity: 12.0,
    panel_count: 30,
    inverter_type: 'Fronius Symo 12.0',
    status: 'maintenance',
  },
];

export const name = 'installations';

export async function seed() {
  const results = [];

  for (const inst of INSTALLATIONS) {
    const res = await query(
      `INSERT INTO solar_installations
         (id, user_id, name, address, city, state, zip_code, latitude, longitude,
          capacity, panel_count, inverter_type, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id, name`,
      [
        inst.id, inst.user_id, inst.name, inst.address, inst.city, inst.state,
        inst.zip_code, inst.latitude, inst.longitude, inst.capacity,
        inst.panel_count, inst.inverter_type, inst.status,
      ]
    );

    results.push({
      name: inst.name,
      capacity: `${inst.capacity} kW`,
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(INSTALLATION_IDS);
  await query(`DELETE FROM solar_installations WHERE id = ANY($1::uuid[])`, [ids]);
}
