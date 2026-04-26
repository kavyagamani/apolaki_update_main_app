# Apolaki Solar Platform - Local Login Setup Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ (`node -v`)
- Docker & Docker Compose (`docker -v`)
- 2 terminal windows

### Step 1: Start PostgreSQL

```bash
# In terminal 1, start the database
docker-compose -f config/docker-compose.yml up -d postgres

# Wait 5-10 seconds for it to initialize
docker ps  # Verify apolaki-postgres is running
```

### Step 2: Start Backend (API Server)

```bash
# In terminal 1 (after postgres is running) or terminal 2
cd middleware/netlify-db-service
npm install  # First time only
npm run dev
```

You should see:
```
✅ Seeded default admin user: admin@apolaki.solar / admin123
Express server running on port 3001
```

### Step 3: Start Frontend (Web App)

```bash
# In terminal 2 (or a new terminal)
cd frontend
npm install  # First time only
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 4: Login in Browser

1. Open http://localhost:5173 in your browser
2. Click **"Login to Apolaki Solar"**
3. Enter:
   - **Email:** `admin@apolaki.solar`
   - **Password:** `admin123`
4. Click **Login**

✅ You should be redirected to the assessment page!

---

## 🔍 Troubleshooting

### Issue: "Invalid credentials" error

**Cause:** Admin user not seeded yet

**Solution:**
```bash
# Stop backend (Ctrl+C)
cd middleware/netlify-db-service

# Clear and reinitialize database
docker-compose -f ../../config/docker-compose.yml down postgres
docker volume rm config_postgres_data
docker-compose -f ../../config/docker-compose.yml up -d postgres

# Wait 10 seconds, then restart backend
npm run dev
```

### Issue: "CORS error" or "Failed to fetch"

**Cause:** Backend not running or proxy misconfigured

**Solution:**
1. Verify backend is running on port 3001
   ```bash
   lsof -i :3001  # Should show node process
   ```
2. Check vite.config.js has correct proxy:
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:3001',
       changeOrigin: true,
     }
   }
   ```
3. Restart both frontend and backend

### Issue: Database connection errors

**Cause:** PostgreSQL not running

**Solution:**
```bash
# Check if container exists
docker ps -a | grep postgres

# If not running, start it
docker-compose -f config/docker-compose.yml up -d postgres

# Verify connection
docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -c "SELECT 1"
```

### Issue: "Cannot find module" or installation errors

**Solution:**
```bash
# Clear node modules and reinstall
cd middleware/netlify-db-service
rm -rf node_modules package-lock.json
npm install

cd ../../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Debug the Login Process

### Browser Console (F12)

1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for error messages
4. Go to **Network** tab
5. Click login
6. Find `POST /api/auth/login` request
7. Click it and check:
   - **Response** tab for error details
   - **Headers** tab for CORS headers

### Backend Logs

Check the terminal running `npm run dev` for logs like:
```
Login error: [error message]
Could not connect to database: [connection error]
```

### Test API Directly

```bash
# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.solar",
    "password": "admin123"
  }'

# Should return:
# {"success":true,"message":"Login successful","user":{...},"token":"..."}
```

---

## 🔑 Default Test Accounts

| Account Type | Email | Password | Notes |
|---|---|---|---|
| **Admin** | admin@apolaki.solar | admin123 | Auto-seeded on first startup |
| **Test User** | test@apolaki.solar | test123 | Create via signup form |

---

## 📋 Complete Setup Commands (Copy-Paste)

```bash
# 1. Setup database
docker-compose -f config/docker-compose.yml up -d postgres

# 2. Setup and run backend (Terminal 1)
cd middleware/netlify-db-service
npm install
npm run dev

# 3. Setup and run frontend (Terminal 2)
cd frontend
npm install
npm run dev

# 4. Open in browser
# http://localhost:5173
```

---

## 🔐 Environment Variables

If login is still not working, check these files:

**Backend** (`middleware/netlify-db-service/.env`):
```properties
NETLIFY_DATABASE_URL=postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db
PORT=3001
JWT_SECRET=apolaki-dev-secret-key-change-in-production-123456
```

**Frontend** (`frontend/vite.config.js`):
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    }
  }
}
```

---

## 🎨 Color Theme Verification

Once logged in, check these color elements:
- **Primary buttons** → Solar Gold (#f97316) with gradients
- **Background cards** → Clean white with subtle shadows
- **Text** → High contrast for accessibility
- **Alerts** → Clear success/error/warning colors

See `docs/COLOR_DESIGN_SYSTEM.md` for complete color reference.

---

## 📞 Still Having Issues?

Run the debug script for automated diagnostics:

```bash
chmod +x debug-local-login.sh
./debug-local-login.sh
```

This will:
- ✓ Check if ports 3001 and 5173 are in use
- ✓ Test backend API connectivity
- ✓ Verify database connection
- ✓ Check environment variables
- ✓ Test login credentials
- ✓ Provide specific troubleshooting steps

---

**Happy coding! 🌞**
