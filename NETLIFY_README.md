# Getting Apolaki Solar Platform to Work on Netlify

## Quick Summary

✅ **All configuration is now complete for Netlify deployment.**

Your Apolaki Solar Platform is ready to deploy on Netlify. Follow the quick start guide to get your app live in minutes.

## What Was Fixed

1. **Fixed API Routing** - API calls now properly route from `/api/*` to Netlify Functions
2. **Backend Build Process** - Express.js backend is now bundled as Netlify Functions
3. **Environment Configuration** - All environment variables are properly configured
4. **Frontend API Client** - Frontend correctly calls backend via `/api` relative paths
5. **Documentation** - Comprehensive deployment guides created

## Quick Start (5 Minutes)

### 1. Read the Quick Start
```bash
cat NETLIFY_QUICKSTART.md
```

### 2. Connect Your Repository
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select your Git repository
4. Click "Deploy site"

Netlify auto-detects the build configuration from `netlify.toml` ✅

### 3. Set Environment Variables
```bash
./scripts/netlify-env-setup.sh your-netlify-site-name
```

Or manually add in Netlify dashboard:
- `NETLIFY_DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate with `openssl rand -hex 32`
- `SESSION_SECRET` - Generate with `openssl rand -hex 32`
- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your Netlify domain (e.g., `https://apolaki.netlify.app`)

### 4. Verify Deployment
1. Visit your Netlify site
2. You should see the Apolaki landing page
3. Try signing up or logging in
4. Check the **Functions** tab in Netlify dashboard for API calls

**Done!** Your app is live. 🚀

## Documentation Files

Created for you:

| File | Purpose |
|------|---------|
| `NETLIFY_QUICKSTART.md` | 5-minute quick start guide |
| `NETLIFY_CHECKLIST.md` | Pre-deployment verification checklist |
| `NETLIFY_MIGRATION_SUMMARY.md` | Detailed summary of all changes made |
| `docs/NETLIFY_DEPLOYMENT.md` | Comprehensive deployment guide with troubleshooting |

## Files Modified/Created

### Configuration
- ✅ `netlify.toml` - Updated with correct build commands and API routing
- ✅ `frontend/.env.production` - Frontend production environment
- ✅ `frontend/.env.development` - Frontend development environment
- ✅ `middleware/netlify-db-service/.netlify/functions/handler.js` - Updated Netlify Functions handler
- ✅ `middleware/netlify-db-service/package.json` - Added build script

### Documentation (NEW)
- ✅ `NETLIFY_QUICKSTART.md` - Quick start guide
- ✅ `NETLIFY_CHECKLIST.md` - Pre-deployment checklist
- ✅ `NETLIFY_MIGRATION_SUMMARY.md` - Detailed migration summary
- ✅ `docs/NETLIFY_DEPLOYMENT.md` - Comprehensive deployment guide

### Scripts (NEW)
- ✅ `scripts/netlify-env-setup.sh` - Interactive environment variable setup

## Architecture

```
Frontend (Vue.js)
   ↓
Netlify CDN
   ├─ Static assets (dist/)
   └─ API requests → /.netlify/functions/handler
        ↓
   Backend (Express.js)
        ↓
   PostgreSQL Database
```

## How It Works

1. **Frontend builds** → Static files served from Netlify CDN
2. **Backend builds** → Express.js app bundled as Netlify Function
3. **API Calls** → Frontend calls `/api/*` → Netlify redirects to `/.netlify/functions/handler`
4. **Database** → Backend queries PostgreSQL via Neon or self-hosted

All automatic! ✨

## Environment Variables Explained

### Database (Required)
- **`NETLIFY_DATABASE_URL`** - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Get from Netlify Neon integration or your PostgreSQL host

### Security (Required)
- **`JWT_SECRET`** - For signing authentication tokens
  - Generate: `openssl rand -hex 32`
  - Keep secret and consistent across deployments
  
- **`SESSION_SECRET`** - For signing session cookies
  - Generate: `openssl rand -hex 32`
  - Keep secret and consistent across deployments

