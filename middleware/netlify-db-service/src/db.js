/**
 * Database client for Netlify Neon
 * Handles all database operations using @netlify/neon with PostgreSQL fallback
 */

import { neon } from '@netlify/neon';
import pkg from 'pg';
const { Pool } = pkg;

let sql;
let pool;
let initialized = false;

// Lazy initialization function for database connection
function initializeDatabase() {
  if (initialized) return;
  
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('⚠️  Database URL not configured. Set NETLIFY_DATABASE_URL or DATABASE_URL in .env');
    console.error('   The server will start but database operations will fail.');
    // Create a stub so the server can still start for health checks
    sql = async () => { throw new Error('Database not configured'); };
    initialized = true;
    return;
  }

  // Auto-detect Netlify/Neon environment:
  // - NETLIFY_NEON explicitly set to 'true'
  // - Or running in Netlify Functions (NETLIFY env var set)
  // - Or connection string contains 'neon.tech'
  const isNetlifyEnv = !!process.env.NETLIFY || !!process.env.LAMBDA_TASK_ROOT || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const isNeonUrl = databaseUrl.includes('neon.tech') || databaseUrl.includes('neon-');
  const useNeon = process.env.NETLIFY_NEON === 'true' || (isNetlifyEnv && isNeonUrl);
  
  // Determine if SSL is needed (Neon always requires SSL; also if url has sslmode=require)
  const needsSsl = isNeonUrl || databaseUrl.includes('sslmode=require') || process.env.DB_SSL === 'true';
  
  if (useNeon) {
    try {
      // Use Netlify Neon for serverless functions
      sql = neon();
      console.log('Using Netlify Neon database client');
    } catch (error) {
      console.log('Neon initialization failed, falling back to pg client');
      // Fallback to pg client with SSL for Neon
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: needsSsl ? { rejectUnauthorized: false } : false,
      });
      sql = createPgSqlInterface();
    }
  } else {
    // Use pg client for local development or non-Neon remote databases
    console.log(`Using PostgreSQL pg client (ssl: ${needsSsl})`);

    // Clear PG* env vars that would override connectionString
    // (e.g. when Neon sets PGHOST, PGUSER, PGDATABASE, PGPASSWORD in the shell)
    delete process.env.PGHOST;
    delete process.env.PGUSER;
    delete process.env.PGDATABASE;
    delete process.env.PGPASSWORD;

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
    
    // Use public schema for all queries (unified with seeds and schema.sql)
    pool.on('connect', (client) => {
      client.query('SET search_path TO public');
    });
    
    sql = createPgSqlInterface();
  }
  
  initialized = true;
}

// Create a neon-like interface for pg client
function createPgSqlInterface() {
  return async (strings, ...values) => {
    // Convert neon-style template literals to pg-style parameterized queries
    // strings = ['INSERT INTO users (email) VALUES (', ')']
    // values = ['test@example.com']
    // Expected output: 'INSERT INTO users (email) VALUES ($1)'
    let query = strings[0];
    for (let i = 1; i < strings.length; i++) {
      query += `$${i}${strings[i]}`;
    }
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error.message);
      console.error('Query:', query);
      console.error('Values:', values);
      throw error;
    }
  };
}

// Ensure database is initialized when needed
function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
  }
  return sql;
}

// Helper to get sql with lazy initialization
function getSqlInstance() {
  if (!initialized) {
    initializeDatabase();
  }
  return sql;
}

/**
 * Auto-create essential tables if they don't exist.
 * This ensures Netlify Neon databases work on first deploy without
 * requiring a manual schema.sql import.
 */
