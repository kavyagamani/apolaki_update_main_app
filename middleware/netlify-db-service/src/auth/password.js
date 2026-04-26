/**
 * Password Management
 * Handles password hashing and verification
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password
 * @param {string} password - Plain text password
 * @param {string} passwordHash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash);
}
