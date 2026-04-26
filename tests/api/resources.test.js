/**
 * API Integration Tests — Marketplace, Contracts, Assessments, Finance, Maintenance
 * @tags api, marketplace, contracts, assessments, finance
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

// ─── Marketplace ──────────────────────────────────────────────────────
describe('API › Marketplace', function () {
  describe('GET /api/marketplace/products', function () {
    it('@smoke should return all products', async function () {
      const res = await client.get('/api/marketplace/products');

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
      expect(res.data.data.length).to.be.at.least(10);
    });
  });

  describe('GET /api/marketplace/products/:id', function () {
    it('should return a single product', async function () {
      const res = await client.get(`/api/marketplace/products/${config.ids.products.panel_jinko}`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.have.property('name');
    });

    it('should return 404 for non-existent product', async function () {
      const res = await client.get('/api/marketplace/products/99999999-9999-9999-9999-999999999999');

      expect(res.status).to.equal(404);
    });
  });

  describe('GET /api/marketplace/products/category/:category', function () {
    it('should filter products by category', async function () {
      const res = await client.get('/api/marketplace/products/category/panels');

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
      // All returned items should be in the 'panels' category
      for (const product of res.data.data) {
        expect(product.category).to.equal('panels');
      }
    });
  });
});

// ─── Contracts ────────────────────────────────────────────────────────
describe('API › Contracts', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  describe('POST /api/contracts', function () {
    it('should create a contract', async function () {
      const res = await client.post('/api/contracts', {
        userId: config.ids.users.homeowner,
        contractType: 'E2E Test Contract',
        startDate: '2026-01-01',
        endDate: '2036-01-01',
        termMonths: 120,
        amount: 5000.0,
        currency: 'USD',
        metadata: { test: true },
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
    });
  });

  describe('GET /api/users/:userId/contracts', function () {
    it('@smoke should return contracts for a user', async function () {
      const res = await client.get(`/api/users/${config.ids.users.homeowner}/contracts`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
      expect(res.data.data.length).to.be.at.least(1);
    });
  });
});

// ─── Assessments ──────────────────────────────────────────────────────
describe('API › Assessments', function () {
  let createdId;

  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  describe('POST /api/assessments', function () {
    it('should create an assessment', async function () {
      const res = await client.post('/api/assessments', {
        userId: config.ids.users.homeowner,
        address: '999 E2E Test Street',
        city: 'Manila',
        state: 'Metro Manila',
        zipCode: '1000',
        roofCondition: 'excellent',
        roofArea: 100,
        annualUsage: 12000,
        sunExposure: 'full',
        obstructionLevel: 'none',
        recommendedCapacity: 10,
        estimatedCost: 500000,
        savingsEstimate: { monthly: 4000, annual: 48000 },
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
      createdId = res.data.data.id;
    });
  });

  describe('GET /api/assessments/:id', function () {
    it('should retrieve the created assessment', async function () {
      if (!createdId) this.skip();

      const res = await client.get(`/api/assessments/${createdId}`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.have.property('address');
    });
  });

  describe('GET /api/users/:userId/assessments', function () {
    it('@smoke should return assessments for a user', async function () {
      const res = await client.get(`/api/users/${config.ids.users.homeowner}/assessments`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
    });
  });
});

// ─── Finance ──────────────────────────────────────────────────────────
describe('API › Finance', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  describe('POST /api/finance/transactions', function () {
    it('should create a financial transaction', async function () {
      const res = await client.post('/api/finance/transactions', {
        userId: config.ids.users.homeowner,
        transactionId: `TXN-E2E-${Date.now()}`,
        amount: 999.99,
        currency: 'PHP',
        type: 'payment',
        category: 'testing',
        transactionDate: new Date().toISOString(),
        description: 'E2E test transaction',
        metadata: { test: true },
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
    });
  });

  describe('GET /api/users/:userId/finance/transactions', function () {
    it('@smoke should return transactions', async function () {
      const res = await client.get(`/api/users/${config.ids.users.homeowner}/finance/transactions`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
    });
  });

  describe('GET /api/users/:userId/finance/summary', function () {
    it('should return a finance summary', async function () {
      const res = await client.get(`/api/users/${config.ids.users.homeowner}/finance/summary`);

      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('data');
    });
  });
});

// ─── Maintenance ──────────────────────────────────────────────────────
describe('API › Maintenance', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  describe('POST /api/installations/:id/maintenance', function () {
    it('should create a maintenance log', async function () {
      const res = await client.post(
        `/api/installations/${config.ids.installations.makati_residential}/maintenance`,
        {
          maintenanceType: 'inspection',
          description: 'E2E test maintenance entry',
          performedDate: new Date().toISOString(),
          cost: 1500.0,
          technician: 'Test Technician',
          notes: 'Automated E2E test',
        }
      );

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
    });
  });

  describe('GET /api/installations/:id/maintenance', function () {
    it('@smoke should return maintenance logs', async function () {
      const res = await client.get(
        `/api/installations/${config.ids.installations.makati_residential}/maintenance`
      );

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
    });
  });
});
