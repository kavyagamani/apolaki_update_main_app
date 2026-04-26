/**
 * API Integration Tests — Monitoring & Performance Data
 * @tags api, monitoring, performance
 */

import { expect } from 'chai';
import client, { clearAuth, login } from '../helpers/apiClient.js';
import config from '../helpers/config.js';

const INST_ID = config.ids.installations.makati_residential;

describe('API › Monitoring Data', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  describe('POST /api/installations/:id/monitoring', function () {
    it('should record a monitoring data point', async function () {
      const res = await client.post(`/api/installations/${INST_ID}/monitoring`, {
        powerOutput: 5.42,
        voltageAc: 231.5,
        currentAc: 23.4,
        frequency: 50.01,
        temperature: 42.3,
        efficiency: 92.1,
        status: 'generating',
        errorCode: null,
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
    });
  });

  describe('GET /api/installations/:id/monitoring', function () {
    it('@smoke should return monitoring data', async function () {
      const res = await client.get(`/api/installations/${INST_ID}/monitoring`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
      expect(res.data.data.length).to.be.at.least(1);
    });

    it('should respect limit query parameter', async function () {
      const res = await client.get(`/api/installations/${INST_ID}/monitoring?limit=5`);

      expect(res.status).to.equal(200);
      expect(res.data.data.length).to.be.at.most(5);
    });
  });
});

describe('API › Performance Data', function () {
  before(async function () {
    await login(config.users.homeowner);
  });

  after(function () {
    clearAuth();
  });

  describe('POST /api/installations/:id/performance', function () {
    it('should record a performance data point', async function () {
      const today = new Date().toISOString().split('T')[0];
      const res = await client.post(`/api/installations/${INST_ID}/performance`, {
        date: today,
        energyGenerated: 38.5,
        peakPower: 7.8,
        avgEfficiency: 91.2,
        downtimeMinutes: 0,
      });

      expect(res.status).to.equal(201);
      expect(res.data).to.have.property('data');
    });
  });

  describe('GET /api/installations/:id/performance', function () {
    it('@smoke should return performance data', async function () {
      const res = await client.get(`/api/installations/${INST_ID}/performance`);

      expect(res.status).to.equal(200);
      expect(res.data.data).to.be.an('array');
    });
  });
});
