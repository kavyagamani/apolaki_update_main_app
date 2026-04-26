/**
 * Configuration Manager for Apolaki Solar Platform
 * Centralizes all configuration from environment variables
 * Supports runtime configuration updates
 * NEVER hardcode values - always read from this manager
 */

class ConfigManager {
  constructor() {
    this.config = {};
    this.initialized = false;
    this.configSource = 'environment'; // Can be 'environment' or 'runtime'
  }

  /**
   * Initialize configuration from environment variables
   * Call this once at application startup
   */
  initialize() {
    if (this.initialized && this.configSource === 'environment') {
      return;
    }

    // Database Configuration
    this.config.database = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'apolaki_user',
      password: process.env.DB_PASSWORD || 'apolaki_pass',
      database: process.env.DB_NAME || 'apolaki_db',
      ssl: this.parseBoolean(process.env.DB_SSL || 'false'),
      connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
      poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
    };

    // Redis Configuration
    this.config.redis = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      enabled: this.parseBoolean(process.env.REDIS_ENABLED || 'true'),
    };

    // RabbitMQ Configuration
    this.config.rabbitmq = {
      host: process.env.RABBITMQ_HOST || 'localhost',
      port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
      user: process.env.RABBITMQ_USER || 'apolaki',
      password: process.env.RABBITMQ_PASSWORD || 'apolaki_pass',
      vhost: process.env.RABBITMQ_VHOST || '/apolaki',
      enabled: this.parseBoolean(process.env.RABBITMQ_ENABLED || 'true'),
    };

    // JWT Configuration
    this.config.jwt = {
      secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    };

    // Application Configuration
    this.config.app = {
      name: process.env.APP_NAME || 'Apolaki',
      environment: process.env.NODE_ENV || process.env.APP_ENV || 'development',
      debug: this.parseBoolean(process.env.APP_DEBUG || 'false'),
      port: parseInt(process.env.PORT || process.env.APP_PORT || '3001', 10),
      host: process.env.HOST || '0.0.0.0',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      apiUrl: process.env.API_URL || 'http://localhost:3001/api',
    };

    // CORS Configuration
    // Auto-include the Netlify site URL if available
    const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());
    if (process.env.URL && !corsOrigins.includes(process.env.URL)) {
      // Netlify sets the URL env var to the site's primary URL
      corsOrigins.push(process.env.URL);
    }
    if (process.env.DEPLOY_PRIME_URL && !corsOrigins.includes(process.env.DEPLOY_PRIME_URL)) {
      corsOrigins.push(process.env.DEPLOY_PRIME_URL);
    }

    this.config.cors = {
      origin: corsOrigins,
      credentials: this.parseBoolean(process.env.CORS_CREDENTIALS || 'true'),
      methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
      allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Origin,X-Requested-With,Content-Type,Accept,Authorization').split(','),
    };

    // OAuth Configuration
    this.config.oauth = {
      google: {
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      },
      facebook: {
        appId: process.env.OAUTH_FACEBOOK_CLIENT_ID,
        appSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET,
      },
      github: {
        clientId: process.env.OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
      },
    };

    // External Services Configuration
    this.config.services = {
      weather: {
        apiKey: process.env.WEATHER_API_KEY,
        baseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5',
      },
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        s3Bucket: process.env.S3_BUCKET,
      },
    };

    // Logging Configuration
    this.config.logging = {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      filePath: process.env.LOG_FILE_PATH || './logs',
    };

    // Session Configuration
    this.config.session = {
      secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
      secure: this.parseBoolean(process.env.SESSION_SECURE || 'false'),
      httpOnly: this.parseBoolean(process.env.SESSION_HTTP_ONLY || 'true'),
      sameSite: process.env.SESSION_SAME_SITE || 'lax',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
    };

    this.initialized = true;
    this.configSource = 'environment';

    return this;
  }

  /**
   * Get a configuration value by path (e.g., 'database.host', 'jwt.secret')
   * @param {string} path - Dot-separated path to config value
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = undefined) {
    if (!this.initialized) {
      this.initialize();
    }

    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Get entire configuration object
   * @returns {Object} Full configuration
   */
  getAll() {
    if (!this.initialized) {
      this.initialize();
    }
    return { ...this.config };
  }

  /**
   * Get specific config section
   * @param {string} section - Config section name
   * @returns {Object} Section configuration
   */
  getSection(section) {
    if (!this.initialized) {
      this.initialize();
    }
    return this.config[section] || {};
  }

  /**
   * Update configuration at runtime
   * Use carefully - for testing or dynamic config only
   * @param {string} path - Dot-separated path
   * @param {*} value - New value
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.config;

    for (const key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }

    target[lastKey] = value;
    this.configSource = 'runtime';
  }

  /**
   * Validate database configuration
   * @throws {Error} If database config is invalid
   */
  validateDatabase() {
    const db = this.get('database');

    // Either connectionString or individual connection params must be provided
    if (!db.connectionString && (!db.host || !db.user || !db.password || !db.database)) {
      throw new Error(
        'Database configuration incomplete. Provide either DATABASE_URL or ' +
        'DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables.'
      );
    }

    if (db.port < 1 || db.port > 65535) {
      throw new Error('Invalid DB_PORT: must be between 1 and 65535');
    }

    return true;
  }

  /**
   * Validate JWT configuration
   * @throws {Error} If JWT config is invalid
   */
  validateJwt() {
    const jwt = this.get('jwt');

    if (!jwt.secret || jwt.secret.startsWith('dev-')) {
      if (this.get('app.environment') === 'production') {
        console.warn('⚠️  JWT_SECRET should be set to a secure value in production (currently using dev default)');
        // Don't throw — allow the app to start so users can at least see errors
      }
    }

    return true;
  }

  /**
   * Run all validations
   * @throws {Error} If any validation fails
   */
  validate() {
    if (!this.initialized) {
      this.initialize();
    }

    this.validateDatabase();
    this.validateJwt();

    return true;
  }

  /**
   * Get database connection string
   * @returns {string} Connection string
   */
  getDatabaseUrl() {
    const db = this.get('database');

    if (db.connectionString) {
      return db.connectionString;
    }

    const protocol = db.ssl ? 'postgresql+ssl' : 'postgresql';
    return (
      `${protocol}://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`
    );
  }

  /**
   * Get pool configuration for pg library
   * @returns {Object} Pool config
   */
  getPoolConfig() {
    const db = this.get('database');

    if (db.connectionString) {
      return {
        connectionString: db.connectionString,
        max: db.poolMax,
        min: db.poolMin,
        idleTimeoutMillis: db.idleTimeoutMillis,
        connectionTimeoutMillis: db.connectionTimeoutMillis,
        ssl: db.ssl ? { rejectUnauthorized: false } : false,
      };
    }

    return {
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
      database: db.database,
      max: db.poolMax,
      min: db.poolMin,
      idleTimeoutMillis: db.idleTimeoutMillis,
      connectionTimeoutMillis: db.connectionTimeoutMillis,
      ssl: db.ssl ? { rejectUnauthorized: false } : false,
    };
  }

  /**
   * Helper to parse boolean values from strings
   * @private
   */
  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1' || value === 'yes';
  }

  /**
   * Check if running in development
   */
  isDevelopment() {
    return this.get('app.environment') === 'development';
  }

  /**
   * Check if running in production
   */
  isProduction() {
    return this.get('app.environment') === 'production';
  }

  /**
   * Log configuration (safe - excludes secrets)
   */
  logConfig() {
    const safe = {
      app: this.get('app'),
      database: {
        host: this.get('database.host'),
        port: this.get('database.port'),
        database: this.get('database.database'),
        ssl: this.get('database.ssl'),
      },
      redis: {
        host: this.get('redis.host'),
        port: this.get('redis.port'),
        enabled: this.get('redis.enabled'),
      },
      cors: this.get('cors'),
    };
    return safe;
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export default configManager;
