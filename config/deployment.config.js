/**
 * Apolaki Deployment Configuration
 * Defines separate deployables for frontend and backend
 * Supports both independent and combined (Netlify) deployments
 */

export const deploymentConfig = {
  // ============================================================================
  // Frontend Deployable Configuration
  // ============================================================================
  frontend: {
    name: 'apolaki-frontend',
    type: 'static-site',
    description: 'Vue.js 3 + Vite frontend application',
    location: './frontend',
    buildCommand: 'npm run build',
    buildOutputDir: 'frontend/dist',
    startCommand: 'npm run preview',
    port: 5173,
    framework: 'vue',

    // Environment variables required for frontend build
    environment: {
      VITE_API_URL: {
        description: 'Backend API base URL',
        required: true,
        development: 'http://localhost:3001/api',
        production: 'https://api.apolaki.com/api',
        netlify: '/api', // Relative path for Netlify proxy
      },
      VITE_WS_URL: {
        description: 'WebSocket URL for real-time updates',
        required: false,
        development: 'ws://localhost:3001/ws',
        production: 'wss://api.apolaki.com/ws',
        netlify: '/ws', // Relative path for Netlify proxy
      },
      VITE_APP_NAME: {
        description: 'Application name',
        required: false,
        default: 'Apolaki Solar',
      },
      VITE_APP_ENV: {
        description: 'Application environment',
        required: false,
        development: 'development',
        production: 'production',
      },
    },

    // Build artifacts to include
    artifacts: {
      include: [
        'dist/**/*',
        'public/**/*',
      ],
      exclude: [
        'node_modules',
        'src',
        'tests',
        '.git',
      ],
    },

    // Netlify specific configuration
    netlify: {
      publish: 'frontend/dist',
      functions: 'frontend/.netlify/functions', // Optional edge functions
      buildCommand: 'npm run build --prefix frontend',
      command: 'npm run build --prefix frontend',
      redirects: [
        // Proxy API requests to backend
        {
          from: '/api/*',
          to: '/.netlify/functions/:splat',
          status: 200,
        },
        // Proxy WebSocket to backend
        {
          from: '/ws',
          to: '/.netlify/functions/websocket',
          status: 200,
        },
        // SPA fallback
        {
          from: '/*',
          to: '/index.html',
          status: 200,
        },
      ],
    },
  },

  // ============================================================================
  // Backend Deployable Configuration
  // ============================================================================
  backend: {
    name: 'apolaki-backend',
    type: 'api-server',
    description: 'Node.js Express API server with database',
    location: './middleware/netlify-db-service',
    buildCommand: 'npm ci',
    startCommand: 'npm start',
    devCommand: 'npm run dev',
    port: 3001,
    runtime: 'node',
    nodeVersion: '18.0.0',

    // Environment variables required for backend
    environment: {
      // Application
      NODE_ENV: {
        description: 'Node environment',
        required: true,
        development: 'development',
        production: 'production',
      },
      APP_NAME: {
        description: 'Application name',
        required: false,
        default: 'Apolaki',
      },
      PORT: {
        description: 'Server port',
        required: false,
        default: '3001',
        development: '3001',
        production: '3000', // Netlify default
      },
      HOST: {
        description: 'Server host',
        required: false,
        default: '0.0.0.0',
      },

      // Database Configuration
      DATABASE_URL: {
        description: 'PostgreSQL connection string (full URL)',
        required: false, // Either DATABASE_URL or individual DB_* vars
        example: 'postgresql://user:password@host:5432/dbname',
      },
      DB_HOST: {
        description: 'PostgreSQL host',
        required: false,
        development: 'localhost',
        production: 'MUST_BE_SET',
      },
      DB_PORT: {
        description: 'PostgreSQL port',
        required: false,
        default: '5432',
      },
      DB_USER: {
        description: 'PostgreSQL username',
        required: false,
        development: 'apolaki_user',
        production: 'MUST_BE_SET',
      },
      DB_PASSWORD: {
        description: 'PostgreSQL password',
        required: false,
        sensitive: true,
        development: 'apolaki_pass',
        production: 'MUST_BE_SET',
      },
      DB_NAME: {
        description: 'PostgreSQL database name',
        required: false,
        development: 'apolaki_db',
        production: 'MUST_BE_SET',
      },
      DB_SSL: {
        description: 'Use SSL for database connection',
        required: false,
        default: 'false',
        production: 'true',
      },

      // JWT Configuration
      JWT_SECRET: {
        description: 'JWT signing secret',
        required: false,
        sensitive: true,
        production: 'MUST_BE_SET',
      },
      JWT_REFRESH_SECRET: {
        description: 'JWT refresh token secret',
        required: false,
        sensitive: true,
        production: 'MUST_BE_SET',
      },
      JWT_EXPIRES_IN: {
        description: 'JWT token expiration',
        required: false,
        default: '24h',
      },
      JWT_REFRESH_EXPIRES_IN: {
        description: 'JWT refresh token expiration',
        required: false,
        default: '7d',
      },

      // CORS Configuration
      FRONTEND_URL: {
        description: 'Frontend application URL',
        required: true,
        development: 'http://localhost:5173',
        production: 'https://apolaki.com',
        netlify: 'RUNTIME_VALUE', // Set during Netlify deployment
      },
      CORS_ORIGINS: {
        description: 'Allowed CORS origins (comma-separated)',
        required: false,
        default: 'http://localhost:5173',
        production: 'https://apolaki.com',
      },

      // Redis Configuration
      REDIS_HOST: {
        description: 'Redis host',
        required: false,
        development: 'localhost',
      },
      REDIS_PORT: {
        description: 'Redis port',
        required: false,
        default: '6379',
      },
      REDIS_ENABLED: {
        description: 'Enable Redis caching',
        required: false,
        default: 'true',
      },

      // Session Configuration
      SESSION_SECRET: {
        description: 'Session signing secret',
        required: false,
        sensitive: true,
        production: 'MUST_BE_SET',
      },
      SESSION_SECURE: {
        description: 'Use secure cookies (HTTPS)',
        required: false,
        default: 'false',
        production: 'true',
      },

      // OAuth Configuration
      OAUTH_GOOGLE_CLIENT_ID: {
        description: 'Google OAuth client ID',
        required: false,
      },
      OAUTH_GOOGLE_CLIENT_SECRET: {
        description: 'Google OAuth client secret',
        required: false,
        sensitive: true,
      },

      // Logging
      LOG_LEVEL: {
        description: 'Logging level',
        required: false,
        default: 'info',
        development: 'debug',
      },
      LOG_FORMAT: {
        description: 'Log format',
        required: false,
        default: 'json',
      },

      // Debug
      APP_DEBUG: {
        description: 'Enable debug mode',
        required: false,
        default: 'false',
        development: 'true',
      },
    },

    // Build artifacts to include
    artifacts: {
      include: [
        'src/**/*',
        'package.json',
        'package-lock.json',
      ],
      exclude: [
        'node_modules',
        'tests',
        '.git',
        'dist',
      ],
    },

    // Netlify Functions configuration
    netlify: {
      functions: 'middleware/netlify-db-service/netlify-functions',
      buildCommand: 'npm ci --prefix middleware/netlify-db-service && npm run build --prefix middleware/netlify-db-service',
      timeout: 30, // seconds
      memory: 1024, // MB
      handler: 'middleware/netlify-db-service/netlify-functions/handler.js',
    },
  },

  // ============================================================================
  // Combined Netlify Deployment Configuration
  // ============================================================================
  netlify: {
    name: 'apolaki-netlify',
    description: 'Combined frontend + backend deployment for Netlify',
    type: 'full-stack',

    // Monorepo structure for Netlify
    structure: {
      // Frontend published as static site
      frontend: {
        path: 'frontend',
        publish: 'frontend/dist',
        command: 'npm run build --prefix frontend',
      },
      // Backend as Netlify functions
      backend: {
        path: 'middleware/netlify-db-service',
        functions: 'middleware/netlify-db-service/.netlify/functions',
        command: 'npm ci --prefix middleware/netlify-db-service',
      },
    },

    // netlify.toml configuration template
    config: {
      build: {
        base: '.',
        command: 'npm run build:netlify',
        functions: 'middleware/netlify-db-service/.netlify/functions',
        publish: 'frontend/dist',
      },
      dev: {
        command: 'npm run dev',
        framework: 'vue',
        port: 5173,
      },
    },

    // Environment setup instructions
    setupInstructions: [
      '1. Install Netlify CLI: npm install -g netlify-cli',
      '2. Connect repository: netlify link',
      '3. Set environment variables in Netlify dashboard:',
      '   - Database: DATABASE_URL or DB_HOST/USER/PASSWORD/NAME',
      '   - JWT_SECRET, JWT_REFRESH_SECRET',
      '   - FRONTEND_URL (your Netlify site URL)',
      '4. Deploy: netlify deploy',
    ],
  },

  // ============================================================================
  // Deployment Scenarios
  // ============================================================================
  scenarios: {
    // Development: Run both frontend and backend locally
    development: {
      frontend: {
        command: 'npm run dev --prefix frontend',
        url: 'http://localhost:5173',
      },
      backend: {
        command: 'npm run dev --prefix middleware/netlify-db-service',
        url: 'http://localhost:3001',
      },
      database: {
        type: 'local-postgres',
        command: 'docker-compose -f config/docker-compose.yml up -d postgres redis',
      },
    },

    // Docker: Run in containers
    docker: {
      frontend: {
        dockerfile: 'frontend/Dockerfile',
        port: 5173,
      },
      backend: {
        dockerfile: 'middleware/netlify-db-service/Dockerfile',
        port: 3001,
      },
      compose: 'config/docker-compose.yml',
    },

    // Netlify: Combine and deploy to Netlify
    netlify: {
      setup: 'Create netlify.toml with functions configuration',
      environment: 'Set via Netlify dashboard',
      frontend: {
        publish: 'frontend/dist',
      },
      backend: {
        functions: 'middleware/netlify-db-service/.netlify/functions',
      },
    },

    // Kubernetes: Deploy to K8s cluster
    kubernetes: {
      frontend: {
        chart: 'helm/frontend',
      },
      backend: {
        chart: 'helm/solar-service',
      },
      database: {
        external: 'Use managed cloud database (e.g., Heroku Postgres, AWS RDS)',
      },
    },
  },
};

export default deploymentConfig;
