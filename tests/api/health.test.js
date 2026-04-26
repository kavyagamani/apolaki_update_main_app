/**
 * API Integration Tests — Health & Root Endpoint
 * @tags smoke, api
 */

import { expect } from 'chai';
import client from '../helpers/apiClient.js';

describe('API › Health Check', function () {
  it('@smoke should return healthy status on GET /api/health', async function () {
    const res = await client.get('/api/health');

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('status', 'healthy');
    expect(res.data).to.have.property('service', 'apolaki-netlify-db-service');
    expect(res.data).to.have.property('timestamp');
  });

  it('@smoke should return API documentation on GET /', async function () {
    const res = await client.get('/');

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('name');
    expect(res.data).to.have.property('endpoints');
    expect(res.data).to.have.property('authentication');
  });

  it('should return 404 for unknown routes', async function () {
    const res = await client.get('/api/nonexistent-route');

    expect(res.status).to.equal(404);
    expect(res.data).to.have.property('error');
  });
});
