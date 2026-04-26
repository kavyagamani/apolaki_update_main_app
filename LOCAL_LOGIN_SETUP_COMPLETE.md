# APOLAKI SOLAR PLATFORM - LOCAL LOGIN TROUBLESHOOTING & SETUP

## 📍 Current Status

Your Apolaki Solar Platform has been configured for local development with:

- ✅ **Color Theme System** - Unified Solar Gold, Sky Blue design
- ✅ **Backend API** - Express + Node.js with local authentication
- ✅ **Frontend App** - Vue 3 + Vite with Tailwind CSS
- ✅ **Database** - PostgreSQL with auto-seeding capability
- ⏳ **Local Login** - Ready to test and debug

---

## 🚀 FASTEST WAY TO GET WORKING (3 Commands)

```bash
# Terminal 1 - Start database
docker-compose -f config/docker-compose.yml up -d postgres

# Terminal 2 - Start backend (wait for "admin user seeded")
cd middleware/netlify-db-service && npm install && npm run dev

# Terminal 3 - Start frontend
cd frontend && npm install && npm run dev
```

Then open **http://localhost:5173** and login with:
- Email: `admin@apolaki.solar`
- Password: `admin123`

---

## 📊 WHAT WE HAVE CREATED FOR YOU

### New Scripts & Guides

| File | Purpose | How to Use |
|------|---------|-----------|
| `setup-local-fixed.sh` | Full environment setup | `./setup-local-fixed.sh` |
| `debug-local-login.sh` | Diagnose login issues | `./debug-local-login.sh` |
| `test-local-login.sh` | Automated login test | `./test-local-login.sh` |
| `LOCAL_LOGIN_GUIDE.md` | Step-by-step guide | Read in your editor |

### What Each Script Does

#### 1. **setup-local-fixed.sh** ✅
Complete environment setup (5 minutes)

```bash
./setup-local-fixed.sh
```

Does:
- Checks Node.js and Docker
- Installs all dependencies
- Starts PostgreSQL container
- Verifies database connection
- Shows next steps

**Output:**
```
✅ Node.js is installed: v18.17.0
✅ Docker is installed: Docker version 24.0.0
✅ Backend dependencies installed
✅ Frontend dependencies installed
✅ PostgreSQL is ready!
```

#### 2. **debug-local-login.sh** 🔍
Diagnoses what's wrong (use when login fails)

```bash
./debug-local-login.sh
```

Does:
- Checks if ports 3001 & 5173 are in use
- Tests backend API health
- Verifies database connection
- Checks CORS configuration
- Tests login credentials
- Provides specific fix commands

**Output:**
```
✅ Backend is running on port 3001
❌ Frontend is NOT running on port 5173
  → Run: cd frontend && npm run dev
```

#### 3. **test-local-login.sh** ✔️
Automated login test (verify everything works)

```bash
./test-local-login.sh
```

Does:
- Verifies all services are running
- Tests database connectivity
- Makes actual login API call
- Checks frontend proxy config
- Shows test summary

**Output:**
```
✅ Backend is running on port 3001
✅ Frontend is running on port 5173
✅ PostgreSQL container is running
✅ Health check returned 200
✅ Login endpoint returned 200 OK
✅ Response contains authentication token

🎉 LOGIN TEST PASSED!
```

---

## 🔧 STEP-BY-STEP SETUP

### Step 1: Start Database (One-Time Setup)

```bash
docker-compose -f config/docker-compose.yml up -d postgres
```

**What happens:**
- PostgreSQL container starts
- Database `apolaki_db` is created
- Schema is initialized from `config/init-db.sql`
- Admin user credentials are set

**Verify it's running:**
```bash
docker ps | grep postgres
# Should show: apolaki-postgres
```

### Step 2: Start Backend (Terminal 1)

```bash
cd middleware/netlify-db-service
npm install  # First time only
npm run dev
```

**What happens:**
- Express server starts on port 3001
- Connects to PostgreSQL database
- Admin user is auto-seeded (admin@apolaki.solar / admin123)
- Routes are registered

**You should see:**
```
✅ Seeded default admin user: admin@apolaki.solar / admin123
Express server running on port 3001
```

**If you don't see this:**
```bash
# Logs show "Database connection failed"?
# → Check PostgreSQL is running: docker ps
# → Verify DATABASE_URL in .env is correct

# Logs show "Cannot seed admin user"?
# → Database schema might not be initialized
# → Run: docker-compose -f config/docker-compose.yml down postgres
# → Delete volume: docker volume rm config_postgres_data
# → Restart: docker-compose -f config/docker-compose.yml up -d postgres
```

### Step 3: Start Frontend (Terminal 2)

```bash
cd frontend
npm install  # First time only
npm run dev
```

**What happens:**
- Vite dev server starts on port 5173
- Vue app is bundled and hot-reloaded
- Proxy to backend is configured

