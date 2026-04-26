# Apolaki Local Development - Troubleshooting & Login Fix

**Last Updated**: March 1, 2026

---

## 🔍 Quick Diagnostics

### Check if Backend is Running

```bash
# Test backend endpoint
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok"}
```

If you get `Connection refused`:
- Backend is not running
- Start it: `cd middleware/netlify-db-service && npm run dev`

### Check if Frontend is Running

Open http://localhost:5173 in browser.

If blank/error:
- Frontend is not running
- Start it: `cd frontend && npm run dev`

### Check Browser Console for Errors

1. Press `F12` in browser
2. Go to **Console** tab
3. Look for red error messages
4. Check **Network** tab - failed requests?

---

## ⚙️ Setup Checklist

### Before Running Anything

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] In project root directory
- [ ] Run `./setup-local.sh` (or `./verify-local.sh` to check)

### Backend Setup

- [ ] `middleware/netlify-db-service/.env` file exists
- [ ] `JWT_SECRET` is set in .env
- [ ] Database is accessible
- [ ] Port 3001 is available

### Frontend Setup

- [ ] `frontend/.env` file exists
- [ ] `VITE_API_BASE=http://localhost:3001` in .env
- [ ] Port 5173 is available
- [ ] `vite.config.js` has `/api` proxy configured

---

## 🔑 Login Not Working - Step-by-Step Fix

### Step 1: Verify Backend is Running

Terminal 1:
```bash
cd middleware/netlify-db-service
npm run dev
```

You should see:
```
✅ Database initialized
✅ Seeded default admin user: admin@apolaki.solar / admin123
Server running on http://localhost:3001
```

If you don't see the "Seeded" message:
- Check `.env` file exists
- Check `DATABASE_URL` is set
- Try deleting database file and restarting

### Step 2: Test Backend Directly

```bash
# Test login endpoint directly
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.solar",
    "password": "admin123"
  }'

# Expected response:
# {"token":"eyJ...","user":{"id":1,"email":"admin@apolaki.solar"}}
```

If you get error:
- Check `.env` is correct
- Check database has users table
- Check admin user was seeded

### Step 3: Verify Frontend Proxy

Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in xxx ms
Local: http://localhost:5173
```

### Step 4: Test Frontend Network Request

1. Open http://localhost:5173
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Enter credentials and click Login
5. Look for `login` request
6. Check if it shows:
   - URL: `http://localhost:5173/api/auth/login`
   - Status: `200 OK` (green)
   - Response: Should have token

If you see:
- **404**: Backend not running
- **CORS error**: Check CORS_ORIGIN in backend .env
- **500 error**: Check backend console for error

### Step 5: Check Backend Environment

Edit `middleware/netlify-db-service/.env`:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev-secret-key-12345

# Database - use one of:
DATABASE_URL=sqlite://./apolaki.db                    # Local SQLite (no setup needed)
# DATABASE_URL=postgresql://localhost/apolaki_dev     # Local PostgreSQL
```

### Step 6: Clear Cache and Restart

```bash
# Kill all Node processes
pkill -f "node"

# Clear frontend cache
cd frontend && rm -rf node_modules/.vite && cd ..

# Restart from fresh
cd middleware/netlify-db-service && npm run dev
# In new terminal:
cd frontend && npm run dev
```

---

## Common Errors & Solutions

### Error 1: "Cannot POST /api/auth/login" (404)

**Problem**: Backend is not responding

**Solution**:
```bash
# Check if backend is running
ps aux | grep "node"

# If not running:
cd middleware/netlify-db-service
npm run dev
```

### Error 2: "CORS policy: No 'Access-Control-Allow-Origin'"

**Problem**: Frontend and backend CORS mismatch

**Solution**:
1. Edit `middleware/netlify-db-service/.env`
2. Set: `CORS_ORIGIN=http://localhost:5173`
3. Restart backend: `npm run dev`

### Error 3: "User not found" or "Invalid credentials"

**Problem**: Admin user not seeded

**Solution**:
```bash
# Option 1: Restart backend (auto-seeds)
# Ctrl+C to stop, then npm run dev

# Option 2: Manually seed
# Edit middleware/netlify-db-service/src/routes/auth.js
# Run seedAdminUser() function manually

# Check if user exists:
sqlite3 ./apolaki.db "SELECT * FROM users;"
```

### Error 4: "ECONNREFUSED: Connection refused"