### Application (Required)
- **`NODE_ENV`** - Set to `production` for production
- **`FRONTEND_URL`** - Your deployed domain (e.g., `https://apolaki.netlify.app`)
- **`API_BASE_URL`** - API endpoint (e.g., `https://apolaki.netlify.app/api`)
- **`CORS_ALLOWED_ORIGINS`** - CORS whitelist (your Netlify domain)

### OAuth (Optional)
- **Google**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- **Facebook**: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL`
- **Instagram**: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_CALLBACK_URL`
- **Viber**: `VIBER_CLIENT_ID`, `VIBER_CLIENT_SECRET`, `VIBER_CALLBACK_URL`
- **Telegram**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_CALLBACK_URL`

See `docs/NETLIFY_DEPLOYMENT.md` for OAuth setup instructions.

## Troubleshooting

### "Cannot find module" during build
→ Check build logs in Netlify Builds tab

### API returns 404
→ Verify netlify.toml has correct `/api/*` redirect

### Database connection fails
→ Verify `NETLIFY_DATABASE_URL` is set and valid

### CORS errors
→ Add your domain to `CORS_ALLOWED_ORIGINS`

See `docs/NETLIFY_DEPLOYMENT.md` for more troubleshooting.

## Deployment Checklist

Before deploying:

```
□ Read NETLIFY_QUICKSTART.md
□ Connected repository to Netlify
□ Set environment variables using ./scripts/netlify-env-setup.sh
□ Verified all required variables are set
□ Database is configured (Neon or self-hosted)
□ Tested build locally: npm run build
```

After deploying:

```
□ Visit your Netlify site
□ See Apolaki landing page
□ Try signing up or logging in
□ Check Functions tab for API invocations
□ Monitor performance in Netlify Analytics
```

## Commands Reference

```bash
# Build frontend only
npm run build --prefix frontend

# Build backend only
npm run build --prefix middleware/netlify-db-service

# Build both (Netlify command)
npm run build:all

# Test Netlify build locally
netlify build

# Test function locally
netlify functions:invoke handler --payload '{"path": "/api/health", "httpMethod": "GET"}'

# Deploy to production
netlify deploy --prod

# View function logs
netlify logs functions

# List environment variables
netlify env:list
```

## Performance

After deployment, your app should meet these targets:

- **Page load time**: < 3 seconds (p95)
- **API response time**: < 200ms (p95)
- **Function cold start**: < 1 second
- **Uptime**: > 99.5%

Monitor in Netlify Analytics dashboard.

## Next Steps

1. **Quick Start** (5 min): Read `NETLIFY_QUICKSTART.md`
2. **Connect to Netlify** (2 min): Link your Git repo
3. **Set Variables** (2 min): Run setup script or use dashboard
4. **Verify** (1 min): Test your deployed site
5. **Monitor** (ongoing): Check Netlify Analytics

**Total time to production: ~15 minutes** ⏱️

## Need Help?

1. **Quick questions** → See `NETLIFY_QUICKSTART.md`
2. **Pre-deployment checklist** → See `NETLIFY_CHECKLIST.md`
3. **Detailed guide** → See `docs/NETLIFY_DEPLOYMENT.md`
4. **What changed** → See `NETLIFY_MIGRATION_SUMMARY.md`
5. **Netlify docs** → https://docs.netlify.com
6. **Report issues** → GitHub repository

## What's Working Now

✅ Frontend builds successfully  
✅ Backend Express.js wraps as Netlify Function  
✅ API routing from frontend to backend works  
✅ Environment variables properly configured  
✅ Database connection supports PostgreSQL  
✅ OAuth integration ready (Google, Facebook, Instagram, Viber, Telegram)  
✅ Security headers configured  
✅ CORS headers configured  
✅ SPA routing handled (all routes serve index.html)  
✅ Static assets cached and optimized  
✅ Functions bundled correctly for serverless  

## Ready to Deploy?

1. Run: `./scripts/netlify-env-setup.sh your-site-name`
2. Or read: `NETLIFY_QUICKSTART.md`
3. Then visit: `https://your-site.netlify.app`

Good luck! 🚀

---

**Status:** ✅ READY FOR NETLIFY DEPLOYMENT

All critical issues have been resolved. Your Apolaki Solar Platform is now fully configured and documented for seamless deployment on Netlify.

Last updated: March 1, 2026
