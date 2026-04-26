/**
 * Cucumber step definitions — Marketplace
 */

import { Then, When } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'node:assert/strict';

const API = process.env.API_BASE_URL || 'http://localhost:3001';

When('I request all marketplace products', async function () {
  this.response = await axios.get(`${API}/api/marketplace/products`, { validateStatus: () => true });
});

When('I request products in category {string}', async function (category) {
  this.response = await axios.get(`${API}/api/marketplace/products/category/${category}`, {
    validateStatus: () => true,
  });
});

When('I request product {string}', async function (id) {
  this.response = await axios.get(`${API}/api/marketplace/products/${id}`, {
    validateStatus: () => true,
  });
});

Then('the response should contain at least {int} products', function (min) {
  assert.ok(Array.isArray(this.response.data.data));
  assert.ok(this.response.data.data.length >= min, `Expected ≥ ${min} products, got ${this.response.data.data.length}`);
});

Then('all returned products should have category {string}', function (category) {
  for (const p of this.response.data.data) {
    assert.equal(p.category, category, `Product "${p.name}" has category "${p.category}" instead of "${category}"`);
  }
});
