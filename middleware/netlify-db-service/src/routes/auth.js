/**
 * Authentication Routes
 * Handles login, signup, OAuth callbacks, and token management
 */

import axios from 'axios';
import expressModule from 'express';
import passportModule from 'passport';
import { extractTokenFromHeader, generateRefreshToken, generateSessionToken, generateToken, verifyToken } from '../auth/jwt.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { auditLogs, ensureSchema, oauthProviders, passwordResetTokens, sessions, users } from '../db.js';

// Handle CJS/ESM interop for bundled environments (Netlify esbuild)
const express = expressModule.default || expressModule;
const passport = passportModule.default || passportModule;

const router = express.Router();

// ============================================
// SEED ADMIN USER ON STARTUP
// ============================================

/**
 * Auto-seed the default admin user (admin@apolaki.com / admin123)
 * Runs once when the auth routes module loads.
 * Wraps in setTimeout(0) so it doesn't block cold-start of serverless function.
 */
let adminSeeded = false;
async function seedAdminUser() {
  if (adminSeeded) return;
  adminSeeded = true;
  try {
    // Ensure schema exists before seeding
    await ensureSchema();
    
    const adminEmail = 'admin@apolaki.com';
    const adminPassword = 'admin123';
    const existing = await users.getByEmail(adminEmail);
    if (!existing) {
      const passwordHash = await hashPassword(adminPassword);
      await users.create({
        email: adminEmail,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        phone: null,
        role: 'admin'
      });
      console.log('✅ Seeded default admin user: admin@apolaki.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists: admin@apolaki.com');
    }
  } catch (err) {
    adminSeeded = false; // Allow retry on next request
    console.warn('⚠️  Could not seed admin user (DB may not be ready):', err.message);
  }
}

// Run seed on module load (non-blocking via setTimeout for serverless cold start)
setTimeout(() => seedAdminUser(), 0);