**Problem**: Database not accessible

**Solution**:
```bash
# If using SQLite:
ls -la middleware/netlify-db-service/apolaki.db

# If file missing, backend will create it
# Just restart backend

# If using PostgreSQL:
psql -U postgres -c "CREATE DATABASE apolaki_dev"
```

### Error 5: Blank login page

**Problem**: Frontend not loading

**Solution**:
1. Check browser console (F12)
2. Look for JavaScript errors
3. Check Network tab for failed resources
4. Try: `cd frontend && rm -rf dist && npm run dev`

### Error 6: "Module not found" errors

**Problem**: Dependencies not installed

**Solution**:
```bash
# Install all dependencies
cd middleware/netlify-db-service && npm install

cd ../../frontend && npm install

cd ..
```

---

## 📋 Configuration Verification

### Backend Config (`middleware/netlify-db-service/.env`)

Required:
```env
PORT=3001                          # ✓ Match vite proxy
CORS_ORIGIN=http://localhost:5173  # ✓ Match frontend URL
JWT_SECRET=dev-secret-key          # ✓ Any string works locally
DATABASE_URL=sqlite://./apolaki.db  # ✓ Or PostgreSQL connection
```

Optional (for OAuth):
```env
ENABLE_OAUTH=false                 # Leave false for local testing
GOOGLE_CLIENT_ID=local-dev         # Only if enabling
```

### Frontend Config (`frontend/.env`)

Required:
```env
VITE_API_BASE=http://localhost:3001  # ✓ Match backend port
```

### Vite Proxy Config (`frontend/vite.config.js`)

Must have:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',  // ✓ Backend address
      changeOrigin: true,
    }
  }
}
```

---

## 🧪 Manual Testing

### Test 1: Backend Directly

```bash
# Start backend only
cd middleware/netlify-db-service
npm run dev

# In another terminal, test:
curl http://localhost:3001/api/health
```

Expected: `{"status":"ok"}`

### Test 2: Database Connectivity

```bash
# Check database file exists
ls -la middleware/netlify-db-service/apolaki.db

# Query database directly (if using SQLite)
sqlite3 middleware/netlify-db-service/apolaki.db \
  "SELECT email, role FROM users LIMIT 5;"

# Should show admin user
```

### Test 3: Auth Endpoint

```bash
# Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.solar",
    "password": "admin123"
  }'
```

---

## 🚀 Final Verification Workflow

1. **Run Verification Script**
   ```bash
   ./verify-local.sh
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd middleware/netlify-db-service && npm run dev
   ```
   Wait for: "✅ Seeded default admin user"

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend && npm run dev
   ```
   Wait for: "VITE ready in"

4. **Test in Browser**
   - Go to http://localhost:5173
   - Enter: admin@apolaki.solar / admin123
   - Click Login
   - Should see Dashboard

5. **Verify Colors Work**
   - Check primary button is Solar Gold (#FFB81C)
   - Check secondary button is Sky Blue (#0066CC)
   - Check alert colors are correct

---

## 📞 Still Stuck?

### Collect Debug Info

Run this and share output:

```bash
# Backend debug
cd middleware/netlify-db-service
echo "=== .env file ===" && cat .env
echo "=== Node version ===" && node --version
echo "=== npm version ===" && npm --version
echo "=== Database check ===" && ls -la *.db 2>/dev/null || echo "No SQLite DB"
echo "=== Package.json ===" && cat package.json | grep -A5 '"scripts"'
```

### Common Questions

**Q: Do I need PostgreSQL?**  
A: No, SQLite works fine locally. Use PostgreSQL only if testing production features.

**Q: Why does admin user not show up?**  
A: It auto-seeds only once. To reset, delete the `.db` file or drop users table.

**Q: Can I use different ports?**  
A: Yes, but update:
- Backend: `PORT` in .env
- Frontend: `vite.config.js` proxy target
- Frontend: `VITE_API_BASE` in .env

**Q: Is social login needed locally?**  
A: No, email/password works fine. Social login is optional.

---

**Need More Help?**

See these files:
- `LOCAL_DEVELOPMENT.md` - Complete setup guide
- `docs/API_REFERENCE.md` - API endpoints
- Backend error logs: Terminal running `npm run dev`
- Frontend errors: Browser DevTools (F12)

---

**✅ You're ready to develop!**

If login still fails after these steps, share the error from the console or network tab and we can debug further.
