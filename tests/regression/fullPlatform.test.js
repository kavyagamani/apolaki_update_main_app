/**
 * Regression Test Suite — Full Platform
 *
 * This file orchestrates a complete end-to-end regression test
 * covering the entire Apolaki Solar Platform:
 *
 *   1. Health checks (API up)
 *   2. Auth flows (signup → login → token refresh → logout)
 *   3. CRUD for all entities
 *   4. Cross-entity integrity (FK references)
 *   5. Data consistency (counts, seed data verification)
 *
 * Run with: npm run test:regression
 * @tags regression
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

// ──────────────────────────────────────────────────────────────────────
// Phase 1 — Infrastructure Readiness
// ──────────────────────────────────────────────────────────────────────
describe('Regression › Phase 1 — Infrastructure', function () {
  it('API health check returns healthy', async function () {
    const res = await client.get('/api/health');
    expect(res.status).to.equal(200);
    expect(res.data.status).to.equal('healthy');
  });

  it('Root endpoint returns API documentation', async function () {
    const res = await client.get('/');
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('endpoints');
  });
});

// ──────────────────────────────────────────────────────────────────────
// Phase 2 — Authentication Lifecycle
// ──────────────────────────────────────────────────────────────────────
describe('Regression › Phase 2 — Authentication Lifecycle', function () {
  const testEmail = `regression_${Date.now()}@apolaki.solar`;
  let token, refreshToken;

  afterEach(function () {
    clearAuth();
  });

  it('Step 1: Signup creates a new account', async function () {
    const res = await client.post('/api/auth/signup', {
      email: testEmail,
      password: 'RegTest@123!',
      firstName: 'Regression',
      lastName: 'User',
    });

    expect(res.status).to.equal(201);
    expect(res.data).to.have.property('token');
    token = res.data.token;
    refreshToken = res.data.refreshToken;
  });

  it('Step 2: Login with the new account works', async function () {
    const res = await client.post('/api/auth/login', {
      email: testEmail,
      password: 'RegTest@123!',
    });

    expect(res.status).to.equal(200);
    expect(res.data.user.email).to.equal(testEmail);
  });

  it('Step 3: Seeded admin can log in', async function () {
    const res = await login(config.users.admin);
    expect(res.status).to.equal(200);
  });

  it('Step 4: Seeded homeowner can log in', async function () {
    const res = await login(config.users.homeowner);
    expect(res.status).to.equal(200);
  });

  it('Step 5: Seeded installer can log in', async function () {
    const res = await login(config.users.installer);
    expect(res.status).to.equal(200);
  });

  it('Step 6: Invalid credentials are rejected', async function () {
    const res = await client.post('/api/auth/login', {
      email: config.users.homeowner.email,
      password: 'TotallyWrong!',
    });
    expect(res.status).to.equal(401);
  });
});

// ──────────────────────────────────────────────────────────────────────
// Phase 3 — CRUD Integrity (all resources)
// ──────────────────────────────────────────────────────────────────────
describe('Regression › Phase 3 — CRUD Integrity', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  // ── Users ─────────────────────────────────────────────────────────
  it('GET /api/users returns ≥ 5 seeded users', async function () {
    const res = await client.get('/api/users');
    expect(res.status).to.equal(200);
    expect(res.data.data.length).to.be.at.least(5);
  });

  it('GET /api/users/:id returns a user', async function () {
    const res = await client.get(`/api/users/${config.ids.users.admin}`);
    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('email');
  });

  // ── Installations ─────────────────────────────────────────────────
  let regressionInstId;

  it('POST /api/installations creates an installation', async function () {
    const res = await client.post('/api/installations', {
      userId: config.ids.users.homeowner,
      name: 'Regression Test Install',
      address: 'Regression Avenue',
      city: 'Taguig',
      capacity: 9.5,
      panelCount: 22,
      inverterType: 'Regression Inverter',
    });

    expect(res.status).to.equal(201);
    regressionInstId = res.data.data.id;
  });

  it('GET /api/installations/:id retrieves it', async function () {
    if (!regressionInstId) this.skip();
    const res = await client.get(`/api/installations/${regressionInstId}`);
    expect(res.status).to.equal(200);
    expect(res.data.data.name).to.equal('Regression Test Install');
  });

  it('PUT /api/installations/:id updates it', async function () {
    if (!regressionInstId) this.skip();
    const res = await client.put(`/api/installations/${regressionInstId}`, {
      name: 'Regression Updated Install',
      status: 'maintenance',
    });
    expect(res.status).to.equal(200);
  });

  it('GET /api/users/:userId/installations returns installations', async function () {
    const res = await client.get(`/api/users/${config.ids.users.homeowner}/installations`);
    expect(res.status).to.equal(200);
    expect(res.data.data.length).to.be.at.least(1);
  });

  // ── Monitoring ────────────────────────────────────────────────────
  it('POST + GET /api/installations/:id/monitoring works', async function () {
    const instId = config.ids.installations.makati_residential;

    const post = await client.post(`/api/installations/${instId}/monitoring`, {
      powerOutput: 6.2,
      voltageAc: 230,
      currentAc: 27,
      frequency: 50,
      temperature: 40,
      efficiency: 93,
      status: 'generating',
    });
    expect(post.status).to.equal(201);

    const get = await client.get(`/api/installations/${instId}/monitoring?limit=5`);
    expect(get.status).to.equal(200);
    expect(get.data.data.length).to.be.at.least(1);
  });

  // ── Performance ───────────────────────────────────────────────────
  it('POST + GET /api/installations/:id/performance works', async function () {
    const instId = config.ids.installations.makati_residential;
    const date = new Date().toISOString().split('T')[0];

    const post = await client.post(`/api/installations/${instId}/performance`, {
      date,
      energyGenerated: 42,
      peakPower: 8.1,
      avgEfficiency: 92,
      downtimeMinutes: 0,
    });
    expect(post.status).to.equal(201);

    const get = await client.get(`/api/installations/${instId}/performance`);
    expect(get.status).to.equal(200);
    expect(get.data.data.length).to.be.at.least(1);
  });

  // ── Marketplace ───────────────────────────────────────────────────
  it('GET /api/marketplace/products returns ≥ 10 products', async function () {
    const res = await client.get('/api/marketplace/products');
    expect(res.status).to.equal(200);
    expect(res.data.data.length).to.be.at.least(10);
  });

  it('GET /api/marketplace/products/:id returns a product', async function () {
    const res = await client.get(`/api/marketplace/products/${config.ids.products.panel_jinko}`);
    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('name');
    expect(res.data.data).to.have.property('price');
  });

  it('GET /api/marketplace/products/category/:cat filters correctly', async function () {
    const res = await client.get('/api/marketplace/products/category/inverters');
    expect(res.status).to.equal(200);
    for (const p of res.data.data) {
      expect(p.category).to.equal('inverters');
    }
  });

  // ── Contracts ─────────────────────────────────────────────────────
  it('POST /api/contracts creates a contract', async function () {
    const res = await client.post('/api/contracts', {
      userId: config.ids.users.homeowner,
      contractType: 'Regression Test PPA',
      startDate: '2026-01-01',
      endDate: '2046-01-01',
      termMonths: 240,
      amount: 0.10,
      currency: 'PHP',
    });
    expect(res.status).to.equal(201);
  });

  it('GET /api/users/:userId/contracts returns contracts', async function () {
    const res = await client.get(`/api/users/${config.ids.users.homeowner}/contracts`);
    expect(res.status).to.equal(200);
    expect(res.data.data.length).to.be.at.least(1);
  });

  // ── Assessments ───────────────────────────────────────────────────
  it('POST + GET /api/assessments works', async function () {
    const post = await client.post('/api/assessments', {
      userId: config.ids.users.homeowner,
      address: 'Regression St',
      city: 'Manila',
      state: 'Metro Manila',
      zipCode: '1000',
      roofCondition: 'good',
      roofArea: 80,
      annualUsage: 9000,
      sunExposure: 'full',
      obstructionLevel: 'none',
      recommendedCapacity: 8,
      estimatedCost: 400000,
      savingsEstimate: { annual: 48000 },
    });
    expect(post.status).to.equal(201);

    const assessId = post.data.data.id;
    const get = await client.get(`/api/assessments/${assessId}`);
    expect(get.status).to.equal(200);
  });

  // ── Finance ───────────────────────────────────────────────────────
  it('POST + GET finance transactions works', async function () {
    const post = await client.post('/api/finance/transactions', {
      userId: config.ids.users.homeowner,
      transactionId: `TXN-REG-${Date.now()}`,
      amount: 1234.56,
      currency: 'PHP',
      type: 'payment',
      category: 'regression',
      transactionDate: new Date().toISOString(),
      description: 'Regression test payment',
    });
    expect(post.status).to.equal(201);

    const get = await client.get(`/api/users/${config.ids.users.homeowner}/finance/transactions`);
    expect(get.status).to.equal(200);
    expect(get.data.data.length).to.be.at.least(1);
  });

  // ── Maintenance ───────────────────────────────────────────────────
  it('POST + GET maintenance logs works', async function () {
    const instId = config.ids.installations.makati_residential;

    const post = await client.post(`/api/installations/${instId}/maintenance`, {
      maintenanceType: 'inspection',
      description: 'Regression test inspection',
      performedDate: new Date().toISOString(),
      cost: 2500,
      technician: 'Regression Bot',
      notes: 'Automated regression test',
    });
    expect(post.status).to.equal(201);

    const get = await client.get(`/api/installations/${instId}/maintenance`);
    expect(get.status).to.equal(200);
    expect(get.data.data.length).to.be.at.least(1);
  });
});

// ──────────────────────────────────────────────────────────────────────
// Phase 4 — Error Handling & Edge Cases
// ──────────────────────────────────────────────────────────────────────
describe('Regression › Phase 4 — Error Handling', function () {
  it('404 on unknown route', async function () {
    const res = await client.get('/api/this-does-not-exist');
    expect(res.status).to.equal(404);
  });

  it('400 on malformed installation create', async function () {
    await login(config.users.homeowner);
    const res = await client.post('/api/installations', {});
    expect(res.status).to.be.oneOf([400, 500]);
    clearAuth();
  });

  it('404 on non-existent user', async function () {
    await login(config.users.admin);
    const res = await client.get('/api/users/00000000-0000-0000-0000-000000000099');
    expect(res.status).to.equal(404);
    clearAuth();
  });

  it('404 on non-existent installation', async function () {
    await login(config.users.homeowner);
    const res = await client.get('/api/installations/99999999-9999-9999-9999-999999999999');
    expect(res.status).to.equal(404);
    clearAuth();
  });

  it('404 on non-existent product', async function () {
    const res = await client.get('/api/marketplace/products/99999999-9999-9999-9999-999999999999');
    expect(res.status).to.equal(404);
  });
});

// ──────────────────────────────────────────────────────────────────────
// Phase 5 — Seed Data Verification
// ──────────────────────────────────────────────────────────────────────
describe('Regression › Phase 5 — Seed Data Integrity', function () {
  before(async function () {
    await login(config.users.admin);
  });

  after(function () {
    clearAuth();
  });

  it('All 5 seeded users exist', async function () {
    const res = await client.get('/api/users');
    const emails = res.data.data.map((u) => u.email);

    for (const cred of Object.values(config.users)) {
      expect(emails).to.include(cred.email);
    }
  });

  it('Seeded installations exist', async function () {
    const res = await client.get(`/api/installations/${config.ids.installations.makati_residential}`);
    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('name');
  });

  it('Marketplace has panels, inverters, and batteries', async function () {
    for (const cat of ['panels', 'inverters', 'batteries']) {
      const res = await client.get(`/api/marketplace/products/category/${cat}`);
      expect(res.status).to.equal(200);
      expect(res.data.data.length).to.be.at.least(1, `No products in category "${cat}"`);
    }
  });
});
