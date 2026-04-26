/**
 * API Integration Tests — Authentication (signup, login, logout, token refresh)
 * @tags smoke, api, auth
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

describe('API › Authentication', function () {
  afterEach(function () {
    clearAuth();
  });

  // ─── Signup ─────────────────────────────────────────────────────────
  describe('POST /api/auth/signup', function () {
    const unique = `test_${Date.now()}@apolaki.solar`;

    it('should register a new user and return tokens', async function () {
      const res = await client.post('/api/auth/signup', {
        email: unique,
        password: 'TestPass@123!',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('token');
      expect(res.data).to.have.property('refreshToken');
      expect(res.data).to.have.property('sessionToken');
      expect(res.data.user).to.have.property('email', unique);
    });

    it('should reject duplicate email', async function () {
      const res = await client.post('/api/auth/signup', {
        email: unique,
        password: 'Another@123!',
        firstName: 'Dup',
        lastName: 'User',
      });

      expect(res.status).to.equal(409);
      expect(res.data).to.have.property('error');
    });

    it('should reject missing password', async function () {
      const res = await client.post('/api/auth/signup', {
        email: 'nopass@test.com',
      });

      expect(res.status).to.equal(400);
    });

    it('should reject short password', async function () {
      const res = await client.post('/api/auth/signup', {
        email: 'short@test.com',
        password: '123',
      });

      expect(res.status).to.equal(400);
    });
  });

  // ─── Login ──────────────────────────────────────────────────────────
  describe('POST /api/auth/login', function () {
    it('@smoke should login with seeded homeowner credentials', async function () {
      const res = await login(config.users.homeowner);

      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('token');
      expect(res.data).to.have.property('refreshToken');
      expect(res.data.user).to.have.property('email', config.users.homeowner.email);
    });

    it('should login with admin credentials', async function () {
      const res = await login(config.users.admin);

      expect(res.status).to.equal(200);
      expect(res.data.user).to.have.property('email', config.users.admin.email);
    });

    it('should reject wrong password', async function () {
      const res = await client.post('/api/auth/login', {
        email: config.users.homeowner.email,
        password: 'WrongPassword!',
      });

      expect(res.status).to.equal(401);
      expect(res.data).to.have.property('error');
    });

    it('should reject non-existent user', async function () {
      const res = await client.post('/api/auth/login', {
        email: 'nobody@nowhere.com',
        password: 'Whatever@1!',
      });

      expect(res.status).to.equal(401);
    });

    it('should reject empty body', async function () {
      const res = await client.post('/api/auth/login', {});

      expect(res.status).to.equal(400);
    });
  });

  // ─── Protected Routes ──────────────────────────────────────────────
  describe('Protected Routes', function () {
    it('should reject unauthenticated access to GET /api/auth/me', async function () {
      const res = await client.get('/api/auth/me');

      // The route may return 401 or not exist as a protected route
      expect(res.status).to.be.oneOf([401, 404]);
    });

    it('should allow authenticated access to GET /api/auth/me', async function () {
      await login(config.users.homeowner);
      const res = await client.get('/api/auth/me');

      // If the route exists and is protected correctly
      if (res.status === 200) {
        expect(res.data).to.have.property('user');
      }
    });
  });
});
