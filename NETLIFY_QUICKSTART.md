# Netlify Deployment Quick Start

This guide will get Apolaki Solar Platform running on Netlify in minutes.

## What You Need

1. **Git Repository** - GitHub, GitLab, or Bitbucket account with Apolaki code
2. **Netlify Account** - Free at <https://netlify.com>
3. **PostgreSQL Database** - We recommend Netlify's Neon integration (free)
4. **OAuth Credentials** (Optional but recommended) - Google, Facebook, Instagram, etc.

## 5-Minute Quickstart

### Step 1: Connect Your Repository

1. Go to <https://app.netlify.com>
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider and repository
4. Accept the build settings (auto-detected from `netlify.toml`)
5. Click **"Deploy site"**

**That's it!** Netlify will build and deploy automatically.

### Step 2: Set Up Database (If Not Using Neon)

If you already have Netlify Neon connected:
- Database URL will be automatically available as `NETLIFY_DATABASE_URL`
- Skip to Step 3

If using your own PostgreSQL:
1. Go to your Netlify site → **Settings** → **Build & deploy** → **Environment**
2. Add environment variable:
   ```
   NETLIFY_DATABASE_URL=postgresql://user:password@host:port/database
   ```

### Step 3: Add Required Secrets

Still in Environment variables, add:

```
JWT_SECRET=<generate-a-random-string>
SESSION_SECRET=<generate-a-random-string>
NODE_ENV=production
FRONTEND_URL=https://your-site.netlify.app
```

**Tip:** Generate secure random strings with:
```bash
openssl rand -hex 32
```

### Step 4: Verify Deployment

1. Visit your site: `https://your-site.netlify.app`
2. You should see the Apolaki landing page
3. Try signing up or logging in
4. Check **Functions** tab in Netlify dashboard to see API calls

**Done!** Your app is live.

## Troubleshooting

### "Cannot find module" during build
- Check build logs: **Builds** → Click build → **Deploy log**
- Ensure all dependencies are in `package.json`
- Run locally: `npm ci && npm run build`

### API returns 404
- Check Netlify Functions are deployed: **Functions** tab should show `handler`
- Verify `netlify.toml` redirect:
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "/.netlify/functions/handler/:splat"
  ```

### Database connection fails
- Verify `NETLIFY_DATABASE_URL` is set correctly
- Test connection locally first
- Check database credentials

### CORS errors in browser console
- Ensure `CORS_ALLOWED_ORIGINS` includes your Netlify domain
- Add to environment: `CORS_ALLOWED_ORIGINS=https://your-site.netlify.app`

## Full Setup (With OAuth)

For Google, Facebook, Instagram, Viber, or Telegram login:

### Use the Setup Script
```bash
chmod +x scripts/netlify-env-setup.sh
./scripts/netlify-env-setup.sh your-site-name
```

This script will prompt you for OAuth credentials and set everything up.

### Manual Setup

1. Get OAuth credentials:
   - **Google:** <https://console.cloud.google.com/apis/credentials>
   - **Facebook:** <https://developers.facebook.com/apps/>
   - **Instagram:** <https://developers.instagram.com/apps/>

2. In Netlify Environment variables, add:
   ```
   GOOGLE_CLIENT_ID=<your-id>
   GOOGLE_CLIENT_SECRET=<your-secret>
   GOOGLE_CALLBACK_URL=https://your-site.netlify.app/api/auth/google/callback
   ```

3. Update OAuth provider settings to allow:
   ```
   https://your-site.netlify.app/api/auth/[provider]/callback
   ```

4. Redeploy: **Builds** → **Trigger deploy** → **Deploy site**

## Configuration Reference

### Required Environment Variables

| Variable | Value | Example |
|----------|-------|---------|
| `NETLIFY_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Random 32-byte hex string | `a1b2c3d4e5f6g7h8...` |
| `SESSION_SECRET` | Random 32-byte hex string | `x9y8z7w6v5u4t3s2...` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | Your Netlify domain | `https://apolaki.netlify.app` |

### Optional OAuth Variables

**Google:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_PROJECT_ID`

**Facebook:**
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_CALLBACK_URL`

**Instagram:**
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `INSTAGRAM_CALLBACK_URL`

**Viber & Telegram:** (see full documentation)

## Architecture

```
┌─────────────────────────────────────────────┐
│           Your Browser                      │
│  https://your-site.netlify.app             │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    GET /              GET /api/users
    (serves static)    (redirects)
         │                    │
         ▼                    ▼
┌──────────────────────────────────────────────┐
│        Netlify Edge / CDN                   │
│                                            │
│  frontend/dist (Vue.js app)                │
│  /.netlify/functions/handler (Express API) │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    Return HTML/JS      Database Queries
         │                    │
         │                    ▼
         │           ┌────────────────┐
         │           │  PostgreSQL    │
         │           │  (Neon/Custom) │
         │           └────────────────┘
         │
    ┌────┴──────────┐
    │ Browser Cache │
    └───────────────┘
```

## Performance

After deployment, check:

- **Page Load:** < 3 seconds (check browser DevTools)
- **API Response:** < 200ms (check Network tab)
- **Uptime:** Monitor in Netlify Analytics

## Monitoring

In your Netlify dashboard:

- **Builds:** Track build success/failure, duration, logs
- **Functions:** Monitor API invocations, errors, cold start times
- **Analytics:** Track page views, traffic, performance

## Git Workflow

The app uses automatic deployments:

```
Your Git Repository
     ↓
Push to main → Production deployment (automatic)
     ↓
Push to other branch → Preview deployment (automatic)
     ↓
Open pull request → Deploy preview (automatic)
```

## Custom Domain

To use a custom domain:

1. In Netlify: **Settings** → **Domain management**
2. Add your domain
3. Update OAuth provider callback URLs to use custom domain
4. Update `FRONTEND_URL` environment variable

## Scaling

Netlify automatically scales your app:

- **Functions:** Serverless (handles spikes automatically)
- **Database:** Use connection pooling (included in backend)
- **Assets:** Cached globally via CDN

For high traffic:
1. Monitor function invocation times
2. Upgrade PostgreSQL plan if needed
3. Add caching headers for static assets

## Support & Next Steps

- Full docs: `/docs/NETLIFY_DEPLOYMENT.md`
- Troubleshooting: `NETLIFY_CHECKLIST.md`
- Netlify Docs: <https://docs.netlify.com>
- Report issues: GitHub repository

## Commands

```bash
# Build locally
npm run build

# Test Netlify build locally
netlify build

# Deploy preview
netlify deploy

# Deploy production
netlify deploy --prod

# View logs
netlify logs functions

# List environment variables
netlify env:list
```

## Questions?

Refer to the full documentation in `/docs/NETLIFY_DEPLOYMENT.md` or check the Netlify dashboard for build logs and function invocations.

Good luck! 🚀
