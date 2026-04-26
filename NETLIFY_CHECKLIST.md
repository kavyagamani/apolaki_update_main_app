# Netlify Deployment Checklist

Before deploying to Netlify, ensure you have completed these steps:

## Pre-Deployment

- [ ] `netlify.toml` is configured correctly
- [ ] Git repository is clean and committed
- [ ] No secrets are hardcoded (use Netlify environment variables)
- [ ] Frontend builds successfully locally: `npm run build --prefix frontend`
- [ ] Backend runs locally: `npm run dev --prefix middleware/netlify-db-service`

## Netlify Configuration

- [ ] Netlify site is created and linked to Git repository
- [ ] Build settings auto-detected from `netlify.toml`
- [ ] Node.js version is set to 18.x or higher
- [ ] Functions directory is set to `middleware/netlify-db-service/.netlify/functions`
- [ ] Publish directory is set to `frontend/dist`

## Environment Variables

### Database (Required)

- [ ] `NETLIFY_DATABASE_URL` - PostgreSQL connection string (from Neon or self-hosted)

### Security (Required)

- [ ] `JWT_SECRET` - Generate with: `openssl rand -hex 32`
- [ ] `SESSION_SECRET` - Generate with: `openssl rand -hex 32`

### Application (Required)

- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Your Netlify domain (e.g., `https://apolaki.netlify.app`)
- [ ] `API_BASE_URL` - Same as FRONTEND_URL (e.g., `https://apolaki.netlify.app/api`)
- [ ] `CORS_ALLOWED_ORIGINS` - Your Netlify domain

### Optional But Recommended

- [ ] `GOOGLE_CLIENT_ID` - Google OAuth credential
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth credential
- [ ] `GOOGLE_CALLBACK_URL` - `https://your-domain/api/auth/google/callback`
- [ ] `FACEBOOK_APP_ID` - Facebook OAuth credential
- [ ] `FACEBOOK_APP_SECRET` - Facebook OAuth credential
- [ ] `FACEBOOK_CALLBACK_URL` - `https://your-domain/api/auth/facebook/callback`

### Optional Database Pool

- [ ] `DB_POOL_MIN` - Default: 2
- [ ] `DB_POOL_MAX` - Default: 10
- [ ] `DB_CONNECTION_TIMEOUT` - Default: 30000ms
- [ ] `DB_IDLE_TIMEOUT` - Default: 30000ms

## OAuth Provider Setup

- [ ] Google Console: Add `https://your-domain/api/auth/google/callback` to authorized URIs
- [ ] Facebook Developer: Add `https://your-domain/api/auth/facebook/callback` to valid OAuth URIs
- [ ] Instagram: Add `https://your-domain/api/auth/instagram/callback` to valid redirect URIs
- [ ] Viber: Add `https://your-domain/api/auth/viber/callback` to callback URL
- [ ] Telegram (optional): Bot token generated from @botfather

## Database Setup

- [ ] PostgreSQL database created (via Neon or self-hosted)
- [ ] Connection string format verified: `postgresql://user:pass@host:port/database`
- [ ] Schema initialized (auto-creates on first API request, or manually run `config/init-db.sql`)
- [ ] Database user has CREATE, ALTER, DROP privileges for schema initialization

## Deployment

1. Push code to your main branch:
   ```bash
   git add .
   git commit -m "Deploy to Netlify"
   git push origin main
   ```

2. Netlify automatically builds and deploys
   - Monitor the build in: **Builds** → Select build → **Deploy log**
   - Check function bundling completes successfully

3. Verify deployment:
   - Visit your Netlify domain
   - Should see Apolaki landing page
   - Try signing up or logging in
   - Check browser DevTools → Network → API calls should route to `/.netlify/functions/handler`

## Post-Deployment Verification

- [ ] Frontend loads without errors
- [ ] API requests succeed (test login/signup)
- [ ] No CORS errors in console
- [ ] Database queries work (check dashboard loads data)
- [ ] OAuth login works (if configured)
- [ ] Netlify Functions invocations appear in **Functions** → **Invocations**

## Troubleshooting Commands

```bash
# View build logs
netlify build

# Test function locally before deploying
netlify functions:invoke handler --payload '{"path": "/api/health", "httpMethod": "GET"}'

# Check environment variables are set
netlify env:list

# View deployment status
netlify status
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails: "Cannot find module" | Ensure `npm ci` completes for all packages. Check build log. |
| 404 on `/api/*` calls | Verify redirect in `netlify.toml` from `/api/*` to `/.netlify/functions/handler/:splat` |
| CORS errors | Ensure `CORS_ALLOWED_ORIGINS` includes your Netlify domain |
| Database connection fails | Check `NETLIFY_DATABASE_URL` is set and valid |
| JWT validation fails | Check `JWT_SECRET` is set consistently |
| OAuth redirects fail | Verify callback URL matches exactly in OAuth provider console |

## Performance Targets

After deployment, check:

- **Frontend load time**: < 3 seconds (p95)
- **API response time**: < 200ms (p95)
- **Function cold start**: < 1 second (acceptable for Netlify)
- **Uptime**: > 99.5% (check Netlify Analytics)

## Next Steps

1. Set up monitoring alerts for failed deployments
2. Configure custom domain (if not using Netlify subdomain)
3. Enable Netlify Analytics for performance monitoring
4. Set up scheduled backups for PostgreSQL
5. Configure CI/CD for automated testing before deployment
