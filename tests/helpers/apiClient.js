/**
 * HTTP client helper for API tests.
 * Wraps axios with the configured base URL and provides
 * login + authenticated-request shortcuts.
 */

import axios from 'axios';
import config from './config.js';

const client = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 15000,
  validateStatus: () => true, // never throw — let tests assert status
});

/**
 * Log in with the given credentials and return the full response body.
 * Stores the token on the client for subsequent authenticated calls.
 * @param {{ email: string, password: string }} creds
 * @returns {Promise<object>} response.data
 */
export async function login(creds = config.users.homeowner) {
  const res = await client.post('/api/auth/login', creds);
  if (res.data.token) {
    client.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
  }
  return res;
}

/**
 * Clear stored auth token.
 */
export function clearAuth() {
  delete client.defaults.headers.common.Authorization;
}

export default client;