**You should see:**
```
VITE v5.0.4 ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 4: Login in Browser

1. Open **http://localhost:5173**
2. Click **"Login to Apolaki Solar"** (or navigate to /login)
3. Enter credentials:
   - **Email:** `admin@apolaki.solar`
   - **Password:** `admin123`
4. Click **Login**

**Expected result:**
- Login request sent to backend
- Token received and stored in localStorage
- Redirected to `/assessment` page
- Color theme should be visible (Solar Gold buttons, Sky Blue accents)

---

## 🐛 TROUBLESHOOTING

### Issue: "Invalid credentials" (HTTP 401)

**Symptom:** Browser shows "Invalid credentials" error when logging in

**Causes & Solutions:**

1. **Admin user not seeded yet**
   ```bash
   # Check if admin exists in database
   docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db \
     -c "SELECT email FROM users WHERE email='admin@apolaki.solar';"
   
   # Should output: admin@apolaki.solar
   # If empty, restart backend:
   cd middleware/netlify-db-service
   npm run dev  # This will seed the admin user
   ```

2. **Wrong password**
   - Verify you're using: `admin123` (not variations)
   - Check for typos in password

3. **User table doesn't exist**
   ```bash
   # Verify schema is initialized
   docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db \
     -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users';"
   
   # Should output: 1
   # If 0, reinitialize database:
   docker-compose -f config/docker-compose.yml down postgres
   docker volume rm config_postgres_data
   docker-compose -f config/docker-compose.yml up -d postgres
   sleep 10
   cd middleware/netlify-db-service && npm run dev
   ```

---

### Issue: "CORS error" or "Failed to fetch"

**Symptom:** Browser console shows: `Access to XMLHttpRequest blocked by CORS policy`

**Causes & Solutions:**

1. **Backend not running**
   ```bash
   # Check if port 3001 is in use
   lsof -i :3001
   
   # If not in use, start backend:
   cd middleware/netlify-db-service
   npm run dev
   ```

2. **Proxy misconfigured**
   ```bash
   # Check frontend/vite.config.js has:
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:3001',
         changeOrigin: true,
       }
     }
   }
   
   # If incorrect, fix it and restart frontend:
   cd frontend
   npm run dev
   ```

3. **Firewall blocking port 3001**
   ```bash
   # Test if port is accessible
   curl -v http://localhost:3001/health
   
   # Should return 200 OK
   # If connection refused, check firewall settings
   ```

---

### Issue: "Failed to fetch" / Network Error

**Symptom:** Browser console shows network request failed

**Causes & Solutions:**

1. **Backend crashed**
   - Check terminal running backend for error messages
   - Restart it: `cd middleware/netlify-db-service && npm run dev`

2. **Wrong port**
   - Backend should be on port 3001
   - Frontend should be on port 5173
   - Verify: `lsof -i :3001` and `lsof -i :5173`

3. **Database disconnected**
   ```bash
   # Check database connection
   docker exec apolaki-postgres pg_isready -U apolaki_user
   
   # Should output: "accepting connections"
   # If not, restart database:
   docker-compose -f config/docker-compose.yml up -d postgres
   ```

---

### Issue: "Database connection failed"

**Symptom:** Backend logs show: `Cannot connect to database`

**Solutions:**

```bash
# 1. Check PostgreSQL is running
docker ps | grep postgres

# 2. Verify database credentials in .env
cat middleware/netlify-db-service/.env | grep DATABASE_URL

# 3. Test connection manually
docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -c "SELECT 1"

# 4. If connection fails, restart database
docker-compose -f config/docker-compose.yml down postgres
docker-compose -f config/docker-compose.yml up -d postgres
sleep 10

# 5. Restart backend
cd middleware/netlify-db-service
npm run dev
```

---

### Issue: "Cannot find module" errors

**Symptom:** Backend or frontend fails with: `Error: Cannot find module 'X'`

**Solution:**
```bash
# Clear and reinstall dependencies

# For backend:
cd middleware/netlify-db-service
rm -rf node_modules package-lock.json
npm install
npm run dev

# For frontend:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🔍 DEBUGGING IN BROWSER

### Using Developer Tools (F12)

1. **Open DevTools:** Press `F12` or right-click → Inspect

2. **Check Console Tab:**
   - Look for red error messages
   - Look for CORS errors
   - Look for JavaScript errors

3. **Check Network Tab:**
   - Click login
   - Find `POST /api/auth/login` request
   - Click it
   - Check:
     - **Status:** Should be 200 (success) or 401 (invalid creds)
     - **Response:** JSON with error details
     - **Headers:** Look for CORS headers

4. **Test Login Step-by-Step:**
   ```javascript
   // Paste in Console tab to test API:
   
   // Test health
   fetch('/api/health').then(r => r.json()).then(console.log)
   
   // Test login
   fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'admin@apolaki.solar',
       password: 'admin123'
     })
   }).then(r => r.json()).then(console.log)
   ```

---

## 🧪 TESTING WITH CURL

Test API directly without browser:

