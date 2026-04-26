/**
 * Seeder: Maintenance Logs
 *
 * Creates demo maintenance records tied to seeded installations.
 * Covers various maintenance types, statuses, and realistic Philippine technicians.
 */

import { query } from '../db.js';
import { INSTALLATION_IDS } from './02-installations.js';

const MAINTENANCE_IDS = {
  routine_makati:        '60000000-0000-4000-a000-000000000001',
  cleaning_cebu:         '60000000-0000-4000-a000-000000000002',
  inverter_repair_davao: '60000000-0000-4000-a000-000000000003',
  inspection_qc:        '60000000-0000-4000-a000-000000000004',
  panel_replace_batangas:'60000000-0000-4000-a000-000000000005',
  wiring_iloilo:        '60000000-0000-4000-a000-000000000006',
  scheduled_davao:       '60000000-0000-4000-a000-000000000007',
  emergency_makati:      '60000000-0000-4000-a000-000000000008',
  annual_cebu:           '60000000-0000-4000-a000-000000000009',
  upgrade_batangas:      '60000000-0000-4000-a000-000000000010',
};

const MAINTENANCE_RECORDS = [
  {
    id: MAINTENANCE_IDS.routine_makati,
    installation_id: INSTALLATION_IDS.makati_residential,
    maintenance_type: 'routine',
    description: 'Quarterly routine inspection: visual check, inverter diagnostics, connection tightness, shading assessment.',
    performed_date: '2025-03-15T09:00:00Z',
    completed_date: '2025-03-15T11:30:00Z',
    cost: 3500.00,
    status: 'completed',
    technician: 'Engr. Rico Bautista',
    notes: 'All panels operating within spec. Inverter firmware updated to v3.2.1. Minor bird nesting removed from rail mount.',
  },
  {
    id: MAINTENANCE_IDS.cleaning_cebu,
    installation_id: INSTALLATION_IDS.cebu_commercial,
    maintenance_type: 'cleaning',
    description: 'Professional panel cleaning — 60 panels. Deionised water wash with soft-brush system.',
    performed_date: '2025-04-02T07:00:00Z',
    completed_date: '2025-04-02T12:00:00Z',
    cost: 9000.00,
    status: 'completed',
    technician: 'SolarClean PH Team',
    notes: 'Heavy dust and pollen buildup reduced efficiency by ~8%. Post-cleaning output improved from 21.5 kW to 23.8 kW peak.',
  },
  {
    id: MAINTENANCE_IDS.inverter_repair_davao,
    installation_id: INSTALLATION_IDS.davao_industrial,
    maintenance_type: 'repair',
    description: 'Inverter fault diagnosis and capacitor replacement. Huawei SUN2000-50KTL error code F-23.',
    performed_date: '2025-02-20T08:00:00Z',
    completed_date: '2025-02-21T16:00:00Z',
    cost: 28000.00,
    status: 'completed',
    technician: 'Engr. Mark Villanueva',
    notes: 'DC bus capacitor degraded. Replaced under manufacturer warranty — cost covers labor only. Downtime: 32 hours.',
  },
  {
    id: MAINTENANCE_IDS.inspection_qc,
    installation_id: INSTALLATION_IDS.quezon_rooftop,
    maintenance_type: 'inspection',
    description: 'Annual safety inspection: ground fault check, arc fault detection, insulation resistance test.',
    performed_date: '2025-05-10T09:00:00Z',
    completed_date: '2025-05-10T13:00:00Z',
    cost: 5000.00,
    status: 'completed',
    technician: 'Engr. Lisa Reyes',
    notes: 'All insulation resistance readings above 2 MΩ. Grounding electrode resistance 3.2 Ω — within specification. Microinverters all reporting.',
  },
  {
    id: MAINTENANCE_IDS.panel_replace_batangas,
    installation_id: INSTALLATION_IDS.batangas_farm,
    maintenance_type: 'repair',
    description: 'Replacement of 3 panels with micro-cracks detected via IR thermography during routine flyover.',
    performed_date: '2025-04-18T07:00:00Z',
    completed_date: '2025-04-19T15:00:00Z',
    cost: 45000.00,
    status: 'completed',
    technician: 'SunTech PH Field Team',
    notes: 'Panels S2-R4-P07, S2-R4-P08, S2-R5-P03 replaced. Hotspot analysis confirmed micro-cracks from hail event. Claimed under insurance.',
  },
  {
    id: MAINTENANCE_IDS.wiring_iloilo,
    installation_id: INSTALLATION_IDS.iloilo_school,
    maintenance_type: 'repair',
    description: 'DC wiring repair — rodent damage to string 2 cable. MC4 connector replacement.',
    performed_date: '2025-05-05T08:00:00Z',
    completed_date: '2025-05-05T14:00:00Z',
    cost: 7500.00,
    status: 'completed',
    technician: 'Engr. Roberto Cruz',
    notes: 'Installed cable conduit protection to prevent recurring rodent damage. String 2 output restored to 4.1 kW.',
  },
  {
    id: MAINTENANCE_IDS.scheduled_davao,
    installation_id: INSTALLATION_IDS.davao_industrial,
    maintenance_type: 'routine',
    description: 'Scheduled semi-annual maintenance: thermal imaging, IV curve tracing, cleaning, and bolt torque check.',
    performed_date: '2025-07-01T07:00:00Z',
    completed_date: null,
    cost: 35000.00,
    status: 'scheduled',
    technician: 'Engr. Mark Villanueva',
    notes: 'Scheduled for July 1. Full IV curve trace for all 120 panels. Thermal imaging drone flyover included.',
  },
  {
    id: MAINTENANCE_IDS.emergency_makati,
    installation_id: INSTALLATION_IDS.makati_residential,
    maintenance_type: 'emergency',
    description: 'Emergency callout — system offline after typhoon. Inverter anti-islanding tripped, grid fault.',
    performed_date: '2025-05-28T16:00:00Z',
    completed_date: '2025-05-28T20:00:00Z',
    cost: 8000.00,
    status: 'completed',
    technician: 'Engr. Rico Bautista',
    notes: 'Inverter reset after grid voltage stabilised. No panel damage. One mounting bracket re-torqued. System back online at 8:12 PM.',
  },
  {
    id: MAINTENANCE_IDS.annual_cebu,
    installation_id: INSTALLATION_IDS.cebu_commercial,
    maintenance_type: 'inspection',
    description: 'Annual performance audit and inverter firmware update. SolarEdge monitoring recalibration.',
    performed_date: '2025-06-15T09:00:00Z',
    completed_date: null,
    cost: 12000.00,
    status: 'in_progress',
    technician: 'SolarEdge Certified Partner',
    notes: 'Performance audit started. Preliminary data shows 2.3% degradation in year 1 — within expected range for polycrystalline modules.',
  },
  {
    id: MAINTENANCE_IDS.upgrade_batangas,
    installation_id: INSTALLATION_IDS.batangas_farm,
    maintenance_type: 'upgrade',
    description: 'Monitoring system upgrade — installation of IoT gateway for real-time per-string monitoring.',
    performed_date: '2025-06-20T08:00:00Z',
    completed_date: null,
    cost: 65000.00,
    status: 'scheduled',
    technician: 'Apolaki Systems Team',
    notes: 'IoT gateway will enable 5-second data resolution per string. Includes 4G failover modem and edge analytics processor.',
  },
];

export const name = 'maintenance';

export async function seed() {
  const results = [];

  for (const m of MAINTENANCE_RECORDS) {
    const res = await query(
      `INSERT INTO maintenance_log
         (id, installation_id, maintenance_type, description, performed_date,
          completed_date, cost, status, technician, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [
        m.id, m.installation_id, m.maintenance_type, m.description,
        m.performed_date, m.completed_date, m.cost, m.status,
        m.technician, m.notes,
      ]
    );

    results.push({
      type: m.maintenance_type,
      installation: m.installation_id.slice(-4),
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(MAINTENANCE_IDS);
  await query(`DELETE FROM maintenance_log WHERE id = ANY($1::uuid[])`, [ids]);
}
