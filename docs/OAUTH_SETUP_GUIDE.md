# Multi-Provider OAuth Integration Guide

This guide explains how to set up OAuth authentication with Google, Facebook, Instagram, and Google IAM for the Apolaki Solar Platform.

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Facebook OAuth Setup](#facebook-oauth-setup)
3. [Instagram OAuth Setup](#instagram-oauth-setup)
4. [Google IAM Setup](#google-iam-setup)
5. [Environment Configuration](#environment-configuration)
6. [Testing OAuth Flows](#testing-oauth-flows)
7. [Security Best Practices](#security-best-practices)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a Project" → "New Project"
3. Name it "Apolaki Solar Platform"
4. Click "Create"

### Step 2: Enable OAuth APIs

1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" and click "Enable"
3. Search for "Google Identity Service" and click "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Add Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
5. Click "Create"
6. Copy the Client ID and Client Secret

### Step 4: Add to .env

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

---

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in app details and create

### Step 2: Configure Facebook Login

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as the platform
4. Go to "Facebook Login" → "Settings"
5. Add Valid OAuth Redirect URIs:
   - `http://localhost:3001/api/auth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/facebook/callback` (production)

### Step 3: Get Your Credentials

1. Go to "Settings" → "Basic"
2. Copy the App ID and App Secret

### Step 4: Add to .env

```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/auth/facebook/callback
```

---

## Instagram OAuth Setup

### Step 1: Set Up Instagram Graph API

1. Go to [Instagram App Dashboard](https://developers.facebook.com/)
2. Use the same app created for Facebook
3. Go to "Products" → "Instagram Graph API"
4. Click "Configure" to set it up

### Step 2: Add Instagram App Roles

1. Go to "Roles" → "Apps"
2. Add the Instagram app to your test role

### Step 3: Configure Callback URL

1. Add to your app's OAuth Redirect URIs:
   - `http://localhost:3001/api/auth/instagram/callback` (development)
   - `https://yourdomain.com/api/auth/instagram/callback` (production)

### Step 4: Add to .env

```bash
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_CALLBACK_URL=http://localhost:3001/api/auth/instagram/callback
```

---

## Google IAM Setup

### Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" → "Service Accounts"
3. Click "Create Service Account"
4. Name: "apolaki-solar-iam"
5. Click "Create and Continue"

### Step 2: Grant Required Roles

1. Assign these roles:
   - `roles/resourcemanager.projectIamAdmin`
   - `roles/iam.securityAdmin`
   - `roles/iam.roleAdmin`
2. Click "Continue" → "Done"

### Step 3: Create and Download Key

1. Click on the created service account
2. Go to "Keys" → "Add Key" → "Create new key"
3. Choose "JSON"
4. Click "Create" and download the key file
5. Save it as `service-account-key.json`

### Step 4: Add to .env

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_PROJECT_ID=your_project_id
```

---

## Environment Configuration

### Complete .env file for Backend

```bash
# ===== DATABASE =====
NETLIFY_DATABASE_URL=postgresql://user:password@host:5432/apolaki_solar

# ===== SERVER =====
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ===== JWT & SESSION =====
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRY=24h
SESSION_SECRET=your_session_secret_change_in_production

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# ===== FACEBOOK OAUTH =====
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/auth/facebook/callback

# ===== INSTAGRAM OAUTH =====
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_secret
INSTAGRAM_CALLBACK_URL=http://localhost:3001/api/auth/instagram/callback
```

---

## Testing OAuth Flows

### 1. Local Testing Setup

```bash
# Backend
cd middleware/netlify-db-service
npm install
cp .env.example .env
# Fill in OAuth credentials
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### 2. Test Email/Password Login

```bash
POST /api/auth/signup
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+1234567890"
}
```

### 3. Test Google OAuth

1. Visit `http://localhost:5173/login`
2. Click "Google" button
3. You'll be redirected to Google login
4. After authorization, you'll be redirected to `/auth-callback`
5. Profile data will be fetched and you'll be redirected to dashboard

### 4. Test Facebook OAuth

1. Visit `http://localhost:5173/login`
2. Click "Facebook" button
3. Complete Facebook authorization
4. You'll be redirected to dashboard

### 5. Test Instagram OAuth

1. Visit `http://localhost:5173/login`
2. Click "Instagram" button
3. Complete Instagram authorization
4. You'll be redirected to dashboard

---

## Security Best Practices

### 1. Environment Variables

- **Never commit** `.env` file to version control
- Use strong, random values for JWT_SECRET and SESSION_SECRET
- Rotate secrets regularly

### 2. HTTPS in Production

- Always use HTTPS in production
- Update all OAuth callback URLs to use `https://`
- Set `secure: true` in session cookies

### 3. Token Management

- Access tokens expire in 24 hours
- Refresh tokens are valid for 7 days
- Implement token rotation on refresh

### 4. CORS Configuration

```javascript
// Whitelist only your frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};
```

### 5. Rate Limiting

Add rate limiting to prevent brute force attacks:

```bash
npm install express-rate-limit
```

### 6. SQL Injection Prevention

- All queries use parameterized statements via Neon
- Zod validation on all inputs

### 7. CSRF Protection

- Enable CSRF tokens for state-changing operations
- Validate state parameter in OAuth callbacks

### 8. Session Security

- HTTPOnly cookies prevent XSS attacks
- Secure flag requires HTTPS in production
- Session expiration: 24 hours

### 9. Audit Logging

All authentication actions are logged:
- Successful login/logout
- Failed login attempts
- OAuth connections
- Provider disconnections

Query audit logs:
```sql
SELECT * FROM audit_logs WHERE user_id = 'user_id' ORDER BY created_at DESC;
```

### 10. OAuth Provider Configuration

- Request minimal scopes needed
- Validate provider email addresses
- Store refresh tokens securely
- Implement token refresh logic

---

## Frontend Integration

### 1. Login Component

The `OAuthLogin.vue` component handles OAuth button rendering:

```vue
<template>
  <OAuthLogin />
</template>

<script setup>
import OAuthLogin from '../components/OAuthLogin.vue'
</script>
```

### 2. Callback Handling

The `AuthCallback.vue` view handles OAuth redirects:

```javascript
// URL parameters after OAuth redirect
const { token, refreshToken, sessionToken } = route.query

// Store tokens
userStore.setAuthTokens({
  token,
  refreshToken,
  sessionToken
})

// Fetch user profile
await userStore.getProfile()
```

### 3. Provider Management

Users can disconnect OAuth providers:

```javascript
// In user profile/settings
await userStore.disconnectProvider('google')
```

---

## Database Schema

### oauth_providers table

```sql
CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- 'google', 'facebook', 'instagram'
  provider_id VARCHAR(255),
  provider_email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  raw_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(provider, provider_id)
);
```

### sessions table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_token VARCHAR(500) UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### audit_logs table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP
);
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/signup              - Register with email/password
POST   /api/auth/login               - Login with email/password
POST   /api/auth/logout              - Logout
POST   /api/auth/refresh             - Refresh JWT token

GET    /api/auth/google              - Redirect to Google login
GET    /api/auth/google/callback     - Google OAuth callback
GET    /api/auth/facebook            - Redirect to Facebook login
GET    /api/auth/facebook/callback   - Facebook OAuth callback
GET    /api/auth/instagram           - Redirect to Instagram login
GET    /api/auth/instagram/callback  - Instagram OAuth callback

GET    /api/auth/me                  - Get current user profile
GET    /api/auth/providers           - List connected OAuth providers
DELETE /api/auth/providers/:provider - Disconnect OAuth provider
```

---

## Troubleshooting

### OAuth Redirect Loop

**Problem**: Continuously redirected to login
**Solution**: Check that frontend URL in .env matches `FRONTEND_URL` variable

### Token Expired Errors

**Problem**: Getting 401 errors
**Solution**: Implement token refresh logic in API interceptor

### Provider Not Found

**Problem**: OAuth provider returns 404
**Solution**: Verify callback URLs match exactly in OAuth app settings

### Email Not Returned

**Problem**: Instagram or Facebook doesn't provide email
**Solution**: Request email permission in scope, or use provider ID as fallback

---

## Next Steps

1. ✅ Set up OAuth credentials
2. ✅ Configure environment variables
3. ✅ Test authentication flows
4. ✅ Implement profile picture storage
5. ✅ Add provider-specific features
6. ✅ Set up production deployment
7. ✅ Monitor audit logs

For more information, see the main README.md and API documentation.
