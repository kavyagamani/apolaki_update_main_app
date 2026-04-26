# Apolaki Solar Platform - Netlify Deployment Guide

This guide walks you through deploying the Apolaki Solar Platform on Netlify.

## Prerequisites

- Netlify account (<https://netlify.com>)
- Git repository (GitHub, GitLab, or Bitbucket)
- A PostgreSQL database (we recommend Netlify's Neon integration)
- OAuth credentials (Google, Facebook, Instagram, Viber, Telegram) - optional but recommended

## Architecture Overview

The Apolaki platform on Netlify consists of:

- **Frontend**: Vue.js 3 app compiled to static files, served from Netlify's CDN
- **Backend**: Express.js API wrapped as Netlify Functions, runs serverless
- **Database**: PostgreSQL via Neon (Netlify's managed database)
- **Redirects**: API requests routed from `/api/*` to `/.netlify/functions/handler/*`

## Step-by-Step Deployment

### Step 1: Connect Your Repository to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the repository containing Apolaki
5. Click "Deploy site"

Netlify will auto-detect that this is a monorepo and use the build settings from `netlify.toml`.

### Step 2: Set Up the PostgreSQL Database

#### Option A: Netlify + Neon (Recommended)

Netlify offers a managed PostgreSQL database via Neon.

1. In your Netlify site settings, go to **Integrations** → **Add an integration**
2. Search for "Neon"
3. Click "Connect Neon"
4. Follow Neon's setup flow (create account or log in)
5. Create a new project in Neon
6. Netlify will automatically add the `NETLIFY_DATABASE_URL` environment variable

#### Option B: Self-Hosted PostgreSQL

If using your own PostgreSQL database:

1. Go to your Netlify site → **Site settings** → **Build & deploy** → **Environment**
2. Add the following environment variable:
   ```
   NETLIFY_DATABASE_URL=postgresql://username:password@host:port/database
   ```

### Step 3: Configure Environment Variables

1. Go to your Netlify site → **Site settings** → **Build & deploy** → **Environment**
2. Add the following required environment variables:

#### Core Configuration
```
NODE_ENV=production
FRONTEND_URL=https://your-netlify-site.netlify.app
JWT_SECRET=<generate-a-secure-random-string>
JWT_EXPIRY=24h
SESSION_SECRET=<generate-another-secure-random-string>
API_BASE_URL=https://your-netlify-site.netlify.app/api
CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

#### OAuth Credentials (Optional but Recommended)

**Google OAuth:**
- Get credentials: https://console.cloud.google.com/apis/credentials
- Add to Netlify:
  ```
  GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=<your-client-secret>
  GOOGLE_CALLBACK_URL=https://your-netlify-site.netlify.app/api/auth/google/callback
  GOOGLE_PROJECT_ID=<your-project-id>
  ```

**Facebook OAuth:**
- Get credentials: https://developers.facebook.com/apps/
- Add to Netlify:
  ```
  FACEBOOK_APP_ID=<your-app-id>
  FACEBOOK_APP_SECRET=<your-app-secret>
  FACEBOOK_CALLBACK_URL=https://your-netlify-site.netlify.app/api/auth/facebook/callback
  ```

**Instagram OAuth:**
- Get credentials: https://developers.instagram.com/
- Add to Netlify:
  ```
  INSTAGRAM_APP_ID=<your-app-id>
  INSTAGRAM_APP_SECRET=<your-app-secret>
  INSTAGRAM_CALLBACK_URL=https://your-netlify-site.netlify.app/api/auth/instagram/callback
  ```

**Viber OAuth:**
- Get credentials: https://viber.com/en/business/tools/public-accounts
- Add to Netlify:
  ```
  VIBER_CLIENT_ID=<your-client-id>
  VIBER_CLIENT_SECRET=<your-client-secret>
  VIBER_CALLBACK_URL=https://your-netlify-site.netlify.app/api/auth/viber/callback
  ```

**Telegram Bot (Optional):**
- Get token: https://t.me/botfather
- Add to Netlify:
  ```
  TELEGRAM_BOT_TOKEN=<your-bot-token>
  TELEGRAM_BOT_USERNAME=<your-bot-username>
  TELEGRAM_CALLBACK_URL=https://your-netlify-site.netlify.app/api/auth/telegram/callback
  ```

#### Database Connection Pool
```
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_CONNECTION_TIMEOUT=30000
DB_IDLE_TIMEOUT=30000
```

#### Logging
```
LOG_LEVEL=info
```

### Step 4: Initialize the Database Schema

After your first deployment:

1. Get the database credentials from your Neon dashboard or your PostgreSQL host
2. Connect to your database and run the schema initialization:
   ```sql
   psql postgresql://username:password@host:port/database < config/init-db.sql
   ```

   Or use the Netlify CLI to run commands on your site.

3. Alternatively, the schema will be created automatically on first API request (see `db.js` `ensureSchema()` function)

### Step 5: Update OAuth Redirect URLs

For each OAuth provider, update the redirect/callback URLs to point to your Netlify domain:

**Example for Google:**
- Authorized redirect URIs should include:
  ```
  https://your-netlify-site.netlify.app/api/auth/google/callback
  ```

Repeat for Facebook, Instagram, Viber, and Telegram.

### Step 6: Trigger a Build

1. Push a commit to your repository, or
2. Go to Netlify → **Builds** → **Trigger deploy** → **Deploy site**

Netlify will:
1. Install dependencies
2. Build the frontend
3. Bundle the backend Express app as a Netlify Function
4. Deploy both

### Step 7: Verify the Deployment

1. Go to your Netlify site URL (e.g., `https://your-netlify-site.netlify.app`)
2. You should see the Apolaki landing page
3. Try logging in or signing up
4. Check the network tab to ensure API calls are reaching `/.netlify/functions/handler`

### Step 8: Set Up Custom Domain (Optional)

1. Go to Netlify → **Site settings** → **Domain management**
2. Add your custom domain
3. Update all OAuth callback URLs to use your custom domain
4. Update environment variables if using custom domain

## Environment-Specific Configuration

The `netlify.toml` file handles different deployment contexts:

### Production Branch
```toml
[context.production]
  command = "npm ci && npm ci --include=dev --prefix frontend && npm ci --prefix middleware/netlify-db-service && npm run build --prefix frontend && npm run build --prefix middleware/netlify-db-service"
  [context.production.environment]
    NODE_ENV = "production"
```

### Deploy Previews (Pull Request Previews)
```toml
[context.deploy-preview]
  command = "npm ci && npm ci --include=dev --prefix frontend && npm ci --prefix middleware/netlify-db-service && npm run build --prefix frontend && npm run build --prefix middleware/netlify-db-service"
  [context.deploy-preview.environment]
    NODE_ENV = "development"
```

To use environment-specific variables, create environment variables with context prefixes:
- `production_VARIABLE_NAME`
- `deploy-preview_VARIABLE_NAME`
- `branch-deploy_VARIABLE_NAME`

## Troubleshooting

### Build Fails with "Database URL not configured"

**Solution:**
1. Check that `NETLIFY_DATABASE_URL` is set in Site settings → Environment
2. If using Neon integration, re-run the Neon integration connection
3. Redeploy the site

### API Requests Return 404

**Solution:**
1. Check that the redirect in `netlify.toml` is correct:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/handler/:splat"
     status = 200
     force = true
   ```
2. Ensure `/api/*` requests are not being served as static files
3. Check the deploy logs in Netlify for function bundling errors

### CORS Errors

**Solution:**
1. Ensure `CORS_ALLOWED_ORIGINS` includes your Netlify domain:
   ```
   CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
   ```
2. In `netlify.toml`, verify CORS headers are set:
   ```toml
   [[headers]]
     for = "/api/*"
     [headers.values]
       Access-Control-Allow-Origin = "*"
       Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
       Access-Control-Allow-Headers = "Origin, X-Requested-With, Content-Type, Accept, Authorization"
   ```

### OAuth Redirect Fails

**Solution:**
1. Check that callback URLs are correctly set in OAuth provider (Google, Facebook, etc.)
2. Ensure the callback URL exactly matches the OAuth provider's configuration:
   ```
   https://your-netlify-site.netlify.app/api/auth/[provider]/callback
   ```
3. Check that `JWT_SECRET` and `JWT_EXPIRY` are set

### Cold Start Issues

Netlify Functions have a cold start delay. To minimize:
1. Keep the Express app lightweight
2. Use Connection Pooling in `DB_POOL_MIN` and `DB_POOL_MAX`
3. Monitor function invocation duration in Netlify Analytics

## Advanced Configuration

### Edge Functions (Optional CDN Caching)

For static assets and homepage, consider using Netlify Edge Functions:

```toml
[[edge_functions]]
  function = "cache-static"
  path = "/static/*"
  cache = "public, max-age=31536000"
```

### Analytics

Enable Netlify Analytics to track:
- Function invocations and duration
- Build times
- Deployment success rates

Go to **Site settings** → **Analytics** → **Enable Netlify Analytics**

## Monitoring & Logging

### Netlify Deploy Logs
- Go to **Builds** → Click a build → **Deploy log** (shows build output)

### Netlify Function Logs
- Go to **Functions** → Click a function → **Invocations** (shows runtime logs)

### Application Logs
The backend Express app logs to stdout, visible in:
- Netlify function invocation logs
- CloudWatch logs (if using AWS Lambda)

To add custom logging:
```javascript
console.log('INFO:', message);
console.warn('WARN:', message);
console.error('ERROR:', message);
```

## Continuous Deployment

The app uses Git-based deployments:

1. Push to main branch → automatic production deployment
2. Push to other branches → automatic preview deployments
3. Open pull request → automatic deploy preview generated

## Database Backups

For Netlify Neon:
1. Go to your Neon project dashboard
2. Use Neon's backup feature (automatic daily backups included)

For self-hosted PostgreSQL:
```bash
# Backup
pg_dump postgresql://user:pass@host:port/db > backup.sql

# Restore
psql postgresql://user:pass@host:port/db < backup.sql
```

## Support & Resources

- Netlify Docs: https://docs.netlify.com
- Neon Docs: https://neon.tech/docs
- Express.js: https://expressjs.com
- Vue.js: https://vuejs.org

## Next Steps

1. Configure monitoring and alerting in Netlify Analytics
2. Set up custom domain and SSL (automatic with Netlify)
3. Configure custom error pages (404, 500, etc.)
4. Set up CI/CD for automated testing before deployment
5. Configure webhooks for Slack/Discord notifications on deployments
