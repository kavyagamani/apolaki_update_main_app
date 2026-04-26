/**
 * Seeder: Users
 *
 * Creates demo user accounts with hashed passwords.
 * Fixed UUIDs so downstream seeders can reference them deterministically.
 */

import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const BCRYPT_ROUNDS = parseInt(process.env.SEED_BCRYPT_ROUNDS || '10', 10);

/** Fixed UUIDs for deterministic cross-seeder references */
export const USER_IDS = {
  admin:      '00000000-0000-4000-a000-000000000001',
  homeowner:  '00000000-0000-4000-a000-000000000002',
  installer:  '00000000-0000-4000-a000-000000000003',
  trader:     '00000000-0000-4000-a000-000000000004',
  viewer:     '00000000-0000-4000-a000-000000000005',
  dealer:     '00000000-0000-4000-a000-000000000006',
  operations: '00000000-0000-4000-a000-000000000007',
  superadmin: '00000000-0000-4000-a000-000000000008',
};

const USERS = [
  {
    id: USER_IDS.admin,
    email: 'admin@apolaki.solar',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    phone: '+63 917 123 4567',
    role: 'admin',
  },
  {
    id: USER_IDS.homeowner,
    email: 'homeowner@apolaki.solar',
    password: 'Solar@Home1!',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    phone: '+63 918 234 5678',
    role: 'customer',
  },
  {
    id: USER_IDS.installer,
    email: 'installer@apolaki.solar',
    password: 'Install@Sun1!',
    first_name: 'Paolo',
    last_name: 'Reyes',
    phone: '+63 919 345 6789',
    role: 'installer',
  },
  {
    id: USER_IDS.trader,
    email: 'trader@apolaki.solar',
    password: 'Trade@Energy1!',
    first_name: 'Ana',
    last_name: 'Garcia',
    phone: '+63 920 456 7890',
    role: 'customer',
  },
  {
    id: USER_IDS.viewer,
    email: 'viewer@apolaki.solar',
    password: 'ViewOnly@1!',
    first_name: 'Carlos',
    last_name: 'Mendoza',
    phone: '+63 921 567 8901',
    role: 'customer',
  },
  {
    id: USER_IDS.dealer,
    email: 'dealer@apolaki.solar',
    password: 'Dealer@Sun1!',
    first_name: 'Miguel',
    last_name: 'Torres',
    phone: '+63 922 678 9012',
    role: 'dealer',
  },
  {
    id: USER_IDS.operations,
    email: 'ops@apolaki.solar',
    password: 'Ops@Solar1!',
    first_name: 'Liza',
    last_name: 'Ramos',
    phone: '+63 923 789 0123',
    role: 'operations',
  },
  {
    id: USER_IDS.superadmin,
    email: 'superadmin@apolaki.solar',
    password: 'Super@Admin1!',
    first_name: 'Rafael',
    last_name: 'Aquino',
    phone: '+63 924 890 1234',
    role: 'superadmin',
  },
];

export const name = 'users';

export async function seed() {
  const results = [];

  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

    const res = await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING id, email, role`,
      [user.id, user.email, hash, user.first_name, user.last_name, user.phone, user.role]
    );

    results.push({
      email: user.email,
      role: user.role,
      status: res.rowCount > 0 ? 'created' : 'skipped (exists)',
    });
  }

  return results;
}

export async function teardown() {
  const ids = Object.values(USER_IDS);
  await query(
    `DELETE FROM users WHERE id = ANY($1::uuid[])`,
    [ids]
  );
}
