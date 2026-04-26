/**
 * Cucumber step definitions — Installations
 */

import { Given, Then, When } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'node:assert/strict';

const API = process.env.API_BASE_URL || 'http://localhost:3001';

function authHeaders(ctx) {
  return ctx.token ? { Authorization: `Bearer ${ctx.token}` } : {};
}

// ─── When ─────────────────────────────────────────────────────────────

When('I request installations for user {string}', async function (userId) {
  this.response = await axios.get(`${API}/api/users/${userId}/installations`, {
    headers: authHeaders(this),
    validateStatus: () => true,
  });
});

When('I request installation {string}', async function (id) {
  this.response = await axios.get(`${API}/api/installations/${id}`, {
    headers: authHeaders(this),
    validateStatus: () => true,
  });
});

When('I create an installation with:', async function (table) {
  const data = {};
  for (const row of table.rawTable) {
    const key = row[0].trim();
    let val = row[1].trim();
    if (!isNaN(val) && val !== '') val = Number(val);
    data[key] = val;
  }
  data.userId = this.userId;

  this.response = await axios.post(`${API}/api/installations`, data, {
    headers: authHeaders(this),
    validateStatus: () => true,
  });

  if (this.response.data?.data?.id) {
    this.createdInstallationId = this.response.data.data.id;
  }
});

Given('I create an installation with name {string}', async function (name) {
  const res = await axios.post(
    `${API}/api/installations`,
    { userId: this.userId, name, address: 'Cucumber St', capacity: 5, panelCount: 10, inverterType: 'Cucumber INV' },
    { headers: authHeaders(this), validateStatus: () => true }
  );
  this.createdInstallationId = res.data?.data?.id;
});

When('I update the installation name to {string}', async function (newName) {
  this.response = await axios.put(
    `${API}/api/installations/${this.createdInstallationId}`,
    { name: newName },
    { headers: authHeaders(this), validateStatus: () => true }
  );
});

// ─── Then ─────────────────────────────────────────────────────────────

Then('the response should contain a list of installations', function () {
  assert.ok(Array.isArray(this.response.data.data), 'Expected an array');
});

Then('the response data should have property {string}', function (prop) {
  assert.ok(
    this.response.data.data.hasOwnProperty(prop),
    `Expected property "${prop}" in response data`
  );
});

Then('the response data should have property {string} equal to {string}', function (prop, value) {
  assert.equal(this.response.data.data[prop], value);
});
