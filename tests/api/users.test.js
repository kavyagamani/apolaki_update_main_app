/**
 * API Integration Tests — Users CRUD
 * @tags api, users
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

describe('API › Users', function () {
  before(async function () {
    await login(config.users.admin);
  });

  after(function () {
    clearAuth();
  });

  describe('GET /api/users', function () {
    it('@smoke should return a list of users', async function () {
      const res = await client.get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.be.an('array');
      expect(res.data.data.length).to.be.at.least(8); // seeded users
    });
  });

  describe('GET /api/users/:id', function () {
    it('should return a specific user by ID', async function () {
      const res = await client.get(`/api/users/${config.ids.users.homeowner}`);

      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.have.property('email');
    });

    it('should return 404 for non-existent user', async function () {
      const res = await client.get('/api/users/00000000-0000-0000-0000-000000000099');

      expect(res.status).to.equal(404);
    });
  });

  describe('PUT /api/users/:id', function () {
    it('should update user first and last name', async function () {
      const res = await client.put(`/api/users/${config.ids.users.viewer}`, {
        firstName: 'Carlos',
        lastName: 'Mendoza Updated',
      });

      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('data');
    });
  });
});
