/**
 * Authentication Testing Utilities
 * Use these to test OAuth flows and authentication
 */

/**
 * Test data for local authentication
 */
export const testUsers = {
  emailPassword: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    role: 'admin'
  }
};

/**
 * Example curl commands for testing
 */
export const curlExamples = {
  // Signup
  signup: `curl -X POST http://localhost:3001/api/auth/signup \\
    -H "Content-Type: application/json" \\
    -d '{
      "email": "test@example.com",
      "password": "TestPassword123!",
      "firstName": "Test",
      "lastName": "User",
      "phone": "+1234567890"
    }'`,

  // Login
  login: `curl -X POST http://localhost:3001/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{
      "email": "test@example.com",
      "password": "TestPassword123!"
    }'`,

  // Get Profile
  getProfile: `curl -X GET http://localhost:3001/api/auth/me \\
    -H "Authorization: Bearer YOUR_TOKEN_HERE"`,

  // Get Providers
  getProviders: `curl -X GET http://localhost:3001/api/auth/providers \\
    -H "Authorization: Bearer YOUR_TOKEN_HERE"`,

  // Disconnect Provider
  disconnectProvider: `curl -X DELETE http://localhost:3001/api/auth/providers/google \\
    -H "Authorization: Bearer YOUR_TOKEN_HERE"`,

  // Refresh Token
  refreshToken: `curl -X POST http://localhost:3001/api/auth/refresh \\
    -H "Content-Type: application/json" \\
    -d '{
      "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
    }'`,

  // Logout
  logout: `curl -X POST http://localhost:3001/api/auth/logout \\
    -H "Authorization: Bearer YOUR_TOKEN_HERE"`
};

/**
 * OAuth testing steps
 */
export const oauthTestSteps = {
  google: [
    '1. Start the backend: npm run dev (from middleware/netlify-db-service)',
    '2. Start the frontend: npm run dev (from frontend)',
    '3. Navigate to http://localhost:5173/login',
    '4. Click the "Google" button',
    '5. You\'ll be redirected to Google login',
    '6. Sign in with your Google account',
    '7. You\'ll be redirected to /auth-callback',
    '8. Your profile will be loaded',
    '9. You\'ll be redirected to /dashboard'
  ],
  facebook: [
    '1. Start the backend: npm run dev',
    '2. Start the frontend: npm run dev',
    '3. Navigate to http://localhost:5173/login',
    '4. Click the "Facebook" button',
    '5. Sign in with your Facebook account',
    '6. Authorize the app access',
    '7. You\'ll be redirected to /auth-callback',
    '8. Your profile will be loaded',
    '9. You\'ll be redirected to /dashboard'
  ],
  instagram: [
    '1. Start the backend: npm run dev',
    '2. Start the frontend: npm run dev',
    '3. Navigate to http://localhost:5173/login',
    '4. Click the "Instagram" button',
    '5. Sign in with your Instagram account',
    '6. Authorize the app access',
    '7. You\'ll be redirected to /auth-callback',
    '8. Your profile will be loaded',
    '9. You\'ll be redirected to /dashboard'
  ]
};

/**
 * Common issues and solutions
 */
export const troubleshooting = {
  'OAuth redirect not working': {
    cause: 'Callback URLs not configured in OAuth app settings',
    solution: 'Make sure callback URLs match exactly in provider settings (include protocol and port)'
  },
  'Token expired error': {
    cause: 'JWT token is no longer valid',
    solution: 'Use the refresh token to get a new access token via POST /api/auth/refresh'
  },
  'User not found after OAuth': {
    cause: 'OAuth provider profile data is incomplete',
    solution: 'Check that email permission is requested in OAuth scopes'
  },
  'CORS errors': {
    cause: 'Frontend URL not in CORS whitelist',
    solution: 'Update CORS_ALLOWED_ORIGINS in .env to include frontend URL'
  },
  'Database connection error': {
    cause: 'NETLIFY_DATABASE_URL not set or incorrect',
    solution: 'Verify database URL in .env file and that database is accessible'
  },
  'Instagram authentication fails': {
    cause: 'Instagram Graph API not enabled or credentials incorrect',
    solution: 'Verify app is set up for Instagram Graph API with correct credentials'
  }
};

/**
 * Example request/response for signup
 */
export const examples = {
  signupRequest: {
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890'
  },

  signupResponse: {
    success: true,
    message: 'User registered successfully',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    sessionToken: '550e8400-e29b-41d4-a716-446655440001'
  },

  loginResponse: {
    success: true,
    message: 'Login successful',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      profilePictureUrl: null,
      role: 'customer'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    sessionToken: '550e8400-e29b-41d4-a716-446655440001'
  },

  profileResponse: {
    success: true,
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      profilePictureUrl: 'https://example.com/avatar.jpg',
      role: 'customer',
      active: true,
      createdAt: '2024-02-26T10:30:00Z',
      providers: [
        {
          provider: 'google',
          connectedAt: '2024-02-26T10:35:00Z'
        }
      ]
    }
  }
};

/**
 * Environment variables checklist
 */
export const envChecklist = {
  required: [
    'NETLIFY_DATABASE_URL',
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL',
    'JWT_SECRET',
    'SESSION_SECRET'
  ],
  oauth: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'FACEBOOK_CALLBACK_URL',
    'INSTAGRAM_APP_ID',
    'INSTAGRAM_APP_SECRET',
    'INSTAGRAM_CALLBACK_URL'
  ],
  optional: [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'LOG_LEVEL'
  ]
};

export default {
  testUsers,
  curlExamples,
  oauthTestSteps,
  troubleshooting,
  examples,
  envChecklist
};