/**
 * Helper function to get client IP
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
}

// ============================================
// LOCAL AUTHENTICATION
// ============================================

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 */
router.post('/signup', async (req, res) => {
  try {
    // Ensure schema exists (idempotent, runs once)
    await ensureSchema();
    
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await users.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await users.create({
      email,
      passwordHash,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || null,
      role: 'customer'
    });

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await sessions.create({
      userId: user.id,
      sessionToken,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      expiresAt
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log audit
    await auditLogs.create({
      userId: user.id,
      action: 'USER_SIGNUP',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      token,
      refreshToken,
      sessionToken
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', message: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    // Ensure schema exists (idempotent, runs once)
    await ensureSchema();
    // Also ensure admin user is seeded
    await seedAdminUser();
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await users.getByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses OAuth login. Please use a OAuth provider.' });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      await auditLogs.create({
        userId: user.id,
        action: 'LOGIN_FAILED',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        status: 'failed'
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sessions.create({
      userId: user.id,
      sessionToken,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      expiresAt
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await auditLogs.create({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profilePictureUrl: user.profile_picture_url,
        role: user.role
      },
      token,
      refreshToken,
      sessionToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * OTP fallback verification when login fails.
 * Accepts a static OTP (123456) to allow access.
 * In production, replace with a real OTP provider (Twilio, SendGrid, etc.).
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Static OTP for MVP — replace with real OTP verification in production
    const VALID_OTP = '123456';

    if (otp !== VALID_OTP) {
      return res.status(401).json({ error: 'Invalid OTP code' });
    }

    // Look up user by email
    const user = await users.getByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sessions.create({
      userId: user.id,
      sessionToken,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      expiresAt
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await auditLogs.create({
      userId: user.id,
      action: 'LOGIN_OTP',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'OTP verification successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profilePictureUrl: user.profile_picture_url,
        role: user.role
      },
      token,
      refreshToken,
      sessionToken
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed', message: error.message });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Invalidate all sessions for user
        const userSessions = await sessions.getByUserId(decoded.id);
        for (const session of userSessions) {
          await sessions.invalidate(session.session_token);
        }

        await auditLogs.create({
          userId: decoded.id,
          action: 'LOGOUT',
          resourceType: 'user',
          resourceId: decoded.id,
          ipAddress: getClientIp(req),
          userAgent: req.get('user-agent'),
          status: 'success'
        });
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed', message: error.message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await users.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed', message: error.message });
  }
});

// ============================================
// PASSWORD RESET
// ============================================

/**
 * POST /api/auth/forgot-password
 * Request a password reset token
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await users.getByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    // Generate a secure reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await passwordResetTokens.create({
      userId: user.id,
      token: resetToken,
      expiresAt
    });

    await auditLogs.create({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // In production, send email with reset link
    // For MVP/dev, include the token in the response
    const isDev = process.env.NODE_ENV !== 'production';
    const response = {
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    };

    if (isDev) {
      response.resetToken = resetToken;
      response.resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    }

    res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using a token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate token
    const resetRecord = await passwordResetTokens.getByToken(token);
    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password and update
    const passwordHash = await hashPassword(password);
    await users.updatePassword(resetRecord.user_id, passwordHash);

    // Mark token as used
    await passwordResetTokens.markUsed(token);

    await auditLogs.create({
      userId: resetRecord.user_id,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'user',
      resourceId: resetRecord.user_id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// ============================================
// HELPER: Check if a passport strategy is registered
// ============================================
function isStrategyConfigured(strategyName) {
  try {
    return !!passport._strategy(strategyName);
  } catch {
    return false;
  }
}

/**
 * MVP Social Login Fallback
 * When OAuth provider isn't configured, auto-create/login a demo user
 * so the social buttons always work during development.
 */
async function socialLoginFallback(req, res, providerName, demoEmail) {
  try {
    let user = await users.getByEmail(demoEmail);
    if (!user) {
      user = await users.create({
        email: demoEmail,
        passwordHash: null,
        firstName: providerName.charAt(0).toUpperCase() + providerName.slice(1),
        lastName: 'User',
        phone: null,
        role: 'customer'
      });
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sessions.create({
      userId: user.id,
      sessionToken,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      expiresAt
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await auditLogs.create({
      userId: user.id,
      action: `${providerName.toUpperCase()}_OAUTH_LOGIN`,
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      status: 'success'
    });

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}&refreshToken=${refreshToken}&sessionToken=${sessionToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(`${providerName} fallback error:`, error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
  }
}

// ============================================
// GOOGLE OAUTH
// ============================================

/**
 * GET /api/auth/google
 * Redirect to Google OAuth login
 */
router.get('/google', (req, res, next) => {
  if (!isStrategyConfigured('google')) {
    return socialLoginFallback(req, res, 'google', 'google-user@apolaki.solar');
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', (req, res, next) => {
  if (!isStrategyConfigured('google')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Google+OAuth+not+configured`);
  }
  passport.authenticate('google', { session: false })(req, res, (err) => {
    if (err) return next(err);
    next();
  });
},
  async (req, res) => {
    try {
      const user = req.user;

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await sessions.create({
        userId: user.id,
        sessionToken,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        expiresAt
      });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      await auditLogs.create({
        userId: user.id,
        action: 'GOOGLE_OAUTH_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: getClientIp(req),
        status: 'success'
      });

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}&refreshToken=${refreshToken}&sessionToken=${sessionToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

// ============================================
// FACEBOOK OAUTH
// ============================================

/**
 * GET /api/auth/facebook
 * Redirect to Facebook OAuth login
 */
router.get('/facebook', (req, res, next) => {
  if (!isStrategyConfigured('facebook')) {
    return socialLoginFallback(req, res, 'facebook', 'facebook-user@apolaki.solar');
  }
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  })(req, res, next);
});

/**
 * GET /api/auth/facebook/callback
 * Facebook OAuth callback
 */
router.get('/facebook/callback', (req, res, next) => {
  if (!isStrategyConfigured('facebook')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Facebook+OAuth+not+configured`);
  }
  passport.authenticate('facebook', { session: false })(req, res, (err) => {
    if (err) return next(err);
    next();
  });
},
  async (req, res) => {
    try {
      const user = req.user;

      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await sessions.create({
        userId: user.id,
        sessionToken,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        expiresAt
      });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      await auditLogs.create({
        userId: user.id,
        action: 'FACEBOOK_OAUTH_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: getClientIp(req),
        status: 'success'
      });

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}&refreshToken=${refreshToken}&sessionToken=${sessionToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

// ============================================
// INSTAGRAM OAUTH
// ============================================

/**
 * GET /api/auth/instagram
 * Redirect to Instagram OAuth login
 */
router.get('/instagram', (req, res, next) => {
  if (!isStrategyConfigured('instagram')) {
    return socialLoginFallback(req, res, 'instagram', 'instagram-user@apolaki.solar');
  }
  passport.authenticate('instagram')(req, res, next);
});

/**
 * GET /api/auth/instagram/callback
 * Instagram OAuth callback
 */
router.get('/instagram/callback', (req, res, next) => {
  if (!isStrategyConfigured('instagram')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Instagram+OAuth+not+configured`);
  }
  passport.authenticate('instagram', { session: false })(req, res, (err) => {
    if (err) return next(err);
    next();
  });
},
  async (req, res) => {
    try {
      const user = req.user;

      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await sessions.create({
        userId: user.id,
        sessionToken,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        expiresAt
      });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      await auditLogs.create({
        userId: user.id,
        action: 'INSTAGRAM_OAUTH_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: getClientIp(req),
        status: 'success'
      });

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}&refreshToken=${refreshToken}&sessionToken=${sessionToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Instagram callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

// ============================================
// VIBER OAUTH
// ============================================

/**
 * GET /api/auth/viber
 * Redirect to Viber OAuth login
 */
router.get('/viber', (req, res) => {
  try {
    const clientId = process.env.VIBER_CLIENT_ID;
    if (!clientId || clientId.startsWith('your_')) {
      return socialLoginFallback(req, res, 'viber', 'viber-user@apolaki.solar');
    }
    const redirectUri = process.env.VIBER_CALLBACK_URL || 'http://localhost:3001/api/auth/viber/callback';
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session for verification
    if (req.session) req.session.viberState = state;
    
    const viberAuthUrl = `https://www.viber.com/oauth/v1/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=profile&` +
      `state=${state}`;
    
    res.redirect(viberAuthUrl);
  } catch (error) {
    console.error('Viber auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/auth/viber/callback
 * Viber OAuth callback
 */
router.get('/viber/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // Verify state parameter
    if (state !== req.session.viberState) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=State+mismatch`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=No+authorization+code`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.viber.com/oauth/v1/token', {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.VIBER_CLIENT_ID,
      client_secret: process.env.VIBER_CLIENT_SECRET,
      redirect_uri: process.env.VIBER_CALLBACK_URL || 'http://localhost:3001/api/auth/viber/callback'
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user profile
    const profileResponse = await axios.get('https://api.viber.com/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const profile = profileResponse.data;
    const viberId = profile.id;
    const viberEmail = profile.email || `${viberId}@viber.local`;

    // Check if user exists with Viber provider
    let oauthRecord = await oauthProviders.getByProvider('viber', viberId);
    let user;

    if (oauthRecord) {
      user = await users.getById(oauthRecord.user_id);
      // Update access token
      await oauthProviders.upsert({
        userId: user.id,
        provider: 'viber',
        providerId: viberId,
        providerEmail: viberEmail,
        accessToken,
        refreshToken: tokenResponse.data.refresh_token || null,
        tokenExpiresAt: tokenResponse.data.expires_in ? new Date(Date.now() + tokenResponse.data.expires_in * 1000) : null,
        rawData: profile
      });
    } else {
      // Check if user exists by email
      user = await users.getByEmail(viberEmail);

      if (!user) {
        // Create new user
        user = await users.create({
          email: viberEmail,
          firstName: profile.name || '',
          lastName: profile.last_name || '',
          phone: profile.phone_number || null,
          profilePictureUrl: profile.avatar || null,
          passwordHash: null,
          role: 'customer'
        });
      }

      // Store OAuth provider info
      await oauthProviders.upsert({
        userId: user.id,
        provider: 'viber',
        providerId: viberId,
        providerEmail: viberEmail,
        accessToken,
        refreshToken: tokenResponse.data.refresh_token || null,
        tokenExpiresAt: tokenResponse.data.expires_in ? new Date(Date.now() + tokenResponse.data.expires_in * 1000) : null,
        rawData: profile
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sessions.create({
      userId: user.id,
      sessionToken,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      expiresAt
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await auditLogs.create({
      userId: user.id,
      action: 'VIBER_OAUTH_LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}&refreshToken=${refreshToken}&sessionToken=${sessionToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Viber callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
  }
});

// ============================================
// TELEGRAM OAUTH
// ============================================

/**
 * GET /api/auth/telegram
 * Redirect to Telegram OAuth login
 */
router.get('/telegram', (req, res) => {
  try {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername || botUsername.startsWith('your_')) {
      return socialLoginFallback(req, res, 'telegram', 'telegram-user@apolaki.solar');
    }
    const redirectUri = process.env.TELEGRAM_CALLBACK_URL || 'http://localhost:3001/api/auth/telegram/callback';

    // Telegram Web App login URL
    const telegramAuthUrl = `https://t.me/${botUsername}?start=auth`;
    
    // Alternative: Telegram Login Widget (requires token verification)
    // For simplicity, we'll redirect to the bot
    res.redirect(telegramAuthUrl);
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/auth/telegram/callback
 * Telegram OAuth callback (receives user data from Telegram widget)
 */
router.get('/telegram/callback', async (req, res) => {
  try {
    const {
      id,
      first_name,
      last_name,
      username,
      photo_url,
      auth_date,
      hash
    } = req.query;

    if (!id || !hash) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Invalid+Telegram+response`);
    }

    // Verify hash using bot token
    const crypto = require('crypto');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // Create string to hash from all params except hash
    const dataCheckString = [
      `id=${id}`,
      `first_name=${encodeURIComponent(first_name || '')}`,
      `last_name=${encodeURIComponent(last_name || '')}`,
      `username=${encodeURIComponent(username || '')}`,
      `photo_url=${encodeURIComponent(photo_url || '')}`,
      `auth_date=${auth_date}`
    ].sort().join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Verify hash matches
    if (computedHash !== hash) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Telegram+verification+failed`);
    }

    // Verify auth_date is recent (within 1 day)
    const authDateSeconds = parseInt(auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDateSeconds > 86400) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Telegram+auth+expired`);
    }

    const telegramId = id;
    const telegramEmail = `${telegramId}@telegram.local`;

    // Check if user exists with Telegram provider
    let oauthRecord = await oauthProviders.getByProvider('telegram', telegramId);
    let user;

    if (oauthRecord) {
      user = await users.getById(oauthRecord.user_id);
      // Update profile data
      await oauthProviders.upsert({
        userId: user.id,
        provider: 'telegram',
        providerId: telegramId,
        providerEmail: telegramEmail,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        rawData: {
          id,
          first_name,
          last_name,
          username,
          photo_url,
          auth_date
        }
      });
    } else {
      // Create new user
      user = await users.create({
        email: telegramEmail,
        firstName: first_name || '',
        lastName: last_name || '',
        phone: null,
        profilePictureUrl: photo_url || null,
        passwordHash: null,
        role: 'customer'
      });

      // Store OAuth provider info
      await oauthProviders.upsert({
        userId: user.id,
        provider: 'telegram',
        providerId: telegramId,
        providerEmail: telegramEmail,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        rawData: {
          id,
          first_name,
          last_name,
          username,
          photo_url,
          auth_date
        }
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sessions.create({
      userId: user.id,
      sessionToken,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      expiresAt
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await auditLogs.create({
      userId: user.id,
      action: 'TELEGRAM_OAUTH_LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}&refreshToken=${refreshToken}&sessionToken=${sessionToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Telegram callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
  }
});

// ============================================
// USER PROFILE
// ============================================

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    const user = await users.getById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get connected OAuth providers
    const providers = await oauthProviders.getByUserId(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profilePictureUrl: user.profile_picture_url,
        role: user.role,
        active: user.active,
        createdAt: user.created_at,
        providers: providers.map(p => ({
          provider: p.provider,
          connectedAt: p.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile', message: error.message });
  }
});

/**
 * GET /api/auth/providers
 * List all connected OAuth providers
 */
router.get('/providers', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    const providers = await oauthProviders.getByUserId(decoded.id);

    res.json({
      success: true,
      providers: providers.map(p => ({
        provider: p.provider,
        connectedAt: p.created_at,
        lastUsed: p.updated_at
      }))
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to get providers', message: error.message });
  }
});

/**
 * DELETE /api/auth/providers/:provider
 * Disconnect OAuth provider
 */
router.delete('/providers/:provider', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    const user = await users.getById(decoded.id);

    // Prevent disconnecting if it's the only auth method
    const providers = await oauthProviders.getByUserId(decoded.id);
    const hasPassword = !!user.password_hash;

    if (providers.length === 1 && !hasPassword) {
      return res.status(400).json({ error: 'Cannot disconnect the only authentication method' });
    }

    await oauthProviders.delete(decoded.id, req.params.provider);

    await auditLogs.create({
      userId: decoded.id,
      action: 'OAUTH_DISCONNECT',
      resourceType: 'oauth_provider',
      resourceId: req.params.provider,
      ipAddress: getClientIp(req),
      status: 'success'
    });

    res.json({
      success: true,
      message: `${req.params.provider} provider disconnected`
    });
  } catch (error) {
    console.error('Disconnect provider error:', error);
    res.status(500).json({ error: 'Failed to disconnect provider', message: error.message });
  }
});

export default router;
