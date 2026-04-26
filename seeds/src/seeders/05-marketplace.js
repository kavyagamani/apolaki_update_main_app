/**
 * Seeder: Marketplace Products
 *
 * Populates the marketplace with realistic solar products across categories.
 */

import { query } from '../db.js';

export const PRODUCT_IDS = {
  panel_jinko:     '20000000-0000-4000-a000-000000000001',
  panel_longi:     '20000000-0000-4000-a000-000000000002',
  panel_trina:     '20000000-0000-4000-a000-000000000003',
  inverter_sma:    '20000000-0000-4000-a000-000000000004',
  inverter_huawei: '20000000-0000-4000-a000-000000000005',
  inverter_enphase:'20000000-0000-4000-a000-000000000006',
  battery_tesla:   '20000000-0000-4000-a000-000000000007',
  battery_byd:     '20000000-0000-4000-a000-000000000008',
  charger_wallbox: '20000000-0000-4000-a000-000000000009',
  monitor_sense:   '20000000-0000-4000-a000-000000000010',
  kit_home:        '20000000-0000-4000-a000-000000000011',
  kit_commercial:  '20000000-0000-4000-a000-000000000012',
};

const PRODUCTS = [
  {
    id: PRODUCT_IDS.panel_jinko,
    name: 'JinkoSolar Tiger Neo 580W',
    category: 'panels',
    description: 'N-type monocrystalline module with 22.27% max efficiency. Anti-LID, anti-PID technology. 30-year linear power warranty.',
    price: 245.00,
    inventory: 500,
    rating: 4.8,
    metadata: { wattage: 580, efficiency: 22.27, warranty_years: 30, weight_kg: 28.9, dimensions: '2278×1134×30mm' },
  },
  {
    id: PRODUCT_IDS.panel_longi,
    name: 'LONGi Hi-MO 6 545W',
    category: 'panels',
    description: 'HPBC cell technology, anti-reflective glass coating. Excellent low-light performance. 25-year product warranty.',
    price: 215.00,
    inventory: 350,
    rating: 4.7,
    metadata: { wattage: 545, efficiency: 21.3, warranty_years: 25, weight_kg: 27.5, dimensions: '2256×1133×35mm' },
  },
  {
    id: PRODUCT_IDS.panel_trina,
    name: 'Trina Solar Vertex S+ 450W',
    category: 'panels',
    description: '210mm cells with multi-busbar technology. Ideal for residential rooftops. High shade tolerance.',
    price: 189.99,
    inventory: 800,
    rating: 4.6,
    metadata: { wattage: 450, efficiency: 21.1, warranty_years: 25, weight_kg: 21.8, dimensions: '1762×1134×30mm' },
  },
  {
    id: PRODUCT_IDS.inverter_sma,
    name: 'SMA Sunny Tripower 10.0',
    category: 'inverters',
    description: '10 kW three-phase string inverter with SMA Smart Connected auto-diagnostics. Integrated WiFi.',
    price: 2150.00,
    inventory: 120,
    rating: 4.9,
    metadata: { power_kw: 10, phases: 3, mppt_trackers: 2, efficiency_max: 98.4, warranty_years: 10 },
  },
  {
    id: PRODUCT_IDS.inverter_huawei,
    name: 'Huawei SUN2000-5KTL-M1',
    category: 'inverters',
    description: '5 kW single-phase inverter with AI-powered MPPT, built-in PID recovery. Battery-ready.',
    price: 1350.00,
    inventory: 200,
    rating: 4.7,
    metadata: { power_kw: 5, phases: 1, mppt_trackers: 2, efficiency_max: 98.6, warranty_years: 10 },
  },
  {
    id: PRODUCT_IDS.inverter_enphase,
    name: 'Enphase IQ8M Microinverter',
    category: 'inverters',
    description: '330 VA microinverter with grid-forming capability. Per-panel MPPT. 25-year warranty.',
    price: 189.00,
    inventory: 1000,
    rating: 4.8,
    metadata: { power_va: 330, type: 'microinverter', efficiency_max: 97.5, warranty_years: 25 },
  },
  {
    id: PRODUCT_IDS.battery_tesla,
    name: 'Tesla Powerwall 3',
    category: 'batteries',
    description: '13.5 kWh lithium-ion battery with integrated inverter. Whole-home backup. Storm Watch feature.',
    price: 8500.00,
    inventory: 45,
    rating: 4.8,
    metadata: { capacity_kwh: 13.5, power_kw: 11.5, round_trip_efficiency: 90, warranty_years: 10, cycles: 4000 },
  },
  {
    id: PRODUCT_IDS.battery_byd,
    name: 'BYD Battery-Box HVM 11.0',
    category: 'batteries',
    description: '11.04 kWh modular lithium-iron-phosphate battery. Scalable to 22.08 kWh. Cobalt-free chemistry.',
    price: 6200.00,
    inventory: 80,
    rating: 4.6,
    metadata: { capacity_kwh: 11.04, power_kw: 5, round_trip_efficiency: 95.3, warranty_years: 10, modules: 4 },
  },
  {
    id: PRODUCT_IDS.charger_wallbox,
    name: 'Wallbox Pulsar Plus 48A',
    category: 'ev-chargers',
    description: '11.5 kW Level 2 EV charger with WiFi, Bluetooth, and solar charging integration via myWallbox app.',
    price: 649.00,
    inventory: 150,
    rating: 4.5,
    metadata: { power_kw: 11.5, amperage: 48, connector: 'J1772', smart: true, solar_integration: true },
  },
  {
    id: PRODUCT_IDS.monitor_sense,
    name: 'Sense Energy Monitor',
    category: 'monitoring',
    description: 'Real-time home energy monitor with solar production tracking. ML-based device detection. Compatible with Alexa/Google.',
    price: 299.00,
    inventory: 200,
    rating: 4.3,
    metadata: { phases: 2, solar_support: true, app: 'iOS/Android', api: true },
  },
  {
    id: PRODUCT_IDS.kit_home,
    name: 'Apolaki Home Solar Kit 5kW',
    category: 'kits',
    description: 'Complete residential kit: 12× Trina 450W panels, 1× Huawei 5kW inverter, mounting hardware, cabling, and commissioning guide.',
    price: 5999.00,
    inventory: 60,
    rating: 4.9,
    metadata: { capacity_kw: 5.4, panels: 12, inverter: 'Huawei SUN2000-5KTL', includes_mounting: true },
  },
  {
    id: PRODUCT_IDS.kit_commercial,
    name: 'Apolaki Commercial Solar Kit 25kW',
    category: 'kits',
    description: 'Commercial-grade kit: 44× JinkoSolar 580W panels, 1× SMA Tripower 25kW inverter, racking system, monitoring gateway.',
    price: 24500.00,
    inventory: 20,
    rating: 4.8,
    metadata: { capacity_kw: 25.52, panels: 44, inverter: 'SMA STP 25000TL', includes_monitoring: true },
  },
];

export const name = 'marketplace';

export async function seed() {
  const results = [];

  for (const p of PRODUCTS) {
    const res = await query(
      `INSERT INTO marketplace_products
         (id, name, category, description, price, currency, inventory, rating, active, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'USD',$6,$7,true,$8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id, name`,
      [p.id, p.name, p.category, p.description, p.price, p.inventory, p.rating, JSON.stringify(p.metadata)]
    );

    results.push({
      name: p.name,
      category: p.category,
      price: `$${p.price}`,
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(PRODUCT_IDS);
  await query(`DELETE FROM marketplace_products WHERE id = ANY($1::uuid[])`, [ids]);
}
