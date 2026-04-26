#!/usr/bin/env node

/**
 * Apolaki Solar Platform - Database Seeding Script
 * Seeds the database with admin user and sample data
 * Usage: node seed-admin.js
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { ensureInitialized, ensureSchema, users } from './src/db.js';

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = 'admin@apolaki.com';
const ADMIN_PASSWORD = 'admin123';

async function seedAdminUser() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Ensure database is initialized and schema exists
    console.log('📊 Initializing database connection...');
    ensureInitialized();
    
    console.log('📋 Ensuring schema exists...');
    await ensureSchema();
    console.log('✅ Schema ready\n');
    
    // Check if admin already exists
    console.log(`👤 Checking for existing admin user: ${ADMIN_EMAIL}`);
    const existingAdmin = await users.getByEmail(ADMIN_EMAIL);
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists with ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.created_at}\n`);
      
      return {
        success: true,
        message: 'Admin user already exists',
        user: existingAdmin
      };
    }
    
    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Create admin user
    console.log(`✍️  Creating admin user: ${ADMIN_EMAIL}`);
    const adminUser = await users.create({
      email: ADMIN_EMAIL,
      passwordHash: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0100',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📌 Admin Account Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.first_name} ${adminUser.last_name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Created: ${adminUser.created_at}\n`);
    
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}\n`);
    
    console.log('✨ Seeding completed successfully!');
    console.log('🚀 You can now login to the application.\n');
    
    return {
      success: true,
      message: 'Admin user created successfully',
      user: adminUser
    };
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure PostgreSQL is running on localhost:5432');
    console.error('2. Check DATABASE_URL in .env file');
    console.error('3. Verify database credentials are correct');
    console.error('4. Make sure the apolaki_db database exists\n');
    
    throw error;
  }
}

// Run the seeding
seedAdminUser()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
