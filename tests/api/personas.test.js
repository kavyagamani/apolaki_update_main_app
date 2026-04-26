/**
 * API Integration Tests — Persona-Based Flows (End-to-End)
 *
 * Tests the complete persona flows:
 *   1. User (customer/prosumer) — onboarding, dashboard, trading prefs
 *   2. Dealer — commissioning installations
 *   3. Operations — alert triage, resolving maintenance
 *   4. Admin — user management, role assignment, audit logs
 *   5. Super Admin — break-glass activation, action logging, session end
 *
 * @tags api, personas, e2e
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

// ============================================================================
// 1. USER PERSONA (Prosumer)
// ============================================================================
describe('Persona › User (Customer/Prosumer)', function () {
  afterEach(function () {
    clearAuth();
  });

  it('should login as homeowner and get persona info', async function () {
    await login(config.users.homeowner);
    const res = await client.get('/api/personas/me');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('role', 'customer');
    expect(res.data.data.permissions).to.include('view:dashboard');
    expect(res.data.data.permissions).to.include('trade:energy');
  });

  it('should be able to view own installations', async function () {
    await login(config.users.homeowner);
    const res = await client.get(`/api/users/${config.ids.users.homeowner}/installations`);

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
  });

  it('should be able to view marketplace products', async function () {
    await login(config.users.homeowner);
    const res = await client.get('/api/marketplace/products');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
  });

  it('should NOT be able to access admin user list', async function () {
    await login(config.users.homeowner);
    const res = await client.get('/api/personas/admin/users');

    expect(res.status).to.equal(403);
    expect(res.data).to.have.property('error');
  });

  it('should NOT be able to access dealer commission endpoint', async function () {
    await login(config.users.homeowner);
    const res = await client.post('/api/personas/dealer/commission', {
      ownerId: config.ids.users.homeowner,
      name: 'Unauthorized Install',
    });

    expect(res.status).to.equal(403);
  });

  it('should NOT be able to activate break-glass', async function () {
    await login(config.users.homeowner);
    const res = await client.post('/api/personas/superadmin/break-glass', {
      justification: 'Attempting unauthorized access',
    });

    expect(res.status).to.equal(403);
  });
});

// ============================================================================
// 2. DEALER PERSONA
// ============================================================================
describe('Persona › Dealer', function () {
  afterEach(function () {
    clearAuth();
  });

  it('should login as dealer and get persona info', async function () {
    await login(config.users.dealer);
    const res = await client.get('/api/personas/me');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('role', 'dealer');
    expect(res.data.data.permissions).to.include('commission:installation');
  });

  it('should commission a new installation for a homeowner', async function () {
    await login(config.users.dealer);
    const res = await client.post('/api/personas/dealer/commission', {
      ownerId: config.ids.users.homeowner,
      name: 'Dealer Commissioned Solar 5kW',
      address: '456 Solar Lane',
      city: 'Quezon City',
      state: 'Metro Manila',
      zipCode: '1100',
      latitude: 14.6760,
      longitude: 121.0437,
      capacity: 5.0,
      panelCount: 12,
      inverterType: 'SolarEdge SE5000',
    });

    expect(res.status).to.equal(201);
    expect(res.data).to.have.property('data');
    expect(res.data.data).to.have.property('name', 'Dealer Commissioned Solar 5kW');
    expect(res.data.message).to.equal('Installation commissioned successfully');
  });

  it('should see dealer installations', async function () {
    await login(config.users.dealer);
    const res = await client.get('/api/personas/dealer/installations');

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('data');
    expect(res.data.data).to.be.an('array');
  });

  it('should NOT be able to access admin user list', async function () {
    await login(config.users.dealer);
    const res = await client.get('/api/personas/admin/users');

    expect(res.status).to.equal(403);
  });

  it('should NOT be able to resolve operations alerts', async function () {
    await login(config.users.dealer);
    const res = await client.put('/api/personas/operations/resolve/fake-id', {
      notes: 'Dealer trying to resolve',
    });

    expect(res.status).to.equal(403);
  });
});

// ============================================================================
// 3. OPERATIONS PERSONA
// ============================================================================
describe('Persona › Operations', function () {
  afterEach(function () {
    clearAuth();
  });

  it('should login as operations and get persona info', async function () {
    await login(config.users.operations);
    const res = await client.get('/api/personas/me');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('role', 'operations');
    expect(res.data.data.permissions).to.include('view:alerts');
    expect(res.data.data.permissions).to.include('resolve:alerts');
  });

  it('should view operations alerts (maintenance items)', async function () {
    await login(config.users.operations);
    const res = await client.get('/api/personas/operations/alerts');

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('data');
    expect(res.data.data).to.be.an('array');
  });

  it('should NOT be able to commission installations', async function () {
    await login(config.users.operations);
    const res = await client.post('/api/personas/dealer/commission', {
      ownerId: config.ids.users.homeowner,
      name: 'Ops trying to commission',
    });

    expect(res.status).to.equal(403);
  });

  it('should NOT be able to manage users', async function () {
    await login(config.users.operations);
    const res = await client.get('/api/personas/admin/users');

    expect(res.status).to.equal(403);
  });
});

// ============================================================================
// 4. ADMIN PERSONA
// ============================================================================
describe('Persona › Admin', function () {
  afterEach(function () {
    clearAuth();
  });

  it('should login as admin and get persona info', async function () {
    await login(config.users.admin);
    const res = await client.get('/api/personas/me');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('role', 'admin');
    expect(res.data.data.permissions).to.include('manage:users');
    expect(res.data.data.permissions).to.include('assign:roles');
  });

  it('should list all users', async function () {
    await login(config.users.admin);
    const res = await client.get('/api/personas/admin/users');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
    expect(res.data.data.length).to.be.at.least(8); // 8 seeded users
  });

  it('should view available roles', async function () {
    await login(config.users.admin);
    const res = await client.get('/api/personas/roles');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
    expect(res.data.data.length).to.be.at.least(5);
  });

  it('should assign a role to a user', async function () {
    await login(config.users.admin);

    // Change the viewer user to 'dealer'
    const res = await client.put(`/api/personas/admin/users/${config.ids.users.viewer}/role`, {
      role: 'dealer',
    });

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('role', 'dealer');

    // Revert it back
    await client.put(`/api/personas/admin/users/${config.ids.users.viewer}/role`, {
      role: 'customer',
    });
  });

  it('should NOT be able to assign superadmin role', async function () {
    await login(config.users.admin);
    const res = await client.put(`/api/personas/admin/users/${config.ids.users.viewer}/role`, {
      role: 'superadmin',
    });

    expect(res.status).to.equal(403);
    expect(res.data.error).to.include('superadmin');
  });

  it('should view audit logs', async function () {
    await login(config.users.admin);
    const res = await client.get('/api/personas/admin/audit-logs');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
  });

  it('should NOT be able to activate break-glass', async function () {
    await login(config.users.admin);
    const res = await client.post('/api/personas/superadmin/break-glass', {
      justification: 'Admin trying to break glass',
    });

    expect(res.status).to.equal(403);
  });
});

// ============================================================================
// 5. SUPER ADMIN PERSONA (BREAK-GLASS)
// ============================================================================
describe('Persona › Super Admin (Break-Glass)', function () {
  let breakGlassSessionId;

  afterEach(function () {
    clearAuth();
  });

  it('should login as superadmin and get persona info', async function () {
    await login(config.users.superadmin);
    const res = await client.get('/api/personas/me');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('role', 'superadmin');
    expect(res.data.data.permissions).to.include('all');
    expect(res.data.data.permissions).to.include('break-glass:activate');
  });

  it('should reject break-glass without justification', async function () {
    await login(config.users.superadmin);
    const res = await client.post('/api/personas/superadmin/break-glass', {
      justification: 'short',
    });

    expect(res.status).to.equal(400);
    expect(res.data.error).to.include('Justification');
  });

  it('should activate a break-glass session with proper justification', async function () {
    await login(config.users.superadmin);
    const res = await client.post('/api/personas/superadmin/break-glass', {
      justification: 'Emergency: Critical security incident detected in production - investigating unauthorized data access',
    });

    expect(res.status).to.equal(201);
    expect(res.data).to.have.property('data');
    expect(res.data.data).to.have.property('sessionId');
    expect(res.data.data).to.have.property('expiresAt');
    expect(res.data.data.durationMinutes).to.equal(60);

    breakGlassSessionId = res.data.data.sessionId;
  });

  it('should reject duplicate break-glass activation', async function () {
    await login(config.users.superadmin);
    const res = await client.post('/api/personas/superadmin/break-glass', {
      justification: 'Another emergency while one is active',
    });

    expect(res.status).to.equal(409);
    expect(res.data.error).to.include('active');
  });

  it('should record an action during break-glass session', async function () {
    await login(config.users.superadmin);
    const res = await client.post(`/api/personas/superadmin/break-glass/${breakGlassSessionId}/action`, {
      action: 'DISABLE_USER_ACCOUNT',
      details: 'Disabled compromised user account ID=xxx pending investigation',
    });

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('data');
  });

  it('should end the break-glass session', async function () {
    await login(config.users.superadmin);
    const res = await client.post(`/api/personas/superadmin/break-glass/${breakGlassSessionId}/end`);

    expect(res.status).to.equal(200);
    expect(res.data.data).to.have.property('status', 'ended');
    expect(res.data.data).to.have.property('ended_at');
  });

  it('should list break-glass sessions (audit trail)', async function () {
    await login(config.users.superadmin);
    const res = await client.get('/api/personas/superadmin/break-glass');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
    expect(res.data.data.length).to.be.at.least(1);

    // Verify our session is in the list with actions
    const ourSession = res.data.data.find(s => s.id === breakGlassSessionId);
    expect(ourSession).to.exist;
    expect(ourSession.actions_taken).to.be.an('array');
    expect(ourSession.actions_taken.length).to.be.at.least(1);
  });

  it('superadmin should also have access to admin endpoints', async function () {
    await login(config.users.superadmin);
    const res = await client.get('/api/personas/admin/users');

    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
  });

  it('superadmin should be able to assign superadmin role', async function () {
    await login(config.users.superadmin);

    // Temporarily promote trader to superadmin, then revert
    const res = await client.put(`/api/personas/admin/users/${config.ids.users.trader}/role`, {
      role: 'superadmin',
    });
    expect(res.status).to.equal(200);
    expect(res.data.data.role).to.equal('superadmin');

    // Revert
    await client.put(`/api/personas/admin/users/${config.ids.users.trader}/role`, {
      role: 'customer',
    });
  });
});

// ============================================================================
// 6. CROSS-PERSONA ACCESS CONTROL MATRIX
// ============================================================================
describe('Persona › Access Control Matrix', function () {
  afterEach(function () {
    clearAuth();
  });

  const endpoints = [
    { method: 'get', path: '/api/personas/dealer/installations', allowedRoles: ['dealer', 'installer', 'admin', 'superadmin'] },
    { method: 'get', path: '/api/personas/operations/alerts', allowedRoles: ['operations', 'admin', 'superadmin'] },
    { method: 'get', path: '/api/personas/admin/users', allowedRoles: ['admin', 'superadmin'] },
    { method: 'get', path: '/api/personas/admin/audit-logs', allowedRoles: ['admin', 'superadmin'] },
  ];

  const testUsers = [
    { key: 'homeowner', role: 'customer' },
    { key: 'dealer', role: 'dealer' },
    { key: 'operations', role: 'operations' },
    { key: 'admin', role: 'admin' },
    { key: 'superadmin', role: 'superadmin' },
  ];

  for (const ep of endpoints) {
    for (const tu of testUsers) {
      const shouldAllow = ep.allowedRoles.includes(tu.role);
      const label = shouldAllow
        ? `should ALLOW ${tu.role} to ${ep.method.toUpperCase()} ${ep.path}`
        : `should DENY ${tu.role} from ${ep.method.toUpperCase()} ${ep.path}`;

      it(label, async function () {
        await login(config.users[tu.key]);
        const res = await client[ep.method](ep.path);

        if (shouldAllow) {
          expect(res.status).to.be.oneOf([200, 201]);
        } else {
          expect(res.status).to.equal(403);
        }
      });
    }
  }
});

// ============================================================================
// 7. UNAUTHENTICATED ACCESS
// ============================================================================
describe('Persona › Unauthenticated Access', function () {
  before(function () {
    clearAuth();
  });

  it('should deny access to persona info without token', async function () {
    const res = await client.get('/api/personas/me');
    expect(res.status).to.equal(401);
  });

  it('should deny access to admin users without token', async function () {
    const res = await client.get('/api/personas/admin/users');
    expect(res.status).to.equal(401);
  });

  it('should deny break-glass activation without token', async function () {
    const res = await client.post('/api/personas/superadmin/break-glass', {
      justification: 'No auth attempt',
    });
    expect(res.status).to.equal(401);
  });
});