let schemaEnsured = false;
async function ensureSchema() {
  if (schemaEnsured) return;
  schemaEnsured = true;
  
  const sqlInstance = getSqlInstance();
  
  try {
    // Check if users table exists
    const tableCheck = await sqlInstance`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS exists
    `;
    
    if (tableCheck[0]?.exists) {
      console.log('✅ Database schema already exists');
      return;
    }

    console.log('📦 Creating database schema (first run)...');
    
    // Create core tables needed for auth
    await sqlInstance`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        profile_picture_url VARCHAR(500),
        role VARCHAR(50) DEFAULT 'customer',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS oauth_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        provider_email VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_id)
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(500) UNIQUE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100),
        resource_id VARCHAR(255),
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS solar_installations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(10),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        capacity DECIMAL(10, 2),
        panel_count INTEGER,
        inverter_type VARCHAR(100),
        install_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS monitoring_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        installation_id UUID NOT NULL REFERENCES solar_installations(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        power_output DECIMAL(10, 2),
        voltage_ac DECIMAL(8, 2),
        current_ac DECIMAL(8, 2),
        frequency DECIMAL(6, 2),
        temperature DECIMAL(6, 2),
        efficiency DECIMAL(5, 2),
        status VARCHAR(50),
        error_code VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS performance_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        installation_id UUID NOT NULL REFERENCES solar_installations(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        energy_generated DECIMAL(10, 2),
        peak_power DECIMAL(10, 2),
        avg_efficiency DECIMAL(5, 2),
        downtime_minutes INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS maintenance_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        installation_id UUID NOT NULL REFERENCES solar_installations(id) ON DELETE CASCADE,
        maintenance_type VARCHAR(50),
        description TEXT,
        performed_date TIMESTAMP,
        completed_date TIMESTAMP,
        cost DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'scheduled',
        technician VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contract_type VARCHAR(100),
        title VARCHAR(255) DEFAULT 'Untitled Contract',
        provider VARCHAR(255) DEFAULT '',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        term_months INTEGER,
        amount DECIMAL(12, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending',
        renewal_option BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(10),
        roof_condition VARCHAR(100),
        roof_area DECIMAL(10, 2),
        annual_usage DECIMAL(10, 2),
        sun_exposure VARCHAR(50),
        obstruction_level VARCHAR(50),
        recommended_capacity DECIMAL(10, 2),
        estimated_cost DECIMAL(12, 2),
        savings_estimate JSONB,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS marketplace_products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        manufacturer VARCHAR(255),
        description TEXT,
        specs JSONB DEFAULT '{}',
        price DECIMAL(12, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        inventory INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS finance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        transaction_id VARCHAR(255) UNIQUE,
        amount DECIMAL(12, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        type VARCHAR(50),
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_date TIMESTAMP,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS break_glass_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        justification TEXT NOT NULL,
        actions_taken JSONB DEFAULT '[]',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        ended_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        ip_address VARCHAR(45),
        user_agent TEXT,
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP,
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create essential indexes
    await sqlInstance`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sqlInstance`CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token)`;
    await sqlInstance`CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers(user_id)`;
    await sqlInstance`CREATE INDEX IF NOT EXISTS idx_solar_installations_user_id ON solar_installations(user_id)`;

    console.log('✅ Database schema created successfully');
  } catch (error) {
    schemaEnsured = false; // Allow retry
    console.error('⚠️  Schema creation error:', error.message);
  }
}

export { ensureInitialized, ensureSchema, initializeDatabase };

/**
 * User operations
 */
export const users = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  async create({ email, passwordHash, firstName, lastName, phone, profilePictureUrl, role = 'customer' }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, profile_picture_url, role)
      VALUES (${email}, ${passwordHash}, ${firstName || ''}, ${lastName || ''}, ${phone || null}, ${profilePictureUrl || null}, ${role})
      RETURNING id, email, first_name, last_name, phone, profile_picture_url, role, active, created_at, updated_at
    `;
    return result[0];
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} User object
   */
  async getById(id) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result[0];
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise} User object
   */
  async getByEmail(email) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0];
  },

  /**
   * Get all users
   * @returns {Promise} Array of users
   */
  async getAll() {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`SELECT * FROM users ORDER BY created_at DESC`;
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} Updated user
   */
  async update(id, { firstName, lastName, role, active }) {
    const sqlInstance = getSqlInstance();
    
    const result = await sqlInstance`
      UPDATE users 
      SET first_name = COALESCE(${firstName || null}, first_name),
          last_name = COALESCE(${lastName || null}, last_name),
          role = COALESCE(${role || null}, role),
          active = COALESCE(${active !== undefined ? active : null}, active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise} Deletion result
   */
  async delete(id) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`DELETE FROM users WHERE id = ${id}`;
  },

  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} passwordHash - New hashed password
   * @returns {Promise} Updated user
   */
  async updatePassword(id, passwordHash) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE users
      SET password_hash = ${passwordHash},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, role, updated_at
    `;
    return result[0];
  }
};

/**
 * Solar Installation operations
 */
export const solarInstallations = {
  /**
   * Create a new solar installation
   */
  async create({
    userId,
    name,
    address,
    city,
    state,
    zipCode,
    latitude,
    longitude,
    capacity,
    panelCount,
    inverterType
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO solar_installations 
      (user_id, name, address, city, state, zip_code, latitude, longitude, capacity, panel_count, inverter_type)
      VALUES (${userId}, ${name}, ${address}, ${city}, ${state}, ${zipCode}, ${latitude}, ${longitude}, ${capacity}, ${panelCount}, ${inverterType})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get installation by ID
   */
  async getById(id) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM solar_installations WHERE id = ${id}
    `;
    return result[0];
  },

  /**
   * Get all installations for a user
   */
  async getByUserId(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM solar_installations 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  },

  /**
   * Update installation
   */
  async update(id, { name, status, capacity, panelCount }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE solar_installations 
      SET name = COALESCE(${name}, name),
          status = COALESCE(${status}, status),
          capacity = COALESCE(${capacity}, capacity),
          panel_count = COALESCE(${panelCount}, panel_count),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Delete installation
   */
  async delete(id) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`DELETE FROM solar_installations WHERE id = ${id}`;
  },

  async getAll() {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`SELECT * FROM solar_installations ORDER BY created_at DESC`;
  }
};

