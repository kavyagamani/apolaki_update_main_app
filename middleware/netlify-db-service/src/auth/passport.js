/**
 * OAuth Providers Configuration
 * Handles OAuth strategy setup for Google, Facebook, Instagram, Viber, and Telegram
 */

import passportModule from 'passport';
import FacebookStrategyModule from 'passport-facebook';
import GoogleStrategyModule from 'passport-google-oauth20';
import InstagramStrategyModule from 'passport-instagram';
import LocalStrategyModule from 'passport-local';
import { oauthProviders, users } from '../db.js';
import { verifyPassword } from './password.js';

// Handle CJS/ESM interop — esbuild on Netlify can double-wrap default exports
const passport = passportModule.default || passportModule;
const FacebookStrategy = FacebookStrategyModule.default || FacebookStrategyModule;
const GoogleStrategy = GoogleStrategyModule.default || GoogleStrategyModule;
const InstagramStrategy = InstagramStrategyModule.default || InstagramStrategyModule;
const LocalStrategy = LocalStrategyModule.default || LocalStrategyModule;

/**
 * Local Strategy (Email/Password)
 */
export function setupLocalStrategy() {
  passport.use(
    new LocalStrategy.Strategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await users.getByEmail(email);
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          const isValidPassword = await verifyPassword(password, user.password_hash);
          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

/**
 * Google OAuth Strategy
 */
export function setupGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientID || !clientSecret || clientID.startsWith('your_')) {
    console.log('⚠️  Google OAuth not configured – skipping strategy');
    return;
  }
  passport.use(
    new GoogleStrategy.Strategy(
      {
        clientID,
        clientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        accessType: 'offline',
        prompt: 'consent'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await users.getByEmail(profile.emails[0].value);

          if (!user) {
            // Create new user
            user = await users.create({
              email: profile.emails[0].value,
              firstName: profile.name.givenName || '',
              lastName: profile.name.familyName || '',
              profilePictureUrl: profile.photos[0]?.value || null,
              passwordHash: null
            });
          }

          // Store/update OAuth provider info
          await oauthProviders.upsert({
            userId: user.id,
            provider: 'google',
            providerId: profile.id,
            providerEmail: profile.emails[0].value,
            accessToken,
            refreshToken,
            tokenExpiresAt: refreshToken ? new Date(Date.now() + 3600000) : null,
            rawData: profile._json
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

/**
 * Facebook OAuth Strategy
 */
export function setupFacebookStrategy() {
  const clientID = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  if (!clientID || !clientSecret || clientID.startsWith('your_')) {
    console.log('⚠️  Facebook OAuth not configured – skipping strategy');
    return;
  }
  passport.use(
    new FacebookStrategy.Strategy(
      {
        clientID,
        clientSecret,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3001/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'name', 'emails', 'picture.type(large)']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false, { message: 'No email provided by Facebook' });
          }

          let user = await users.getByEmail(email);

          if (!user) {
            // Create new user
            user = await users.create({
              email,
              firstName: profile.name?.givenName || profile.displayName || '',
              lastName: profile.name?.familyName || '',
              profilePictureUrl: profile.photos[0]?.value || null,
              passwordHash: null
            });
          }

          // Store/update OAuth provider info
          await oauthProviders.upsert({
            userId: user.id,
            provider: 'facebook',
            providerId: profile.id,
            providerEmail: email,
            accessToken,
            refreshToken: null,
            tokenExpiresAt: null,
            rawData: profile._json
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

/**
 * Instagram OAuth Strategy
 */
export function setupInstagramStrategy() {
  const clientID = process.env.INSTAGRAM_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!clientID || !clientSecret || clientID.startsWith('your_')) {
    console.log('⚠️  Instagram OAuth not configured – skipping strategy');
    return;
  }
  passport.use(
    new InstagramStrategy.Strategy(
      {
        clientID,
        clientSecret,
        callbackURL: process.env.INSTAGRAM_CALLBACK_URL || 'http://localhost:3001/api/auth/instagram/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Instagram doesn't provide email via basic strategy, use custom logic
          const instagramId = profile.id;
          const username = profile.username;

          // Check if user exists with Instagram provider
          let oauthRecord = await oauthProviders.getByProvider('instagram', instagramId);
          let user;

          if (oauthRecord) {
            user = await users.getById(oauthRecord.user_id);
          } else {
            // Create new user with Instagram username
            user = await users.create({
              email: `${username}@instagram.local`,
              firstName: profile.displayName || username,
              lastName: '',
              profilePictureUrl: profile.photos[0]?.value || null,
              passwordHash: null
            });

            // Store OAuth provider info
            await oauthProviders.upsert({
              userId: user.id,
              provider: 'instagram',
              providerId: profile.id,
              providerEmail: null,
              accessToken,
              refreshToken: null,
              tokenExpiresAt: null,
              rawData: profile._json
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

/**
 * Viber OAuth Strategy (Custom Implementation)
 */
export function setupViberStrategy() {
  // Note: Viber OAuth uses custom implementation in auth routes
  // This is a placeholder that can be extended with custom logic
  console.log('Viber OAuth strategy ready');
}

/**
 * Telegram OAuth Strategy (Custom Implementation)
 */
export function setupTelegramStrategy() {
  // Note: Telegram OAuth uses custom implementation in auth routes
  // This is a placeholder that can be extended with custom logic
  console.log('Telegram OAuth strategy ready');
}

/**
 * Serialize user for session
 */
export function setupSerialization() {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await users.getById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

/**
 * Initialize Passport strategies
 */
export function initializePassport() {
  setupLocalStrategy();
  setupGoogleStrategy();
  setupFacebookStrategy();
  setupInstagramStrategy();
  setupViberStrategy();
  setupTelegramStrategy();
  setupSerialization();
}