```bash
# Test health endpoint
curl -v http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.solar",
    "password": "admin123"
  }'

# Should return:
# {
#   "success": true,
#   "message": "Login successful",
#   "user": { ... },
#   "token": "eyJhbG...",
#   "refreshToken": "...",
#   "sessionToken": "..."
# }
```

---

## 🎯 QUICK DIAGNOSIS CHECKLIST

When login fails, check these in order:

- [ ] **Services Running?**
  ```bash
  lsof -i :3001  # Backend
  lsof -i :5173  # Frontend
  docker ps      # Database
  ```

- [ ] **Database Connected?**
  ```bash
  docker exec apolaki-postgres pg_isready -U apolaki_user
  ```

- [ ] **Admin User Exists?**
  ```bash
  docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db \
    -c "SELECT COUNT(*) FROM users WHERE email='admin@apolaki.solar';"
  ```

- [ ] **API Responding?**
  ```bash
  curl http://localhost:3001/health
  ```

- [ ] **Login Works via Curl?**
  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@apolaki.solar","password":"admin123"}'
  ```

- [ ] **Browser Console Clear?**
  - F12 → Console tab → No red errors?

- [ ] **Network Tab Shows Success?**
  - F12 → Network tab → POST /api/auth/login → Status 200?

---

## 📋 COMPLETE SETUP FROM SCRATCH

```bash
# 1. Start database
docker-compose -f config/docker-compose.yml up -d postgres

# 2. Wait for it to initialize (10 seconds)
sleep 10

# 3. Install backend dependencies
cd middleware/netlify-db-service
npm install

# 4. Start backend (in Terminal 1)
npm run dev

# (Wait for "✅ Seeded default admin user" message)

# 5. In Terminal 2, install frontend dependencies
cd frontend
npm install

# 6. Start frontend (in Terminal 2)
npm run dev

# 7. Open http://localhost:5173 in browser

# 8. Login with:
#    Email: admin@apolaki.solar
#    Password: admin123
```

---

## 📞 IF PROBLEMS PERSIST

1. **Run auto-diagnostics:**
   ```bash
   ./debug-local-login.sh
   ```

2. **Run login test:**
   ```bash
   ./test-local-login.sh
   ```

3. **Check logs:**
   ```bash
   # Backend logs (from terminal running npm run dev)
   tail -f logs/backend.log
   
   # Database logs
   docker logs apolaki-postgres
   ```

4. **Reset everything:**
   ```bash
   # Stop all services
   docker-compose -f config/docker-compose.yml down
   
   # Delete database volume
   docker volume rm config_postgres_data
   
   # Clear browser cache/localStorage
   # F12 → Application tab → Storage → Clear everything
   
   # Start fresh
   docker-compose -f config/docker-compose.yml up -d postgres
   cd middleware/netlify-db-service && npm run dev
   ```

---

## ✨ SUCCESS INDICATORS

When everything is working correctly, you should see:

1. **Backend terminal shows:**
   ```
   ✅ Seeded default admin user: admin@apolaki.solar / admin123
   Express server running on port 3001
   POST /api/auth/login ← Login request logged
   ```

2. **Frontend terminal shows:**
   ```
   VITE v5.x.x ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ```

3. **Browser shows:**
   - Apolaki Solar login page loads
   - Solar Gold (#f97316) buttons visible
   - Login succeeds and redirects to `/assessment`
   - No red errors in Console (F12)

4. **Login works with:**
   - Email: `admin@apolaki.solar`
   - Password: `admin123`

---

## 🎨 COLOR THEME VERIFICATION

Once logged in, verify the new color theme is working:

- **Primary buttons** (Login, Submit) → Orange/Solar Gold (#f97316)
- **Button hover** → Darker orange with shadow
- **Links** → Solar Gold color
- **Success messages** → Green (#16a34a)
- **Error messages** → Red (#dc2626)
- **Info/alerts** → Blue (#3b82f6)
- **Cards** → White background with subtle shadows
- **Text** → Dark gray on light, light on dark

See `docs/COLOR_DESIGN_SYSTEM.md` for complete reference.

---

## 🚀 NEXT STEPS

Once login is working:

1. **Test full workflow:**
   - Login → Assessment → Create installation → Monitor → Finance

2. **Test color consistency:**
   - Check all pages for Solar Gold theme
   - Verify buttons and links have correct colors
   - Test dark mode (if applicable)

3. **Test other features:**
   - Social login buttons (if configured)
   - OTP fallback (send OTP: 123456)
   - Logout and re-login

4. **Prepare for production:**
   - See `docs/DEPLOYMENT_GUIDE.md`
   - Configure real OAuth credentials
   - Set up monitoring and logging

---

## 📚 USEFUL REFERENCES

- **Backend API Docs:** `docs/API_REFERENCE.md`
- **Color System:** `docs/COLOR_DESIGN_SYSTEM.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **Deployment:** `docs/DEPLOYMENT_GUIDE.md`
- **Setup Guide:** `docs/SETUP_GUIDE.md`

---

**Last Updated:** March 1, 2026
**Status:** Ready for Local Testing ✅

Happy coding! 🌞
