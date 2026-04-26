# Viber and Telegram Integration Guide

## Overview

This guide covers the integration of **Viber** and **Telegram** OAuth authentication into the Apolaki Solar Platform. These platforms are particularly important for reaching users in the Philippines and other Southeast Asian markets where messaging apps are primary communication channels.

## Table of Contents

1. [Viber OAuth Setup](#viber-oauth-setup)
2. [Telegram OAuth Setup](#telegram-oauth-setup)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Viber OAuth Setup

### Prerequisites

- Viber account
- Viber Business account (if not already created)
- Access to Viber Business Console

### Step 1: Create a Viber Bot

1. Visit [Viber Business Console](https://www.viber.com/business/console/)
2. Click **"Create New Bot"**
3. Fill in the bot details:
   - **Bot Name**: Apolaki Solar Platform
   - **Bot Icon**: Upload a square image (200x200px)
   - **Description**: Solar energy platform for the Philippines
4. Accept the terms and click **"Create"**

### Step 2: Configure OAuth Settings

1. In the bot dashboard, go to **Settings**
2. Navigate to **OAuth Settings** or **API Integration**
3. Add your callback URLs:
   - **Development**: `http://localhost:3001/api/auth/viber/callback`
   - **Production**: `https://yourdomain.com/api/auth/viber/callback`
4. Note the generated:
   - **Client ID** (Bot ID)
   - **Client Secret** (Bot Token)

### Step 3: Set Webhook (Optional for Web Login)

If you want to handle incoming messages:

1. Go to **Webhook** settings
2. Enter your webhook URL: `https://yourdomain.com/api/viber/webhook`
3. Viber will send POST requests to this endpoint

### Step 4: Update Environment Variables

Add to your `.env` file:

```bash
VIBER_CLIENT_ID=your_viber_bot_id_here
VIBER_CLIENT_SECRET=your_viber_bot_token_here
VIBER_CALLBACK_URL=http://localhost:3001/api/auth/viber/callback
```

---

## Telegram OAuth Setup

### Prerequisites

- Telegram account
- Telegram Desktop or Web app access
- BotFather access

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a conversation and send `/start`
3. Send `/newbot`
4. Follow the prompts:
   - **Bot name**: Apolaki Solar Platform
   - **Bot username**: `apolaki_solar_bot` (must be unique and end with `_bot`)
5. BotFather will provide:
   - **Bot Token**: Format like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### Step 2: Configure Bot Settings

1. Send `/mybots` to BotFather
2. Select your bot
3. Click **"Bot Settings"**
4. Configure:
   - **Commands**: You can add commands like `/start`, `/help`, etc.
   - **Description**: Brief description of your bot
   - **About**: Detailed information

### Step 3: Enable Login Button

1. Send `/mybots` to BotFather
2. Select your bot
3. Click **"Bot Settings"** → **"Inline Queries"**
4. Configure allowed domains:
   - **Development**: `localhost:3001`
   - **Production**: `yourdomain.com`

### Step 4: Update Environment Variables

Add to your `.env` file:

```bash
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=apolaki_solar_bot
TELEGRAM_CALLBACK_URL=http://localhost:3001/api/auth/telegram/callback
```

---

## Backend Configuration

### 1. Install Dependencies

The necessary packages have been added to `package.json`:

```bash
npm install passport-viber passport-telegram
```

Or if not already installed:

```bash
cd middleware/netlify-db-service
npm install
```

### 2. Verify Passport Strategies

Check that `src/auth/passport.js` includes:

```javascript
import ViberStrategy from 'passport-viber';
import TelegramStrategy from 'passport-telegram';

// Strategies are initialized in initializePassport()
```

### 3. Database Schema

The existing `schema.sql` already supports Viber and Telegram through the `oauth_providers` table:

```sql
CREATE TABLE oauth_providers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(500) NOT NULL UNIQUE,
  provider_email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. API Routes

The routes are automatically available:

- **Viber Login**: `GET /api/auth/viber`
- **Viber Callback**: `GET /api/auth/viber/callback`
- **Telegram Login**: `GET /api/auth/telegram`
- **Telegram Callback**: `GET /api/auth/telegram/callback`

### 5. Server Initialization

The server automatically initializes both strategies:

```javascript
// src/server.js
initializePassport(); // Initializes all strategies including Viber & Telegram
```

---

## Frontend Integration

### 1. Updated OAuthLogin Component

The `src/components/OAuthLogin.vue` component now includes Viber and Telegram buttons:

```vue
<button @click="loginWithViber" class="oauth-btn viber-btn">
  Viber
</button>

<button @click="loginWithTelegram" class="oauth-btn telegram-btn">
  Telegram
</button>
```

### 2. Login Functions

The component includes the login handler functions:

```javascript
const loginWithViber = () => {
  isLoading.value = true
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/viber`
}

const loginWithTelegram = () => {
  isLoading.value = true
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/telegram`
}
```

### 3. OAuth Callback Handler

The existing `src/views/AuthCallback.vue` automatically handles all OAuth providers, including Viber and Telegram:

```javascript
// Handles token extraction and storage for all providers
const token = route.query.token
const refreshToken = route.query.refreshToken
const sessionToken = route.query.sessionToken
```

### 4. Styling

Button colors in `OAuthLogin.vue`:

```css
.viber-btn:hover:not(:disabled) {
  color: #7b68ee;
  border-color: #7b68ee;
}

.telegram-btn:hover:not(:disabled) {
  color: #0088cc;
  border-color: #0088cc;
}
```

---

## Testing

### Local Testing Setup

1. **Start Backend**:
```bash
cd middleware/netlify-db-service
npm run dev
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Test Viber Login**:
   - Click **"Viber"** button on login page
   - You'll be redirected to Viber OAuth
   - Allow permissions
   - Should redirect back with tokens

4. **Test Telegram Login**:
   - Click **"Telegram"** button on login page
   - Scan QR code or authorize in Telegram
   - Should redirect back with tokens

### Testing with curl

```bash
# Get OAuth authorize URL (Viber)
curl http://localhost:3001/api/auth/viber

# Get OAuth authorize URL (Telegram)
curl http://localhost:3001/api/auth/telegram
```

### Testing Provider Management

```bash
# Get connected providers
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/auth/providers

# Disconnect a provider
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/auth/providers/viber
```

---

## Deployment

### Netlify Deployment

1. **Update Environment Variables** in Netlify:
   - Go to **Site settings** → **Build & deploy** → **Environment**
   - Add:
     ```
     VIBER_CLIENT_ID=...
     VIBER_CLIENT_SECRET=...
     TELEGRAM_BOT_TOKEN=...
     TELEGRAM_BOT_USERNAME=...
     ```

2. **Update Callback URLs**:
   - **Viber**: Change callback URL to `https://yourdomain.netlify.app/api/auth/viber/callback`
   - **Telegram**: No callback URL change needed (Telegram doesn't require it)

3. **Update Frontend .env**:
   ```
   VITE_API_URL=https://yourdomain.netlify.app
   ```

### Custom Domain

1. Add your custom domain in Netlify
2. Update OAuth callback URLs:
   - Viber: `https://yourdomain.com/api/auth/viber/callback`
   - Telegram: Use your domain in allowed domains list

### CORS Configuration

Update `.env`:
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://yourdomain.netlify.app
FRONTEND_URL=https://yourdomain.com
```

---

## Troubleshooting

### Viber Issues

#### "Invalid Client ID/Secret"
- Verify credentials in Viber Business Console
- Check `.env` for typos
- Ensure bot is active

#### "Redirect URI mismatch"
- Viber callback URL must match exactly in console
- Check for trailing slashes: `http://localhost:3001/api/auth/viber/callback`
- Production domain must be HTTPS

#### "Bot not found"
- Ensure bot is published in Viber Business Console
- Check that bot ID matches `VIBER_CLIENT_ID`

### Telegram Issues

#### "Bot token invalid"
- Copy token directly from BotFather
- Don't modify or add extra characters
- Format: `123456:ABC-DEF...`

#### "Domain not authorized"
- Add domain to Telegram bot allowed domains
- For localhost: Add `localhost:3001`
- For production: Add your domain

#### "User not found after callback"
- Check that user creation is working in `setupTelegramStrategy()`
- Verify database connection
- Check audit logs for errors

### Common Issues

#### Tokens not returned
- Check redirect URL in callback route
- Ensure frontend URL is correct
- Check browser console for errors

#### CORS errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Check header configuration in `src/server.js`

#### Session expiry issues
- Check `SESSION_SECRET` is set in `.env`
- Verify session middleware is initialized
- Check cookie configuration

#### Database errors
- Ensure `oauth_providers` table exists
- Run schema migration if needed
- Check database connection string

### Debug Logging

Enable detailed logging by setting:

```bash
LOG_LEVEL=debug
NODE_ENV=development
```

Check logs for detailed error messages.

### Get Help

1. Check `AUTH_TESTING.js` for test data
2. Review error messages in browser console
3. Check server logs in terminal
4. Verify all environment variables are set
5. Test database connectivity separately

---

## Features

### Automatic User Creation

Both Viber and Telegram automatically create users on first login:

```javascript
// Telegram: Creates user with Telegram name
{
  email: "${telegramId}@telegram.local",
  firstName: profile.first_name,
  lastName: profile.last_name,
  phoneNumber: profile.phone_number
}

// Viber: Creates user with Viber profile info
{
  email: viberEmail,
  firstName: profile.displayName,
  lastName: profile.lastName,
  phoneNumber: profile.phoneNumber
}
```

### Account Linking

Users can link multiple OAuth providers to their account:

1. Login with first provider (e.g., Telegram)
2. In settings, click "Connect Viber"
3. Authorize Viber
4. Both providers are now linked

### Session Management

Sessions are automatically created on login:

- 24-hour expiration
- IP and User-Agent tracking
- Can be invalidated on logout
- Supports multiple sessions per user

### Audit Logging

All authentication events are logged:

```
VIBER_OAUTH_LOGIN
TELEGRAM_OAUTH_LOGIN
OAUTH_DISCONNECT
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure Viber OAuth
3. ✅ Configure Telegram OAuth
4. ✅ Update `.env` file
5. ✅ Test locally
6. ✅ Deploy to production
7. Deploy to Netlify
8. Update production environment variables
9. Test in production
10. Monitor audit logs

---

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review detailed documentation at `OAUTH_SETUP_GUIDE.md`
3. Check audit logs for error details
4. Test with `AUTH_TESTING.js`

---

## Security Notes

⚠️ **Important**:

1. **Never commit `.env`** with real credentials
2. **Use HTTPS** in production
3. **Rotate secrets** regularly
4. **Monitor audit logs** for suspicious activity
5. **Keep dependencies updated** with `npm audit fix`
6. **Validate user input** from OAuth providers
7. **Use secure session cookies** (httpOnly, secure flags)
8. **Implement rate limiting** on auth endpoints

---

## Philippines-Specific Considerations

### Why Viber and Telegram?

- **Wide adoption** in the Philippines
- **Mobile-first** approach matches user base
- **Cost-effective** for users (free platforms)
- **Popular among rural areas** with limited data plans
- **Business messaging** standard in Philippines

### Localization

Consider adding:
- Filipino language support
- Local payment methods
- Philippines-specific terms of service
- Local number formats for phone fields

### Market Fit

These integrations help Apolaki reach:
- Tech-savvy millennials
- Rural communities
- Small business owners
- Agricultural sector users

---

End of Viber and Telegram Integration Guide
