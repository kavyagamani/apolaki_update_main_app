/**
 * Cucumber step definitions — Authentication
 */

import { Before, Given, Then, When } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'node:assert/strict';

const API = process.env.API_BASE_URL || 'http://localhost:3001';

Before(function () {
  this.response = null;
  this.token = null;
});

// ─── Given ────────────────────────────────────────────────────────────

Given('the API service is running', async function () {
  const res = await axios.get(`${API}/api/health`, { validateStatus: () => true });
  assert.equal(res.status, 200, 'API health check failed');
});

Given('I am logged in as {string} with password {string}', async function (email, password) {
  const res = await axios.post(`${API}/api/auth/login`, { email, password });
  assert.equal(res.status, 200);
  this.token = res.data.token;
  this.userId = res.data.user.id;
});

Given('a user with email {string} already exists', function (_email) {
  // No-op — the user is seeded
});

// ─── When — Auth ─────────────────────────────────────────────────────

When('I login with email {string} and password {string}', async function (email, password) {
  this.response = await axios.post(`${API}/api/auth/login`, { email, password }, { validateStatus: () => true });
});

When('I signup with email {string} and password {string}', async function (email, password) {
  const resolvedEmail = email.replace('<timestamp>', Date.now());
  this.response = await axios.post(
    `${API}/api/auth/signup`,
    { email: resolvedEmail, password, firstName: 'Cucumber', lastName: 'Test' },
    { validateStatus: () => true }
  );
});

When('I login with empty credentials', async function () {
  this.response = await axios.post(`${API}/api/auth/login`, {}, { validateStatus: () => true });
});

// ─── Then ─────────────────────────────────────────────────────────────

Then('I should receive a {int} status code', function (statusCode) {
  assert.equal(this.response.status, statusCode);
});

Then('the response should contain a JWT token', function () {
  assert.ok(this.response.data.token, 'Expected a token in response');
});

Then('the response should contain user details', function () {
  assert.ok(this.response.data.user, 'Expected user object in response');
  assert.ok(this.response.data.user.email, 'Expected user.email');
});

Then('the response should contain an error message', function () {
  assert.ok(this.response.data.error, 'Expected an error message');
});
