/**
 * API Integration Tests — Solar Installations CRUD
 * @tags api, installations
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

describe('API › Solar Installations', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  let createdId;

  describe('POST /api/installations', function () {
    it('should create a new installation', async function () {
      const res = await client.post('/api/installations', {
        userId: config.ids.users.homeowner,
        name: 'E2E Test Installation',
        address: '999 Test Avenue',
        city: 'Manila',
        state: 'Metro Manila',
        zipCode: '1000',
        latitude: 14.5995,
        longitude: 120.9842,
        capacity: 10.0,
        panelCount: 24,
        inverterType: 'Test Inverter 10K',
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.have.property('id');
      expect(res.data.data).to.have.property('name', 'E2E Test Installation');
      createdId = res.data.data.id;
    });

    it('should reject installation without required fields', async function () {
      const res = await client.post('/api/installations', {});

      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/installations/:id', function () {
    it('@smoke should retrieve a seeded installation', async function () {
      const res = await client.get(`/api/installations/${config.ids.installations.makati_residential}`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.have.property('name');
    });

    it('should retrieve the newly created installation', async function () {
      if (!createdId) this.skip();

      const res = await client.get(`/api/installations/${createdId}`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.have.property('name', 'E2E Test Installation');
    });

    it('should return 404 for non-existent installation', async function () {
      const res = await client.get('/api/installations/99999999-9999-9999-9999-999999999999');

      expect(res.status).to.equal(404);
    });
  });

  describe('GET /api/users/:userId/installations', function () {
    it('should return installations for a user', async function () {
      const res = await client.get(`/api/users/${config.ids.users.homeowner}/installations`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
      expect(res.data.data.length).to.be.at.least(1);
    });
  });

  describe('PUT /api/installations/:id', function () {
    it('should update installation name', async function () {
      if (!createdId) this.skip();

      const res = await client.put(`/api/installations/${createdId}`, {
        name: 'E2E Test Installation Updated',
        status: 'maintenance',
      });

      expect(res.status).to.equal(200);
      expect(res.data.data).to.have.property('name', 'E2E Test Installation Updated');
    });
  });
});