/**
 * Monitoring Data operations
 */
export const monitoringData = {
  /**
   * Record monitoring data
   */
  async create({
    installationId,
    powerOutput,
    voltageAc,
    currentAc,
    frequency,
    temperature,
    efficiency,
    status,
    errorCode
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO monitoring_data 
      (installation_id, power_output, voltage_ac, current_ac, frequency, temperature, efficiency, status, error_code)
      VALUES (${installationId}, ${powerOutput}, ${voltageAc}, ${currentAc}, ${frequency}, ${temperature}, ${efficiency}, ${status}, ${errorCode})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get latest monitoring data for installation
   */
  async getLatest(installationId, limit = 100) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM monitoring_data 
      WHERE installation_id = ${installationId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
  },

  /**
   * Get monitoring data for date range
   */
  async getByDateRange(installationId, startDate, endDate) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM monitoring_data 
      WHERE installation_id = ${installationId}
      AND timestamp BETWEEN ${startDate} AND ${endDate}
      ORDER BY timestamp DESC
    `;
  }
};

/**
 * Performance Data operations
 */
export const performanceData = {
  /**
   * Record performance data
   */
  async create({
    installationId,
    date,
    energyGenerated,
    peakPower,
    avgEfficiency,
    downtimeMinutes
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO performance_data 
      (installation_id, date, energy_generated, peak_power, avg_efficiency, downtime_minutes)
      VALUES (${installationId}, ${date}, ${energyGenerated}, ${peakPower}, ${avgEfficiency}, ${downtimeMinutes})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get performance data for installation
   */
  async getByInstallation(installationId, limit = 30) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM performance_data 
      WHERE installation_id = ${installationId}
      ORDER BY date DESC
      LIMIT ${limit}
    `;
  },

  /**
   * Get performance metrics for date range
   */
  async getByDateRange(installationId, startDate, endDate) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM performance_data 
      WHERE installation_id = ${installationId}
      AND date BETWEEN ${startDate} AND ${endDate}
      ORDER BY date DESC
    `;
  }
};

/**
 * Maintenance Log operations
 */
export const maintenanceLog = {
  /**
   * Create maintenance record
   */
  async create({
    installationId,
    maintenanceType,
    description,
    performedDate,
    cost,
    technician,
    notes
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO maintenance_log 
      (installation_id, maintenance_type, description, performed_date, cost, technician, notes)
      VALUES (${installationId}, ${maintenanceType}, ${description}, ${performedDate}, ${cost}, ${technician}, ${notes})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get maintenance logs for installation
   */
  async getByInstallation(installationId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM maintenance_log 
      WHERE installation_id = ${installationId}
      ORDER BY performed_date DESC
    `;
  },

  /**
   * Update maintenance record
   */
  async update(id, { status, completedDate, notes }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE maintenance_log 
      SET status = COALESCE(${status}, status),
          completed_date = COALESCE(${completedDate}, completed_date),
          notes = COALESCE(${notes}, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }
};

/**
 * Contract operations
 */
export const contracts = {
  /**
   * Create contract
   */
  async create({
    userId,
    contractType,
    title,
    provider,
    startDate,
    endDate,
    termMonths,
    amount,
    currency = 'USD',
    metadata
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO contracts 
      (user_id, contract_type, title, provider, start_date, end_date, term_months, amount, currency, metadata)
      VALUES (${userId}, ${contractType}, ${title || 'Untitled Contract'}, ${provider || ''}, ${startDate}, ${endDate}, ${termMonths}, ${amount}, ${currency}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get contract by ID
   */
  async getById(id) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM contracts WHERE id = ${id}
    `;
    return result[0];
  },

  /**
   * Get contracts for user
   */
  async getByUserId(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM contracts 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  },

  /**
   * Get all contracts
   */
  async getAll() {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT c.*, u.email as user_email, u.first_name, u.last_name
      FROM contracts c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;
  },

  /**
   * Get active contracts
   */
  async getActive() {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM contracts 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;
  },

  /**
   * Update contract
   */
  async update(id, { status, endDate, metadata }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE contracts 
      SET status = COALESCE(${status || null}, status),
          end_date = COALESCE(${endDate || null}, end_date),
          metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}::jsonb, metadata),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  async sign(id, signatureData) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE contracts 
      SET status = 'signed',
          metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ signature: signatureData, signedAt: new Date().toISOString() })}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }
};

/**
 * Assessment operations
 */
export const assessments = {
  /**
   * Create assessment
   */
  async create({
    userId,
    address,
    city,
    state,
    zipCode,
    roofCondition,
    roofArea,
    annualUsage,
    sunExposure,
    obstructionLevel,
    recommendedCapacity,
    estimatedCost,
    savingsEstimate
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO assessments 
      (user_id, address, city, state, zip_code, roof_condition, roof_area, annual_usage, sun_exposure, obstruction_level, recommended_capacity, estimated_cost, savings_estimate)
      VALUES (${userId}, ${address}, ${city}, ${state}, ${zipCode}, ${roofCondition}, ${roofArea}, ${annualUsage}, ${sunExposure}, ${obstructionLevel}, ${recommendedCapacity}, ${estimatedCost}, ${JSON.stringify(savingsEstimate || {})})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get assessment by ID
   */
  async getById(id) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM assessments WHERE id = ${id}
    `;
    return result[0];
  },

  /**
   * Get assessments for user
   */
  async getByUserId(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM assessments 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  },

  async update(id, { status, notes }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE assessments 
      SET status = COALESCE(${status || null}, status),
          notes = COALESCE(${notes || null}, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }
};

/**
 * Marketplace operations
 */
export const marketplace = {
  /**
   * Get all products
   */
  async getAll(filters = {}) {
    const sqlInstance = getSqlInstance();
    if (filters.search) {
      return await sqlInstance`
        SELECT * FROM marketplace_products 
        WHERE active = true 
        AND (name ILIKE ${'%' + filters.search + '%'} OR description ILIKE ${'%' + filters.search + '%'})
        ORDER BY created_at DESC
      `;
    }
    return await sqlInstance`
      SELECT * FROM marketplace_products 
      WHERE active = true
      ORDER BY created_at DESC
    `;
  },

  /**
   * Get product by ID
   */
  async getById(id) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM marketplace_products WHERE id = ${id} AND active = true
    `;
    return result[0];
  },

  /**
   * Get products by category
   */
  async getByCategory(category) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM marketplace_products 
      WHERE category = ${category} AND active = true
      ORDER BY created_at DESC
    `;
  },

  async create({ name, category, description, price, currency, inventory, rating, metadata }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO marketplace_products (name, category, description, price, currency, inventory, rating, metadata)
      VALUES (${name}, ${category}, ${description || ''}, ${price}, ${currency || 'USD'}, ${inventory || 0}, ${rating || 0}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;
    return result[0];
  },

  async update(id, { name, category, description, price, inventory, rating, active }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE marketplace_products 
      SET name = COALESCE(${name || null}, name),
          category = COALESCE(${category || null}, category),
          description = COALESCE(${description || null}, description),
          price = COALESCE(${price || null}, price),
          inventory = COALESCE(${inventory !== undefined ? inventory : null}, inventory),
          rating = COALESCE(${rating || null}, rating),
          active = COALESCE(${active !== undefined ? active : null}, active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get reviews for a product
   */
  async getReviews(productId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT r.*, u.first_name, u.last_name, u.email
      FROM marketplace_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ${productId}
      ORDER BY r.created_at DESC
    `;
  },

  /**
   * Create a review
   */
  async createReview({ productId, userId, rating, title, comment }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO marketplace_reviews (product_id, user_id, rating, title, comment)
      VALUES (${productId}, ${userId}, ${rating}, ${title || ''}, ${comment || ''})
      RETURNING *
    `;
    // Update product rating and count
    await sqlInstance`
      UPDATE marketplace_products
      SET rating = (SELECT AVG(rating) FROM marketplace_reviews WHERE product_id = ${productId}),
          review_count = (SELECT COUNT(*) FROM marketplace_reviews WHERE product_id = ${productId}),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
    `;
    return result[0];
  },

  /**
   * Get wishlist for a user
   */
  async getWishlist(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT w.id as wishlist_id, w.created_at as added_at, p.*
      FROM wishlist w
      JOIN marketplace_products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `;
  },

  /**
   * Add to wishlist
   */
  async addToWishlist(userId, productId) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO wishlist (user_id, product_id)
      VALUES (${userId}, ${productId})
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(userId, productId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      DELETE FROM wishlist
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;
  },

  /**
   * Search products
   */
  async search(query, category = null) {
    const sqlInstance = getSqlInstance();
    const searchTerm = '%' + query + '%';
    if (category && category !== 'all') {
      return await sqlInstance`
        SELECT * FROM marketplace_products
        WHERE active = true
        AND category = ${category}
        AND (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR manufacturer ILIKE ${searchTerm})
        ORDER BY rating DESC, created_at DESC
      `;
    }
    return await sqlInstance`
      SELECT * FROM marketplace_products
      WHERE active = true
      AND (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR manufacturer ILIKE ${searchTerm})
      ORDER BY rating DESC, created_at DESC
    `;
  }
};

/**
 * Finance operations
 */
export const finance = {
  /**
   * Create transaction
   */
  async create({
    userId,
    transactionId,
    amount,
    currency = 'USD',
    type,
    category,
    transactionDate,
    description,
    metadata
  }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO finance 
      (user_id, transaction_id, amount, currency, type, category, transaction_date, description, metadata)
      VALUES (${userId}, ${transactionId}, ${amount}, ${currency}, ${type}, ${category}, ${transactionDate}, ${description}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get transactions for user
   */
  async getByUserId(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM finance 
      WHERE user_id = ${userId}
      ORDER BY transaction_date DESC
    `;
  },

  /**
   * Get transaction summary for user
   */
  async getSummary(userId) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average
      FROM finance 
      WHERE user_id = ${userId}
      GROUP BY type
    `;
    return result;
  }
};

/**
 * OAuth Providers operations
 */
export const oauthProviders = {
  /**
   * Create or update OAuth provider record
   */
  async upsert({ userId, provider, providerId, providerEmail, accessToken, refreshToken, tokenExpiresAt, rawData }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO oauth_providers (user_id, provider, provider_id, provider_email, access_token, refresh_token, token_expires_at, raw_data)
      VALUES (${userId}, ${provider}, ${providerId}, ${providerEmail}, ${accessToken}, ${refreshToken}, ${tokenExpiresAt}, ${JSON.stringify(rawData)})
      ON CONFLICT (provider, provider_id) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_expires_at = EXCLUDED.token_expires_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get OAuth provider by provider and provider ID
   */
  async getByProvider(provider, providerId) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM oauth_providers 
      WHERE provider = ${provider} AND provider_id = ${providerId}
    `;
    return result[0];
  },

  /**
   * Get all providers for a user
   */
  async getByUserId(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM oauth_providers 
      WHERE user_id = ${userId}
    `;
  },

  /**
   * Delete OAuth provider
   */
  async delete(userId, provider) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      DELETE FROM oauth_providers 
      WHERE user_id = ${userId} AND provider = ${provider}
    `;
  },

  /**
   * Update access token
   */
  async updateAccessToken(providerId, accessToken, tokenExpiresAt) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE oauth_providers 
      SET access_token = ${accessToken}, token_expires_at = ${tokenExpiresAt}, updated_at = CURRENT_TIMESTAMP
      WHERE provider_id = ${providerId}
      RETURNING *
    `;
    return result[0];
  }
};

/**
 * Sessions operations
 */
export const sessions = {
  /**
   * Create a new session
   */
  async create({ userId, sessionToken, ipAddress, userAgent, expiresAt }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (${userId}, ${sessionToken}, ${ipAddress}, ${userAgent}, ${expiresAt})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get session by token
   */
  async getByToken(sessionToken) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM sessions 
      WHERE session_token = ${sessionToken} AND expires_at > CURRENT_TIMESTAMP
    `;
    return result[0];
  },

  /**
   * Get all sessions for user
   */
  async getByUserId(userId) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM sessions 
      WHERE user_id = ${userId} AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `;
  },

  /**
   * Invalidate session
   */
  async invalidate(sessionToken) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      UPDATE sessions SET expires_at = CURRENT_TIMESTAMP 
      WHERE session_token = ${sessionToken}
    `;
  },

  /**
   * Cleanup expired sessions
   */
  async cleanupExpired() {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP
    `;
  }
};

/**
 * Audit Logs operations
 */
export const auditLogs = {
  /**
   * Create audit log entry
   */
  async create({ userId, action, resourceType, resourceId, changes, ipAddress, userAgent, status }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes, ip_address, user_agent, status)
      VALUES (${userId}, ${action}, ${resourceType}, ${resourceId}, ${JSON.stringify(changes)}, ${ipAddress}, ${userAgent}, ${status})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get audit logs for user
   */
  async getByUserId(userId, limit = 100) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM audit_logs 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  },

  /**
   * Get audit logs for resource
   */
  async getByResource(resourceType, resourceId, limit = 100) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM audit_logs 
      WHERE resource_type = ${resourceType} AND resource_id = ${resourceId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  },

  /**
   * Get all audit logs
   */
  async getAll(limit = 1000) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM audit_logs 
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }
};

/**
 * Break-Glass Sessions operations (superadmin emergency access)
 */
export const breakGlassSessions = {
  /**
   * Start a break-glass session
   */
  async create({ userId, justification, expiresAt, ipAddress, userAgent }) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      INSERT INTO break_glass_sessions (user_id, justification, expires_at, ip_address, user_agent)
      VALUES (${userId}, ${justification}, ${expiresAt}, ${ipAddress}, ${userAgent})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get active session for user
   */
  async getActiveByUserId(userId) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM break_glass_sessions
      WHERE user_id = ${userId} AND status = 'active' AND expires_at > CURRENT_TIMESTAMP
      ORDER BY started_at DESC LIMIT 1
    `;
    return result[0];
  },

  /**
   * Record an action taken during a session
   */
  async recordAction(sessionId, action) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE break_glass_sessions
      SET actions_taken = actions_taken || ${JSON.stringify([action])}::jsonb
      WHERE id = ${sessionId} AND status = 'active'
      RETURNING *
    `;
    return result[0];
  },

  /**
   * End a break-glass session
   */
  async end(sessionId) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE break_glass_sessions
      SET status = 'ended', ended_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get all sessions (for audit)
   */
  async getAll(limit = 100) {
    const sqlInstance = getSqlInstance();
    return await sqlInstance`
      SELECT * FROM break_glass_sessions
      ORDER BY started_at DESC LIMIT ${limit}
    `;
  },

  /**
   * Review a session (post-incident)
   */
  async review(sessionId, reviewedBy, reviewNotes) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      UPDATE break_glass_sessions
      SET reviewed_by = ${reviewedBy}, reviewed_at = CURRENT_TIMESTAMP, review_notes = ${reviewNotes}
      WHERE id = ${sessionId}
      RETURNING *
    `;
    return result[0];
  }
};

/**
 * Password Reset Token operations
 */
export const passwordResetTokens = {
  /**
   * Create a password reset token
   */
  async create({ userId, token, expiresAt }) {
    const sqlInstance = getSqlInstance();
    // Invalidate any existing tokens for this user
    await sqlInstance`UPDATE password_reset_tokens SET used = true WHERE user_id = ${userId} AND used = false`;
    const result = await sqlInstance`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt})
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get token record by token string
   */
  async getByToken(token) {
    const sqlInstance = getSqlInstance();
    const result = await sqlInstance`
      SELECT * FROM password_reset_tokens
      WHERE token = ${token} AND used = false AND expires_at > CURRENT_TIMESTAMP
    `;
    return result[0];
  },

  /**
   * Mark token as used
   */
  async markUsed(token) {
    const sqlInstance = getSqlInstance();
    await sqlInstance`UPDATE password_reset_tokens SET used = true WHERE token = ${token}`;
  }
};

export default {
  get sql() { return getSqlInstance(); },
  users,
  solarInstallations,
  monitoringData,
  performanceData,
  maintenanceLog,
  contracts,
  assessments,
  marketplace,
  finance,
  oauthProviders,
  sessions,
  auditLogs,
  breakGlassSessions
};
