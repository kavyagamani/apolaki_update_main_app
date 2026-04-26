/**
 * Shared test configuration loaded from environment or defaults.
 * Single source of truth for all URLs, credentials, and timeouts.
 */

import 'dotenv/config';

const config = {
  // ── Service URLs ───────────────────────────────────────────────────────
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  },
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  db: {
    url: process.env.DATABASE_URL || 'postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db',
  },

  // ── Test Credentials (match seeds) ─────────────────────────────────────
  users: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@apolaki.solar',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin@12345!',
    },
    homeowner: {
      email: process.env.TEST_USER_EMAIL || 'homeowner@apolaki.solar',
      password: process.env.TEST_USER_PASSWORD || 'Solar@Home1!',
    },
    installer: {
      email: process.env.TEST_INSTALLER_EMAIL || 'installer@apolaki.solar',
      password: process.env.TEST_INSTALLER_PASSWORD || 'Install@Sun1!',
    },
    dealer: {
      email: process.env.TEST_DEALER_EMAIL || 'dealer@apolaki.solar',
      password: process.env.TEST_DEALER_PASSWORD || 'Dealer@Sun1!',
    },
    operations: {
      email: process.env.TEST_OPS_EMAIL || 'ops@apolaki.solar',
      password: process.env.TEST_OPS_PASSWORD || 'Ops@Solar1!',
    },
    superadmin: {
      email: process.env.TEST_SUPERADMIN_EMAIL || 'superadmin@apolaki.solar',
      password: process.env.TEST_SUPERADMIN_PASSWORD || 'Super@Admin1!',
    },
  },

  // ── Selenium / WebDriver ──────────────────────────────────────────────
  selenium: {
    browser: process.env.SELENIUM_BROWSER || 'chrome',
    headless: process.env.SELENIUM_HEADLESS !== 'false',
    timeout: parseInt(process.env.SELENIUM_TIMEOUT || '10000', 10),
  },

  // ── Known seeded UUIDs ─────────────────────────────────────────────────
  ids: {
    users: {
      admin:      '00000000-0000-4000-a000-000000000001',
      homeowner:  '00000000-0000-4000-a000-000000000002',
      installer:  '00000000-0000-4000-a000-000000000003',
      trader:     '00000000-0000-4000-a000-000000000004',
      viewer:     '00000000-0000-4000-a000-000000000005',
      dealer:     '00000000-0000-4000-a000-000000000006',
      operations: '00000000-0000-4000-a000-000000000007',
      superadmin: '00000000-0000-4000-a000-000000000008',
    },
    installations: {
      makati_residential: '10000000-0000-4000-a000-000000000001',
      cebu_commercial:    '10000000-0000-4000-a000-000000000002',
      davao_industrial:   '10000000-0000-4000-a000-000000000003',
    },
    products: {
      panel_jinko: '20000000-0000-4000-a000-000000000001',
    },
  },
};

export default config;
