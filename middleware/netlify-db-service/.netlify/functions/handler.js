/**
 * Netlify Functions handler for Apolaki API
 * Wraps Express app to run as serverless function
 * Configuration is read from environment variables via ConfigManager
 */

import dotenv from 'dotenv';
import serverlessModule from 'serverless-http';

// Handle CJS/ESM interop for bundled environments
const serverless = serverlessModule.default || serverlessModule;

// Load environment variables BEFORE importing the app
dotenv.config();

// Set up environment for Netlify Functions if not already set
if (!process.env.NETLIFY) {
  process.env.NETLIFY = 'true';
}
if (!process.env.LAMBDA_TASK_ROOT && process.env.NETLIFY === 'true') {
  process.env.LAMBDA_TASK_ROOT = process.cwd();
}

// Import and initialize configuration
import { configManager } from '../../../../config/config.manager.js';

try {
  configManager.initialize();
  // Don't validate too strictly — some config like OAuth secrets might not be set
  console.log('✅ Configuration initialized for Netlify');
} catch (error) {
  console.warn('⚠️  Configuration initialization warning:', error.message);
}

// Import Express app
import appModule from '../../src/server.js';
const app = appModule.default || appModule;

// Wrap Express app for Netlify Functions with proper options
const handler = serverless(app, {
  // Use binary types as needed
  binary: ['image/*', 'font/*'],
  // Request context is passed through
  request: (request, context) => {
    // Ensure proper environment variables are available to routes
    if (!process.env.NETLIFY) {
      process.env.NETLIFY = 'true';
    }
  }
});

// Export handler for Netlify
export { handler };
