# Apolaki Solar Platform - Local Development Guide

**Version**: 1.0  
**Updated**: March 1, 2026  
**Status**: Complete Setup Instructions

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Terminal/Command prompt

### Option 1: Automated Setup (Recommended)

```bash
# From project root
chmod +x setup-local.sh
./setup-local.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Create environment files
- ✅ Set up default admin user
- ✅ Configure ports and database

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies
cd middleware/netlify-db-service && npm install && cd ../..
```

#### 2. Create Backend `.env` File

Create `middleware/netlify-db-service/.env`:

```env
NODE_ENV=development
PORT=3001
API_BASE=http://localhost:3001

# Database (Local PostgreSQL or SQLite)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/apolaki_dev

# JWT Keys
JWT_SECRET=dev-secret-key-12345
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=dev-refresh-secret-12345
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth (Optional - leave as is for local testing)
GOOGLE_CLIENT_ID=local-dev
GOOGLE_CLIENT_SECRET=local-dev
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Session
SESSION_SECRET=dev-session-secret

# CORS
CORS_ORIGIN=http://localhost:5173

# Features
ENABLE_OAUTH=false
ENABLE_2FA=false
```

#### 3. Create Frontend `.env` File

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:3001
VITE_APP_NAME=Apolaki Solar
VITE_ENVIRONMENT=development
```

---

## 🏃 Running Locally

### Terminal 1: Start Backend

```bash
cd middleware/netlify-db-service
npm run dev
```

Expected output:
```
✅ Database connected
✅ Seeded default admin user: admin@apolaki.solar / admin123
Server running on http://localhost:3001
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

### Open in Browser

Navigate to: **http://localhost:5173**

---

## 🔐 Default Test Credentials

The system auto-seeds a default admin user on first run:

| Field | Value |
|-------|-------|
| **Email** | `admin@apolaki.solar` |
| **Password** | `admin123` |
| **Role** | Admin |

> **Note**: This user is only created if the database is empty. Seed it again by clearing the users table if needed.

---

## 🧪 Testing Login Flow

### Step 1: Test Email/Password Login

1. Open http://localhost:5173
2. Click "Login to Apolaki Solar"
3. Enter:
   - Email: `admin@apolaki.solar`
   - Password: `admin123`
4. Click "Login"
5. You should see the Dashboard

### Step 2: Test Signup Flow

1. Click "Create an account" on login page
2. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!@`
   - Confirm: `Test123!@`
   - First Name: `Test`
   - Last Name: `User`
3. Click "Sign up"
4. Should redirect to login with "Account created successfully"

### Step 3: Test Social Login (Disabled Locally)

Social login redirects are currently disabled in local development. To enable:

Edit `middleware/netlify-db-service/.env`:
```env
ENABLE_OAUTH=true
```

Then add your OAuth credentials from Google/Facebook/etc.

---

## 🛠️ Architecture

### Frontend (Port 5173)
- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **HTTP Client**: Axios (configured to proxy `/api` to backend)

### Backend (Port 3001)
- **Framework**: Express.js
- **Database**: PostgreSQL (local or cloud)
- **Auth**: JWT + Passport.js
- **Sessions**: Express-session with store

### API Proxy Flow
```
Frontend Request
  ↓
http://localhost:5173/api/auth/login
  ↓ (Vite proxy via vite.config.js)
  ↓
http://localhost:3001/api/auth/login
  ↓
Express Backend Handler
  ↓
Response with JWT Token
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot POST /api/auth/login" (404)

**Cause**: Backend not running

**Fix**:
```bash
cd middleware/netlify-db-service
npm run dev
```

Verify: http://localhost:3001/api/health should return `{"status":"ok"}`

### Issue 2: "CORS Error" or "Access-Control-Allow-Origin"

**Cause**: CORS not configured correctly

**Fix**: 
1. Check `middleware/netlify-db-service/.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

2. Restart backend:
   ```bash
   npm run dev
   ```

### Issue 3: "Database connection failed"

**Cause**: PostgreSQL not running (if using local DB)

**Fix**:
```bash
# If using SQLite (no server needed):
# Change DATABASE_URL to: sqlite://./apolaki.db

# If using PostgreSQL:
brew services start postgresql  # macOS
# or
sudo service postgresql start   # Linux
```

### Issue 4: "Invalid login credentials"

**Cause**: Database not seeded with admin user

**Fix**: 
1. Stop backend (Ctrl+C)
2. Delete the database file or drop tables
3. Restart backend
4. Wait for "✅ Seeded default admin user" message

### Issue 5: Login button does nothing

**Cause**: JavaScript error in console

**Fix**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - is request being sent?
4. Verify backend is running and responding

---

## 📊 Database Setup (Optional)

### Using SQLite (Simplest)

No setup needed! Backend defaults to SQLite if `DATABASE_URL` is not set.

```env
DATABASE_URL=sqlite://./apolaki.db
```

### Using PostgreSQL (Production-like)

Install PostgreSQL:

```bash
# macOS
brew install postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql

# Windows
# Download from https://www.postgresql.org/download/
```

Start PostgreSQL:

```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start
```

Create database:

```bash
createdb apolaki_dev
```

Update `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/apolaki_dev
```

### Using Cloud Database (Neon)

1. Sign up at https://neon.tech
2. Create a project and get connection string
3. Update `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host/database
   ```

---

## 📁 Key Files to Know

### Frontend
- `frontend/src/views/Login.vue` - Login component
- `frontend/src/views/Signup.vue` - Signup component
- `frontend/src/services/auth.js` - Auth API calls
- `frontend/src/stores/user.js` - User state management
- `frontend/vite.config.js` - Proxy configuration

### Backend
- `middleware/netlify-db-service/src/server.js` - Express server
- `middleware/netlify-db-service/src/routes/auth.js` - Auth endpoints
- `middleware/netlify-db-service/src/auth/passport.js` - Passport config
- `middleware/netlify-db-service/src/db.js` - Database layer
- `middleware/netlify-db-service/.env` - Environment config

---

## 🔄 Development Workflow

### Making Changes

#### Frontend Changes
1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. Changes appear immediately in browser

#### Backend Changes
1. Edit files in `middleware/netlify-db-service/src/`
2. Nodemon automatically restarts server
3. Refresh frontend to see changes

#### Color Theme Changes
1. Edit `frontend/src/styles/main.css`
2. Colors update in real-time
3. Check the new color system docs!

### Testing Locally

```bash
# Terminal 1 - Backend with dev server
cd middleware/netlify-db-service && npm run dev

# Terminal 2 - Frontend with hot reload
cd frontend && npm run dev

# Browser
http://localhost:5173
```

---

## 🚀 Building for Production

### Frontend

```bash
cd frontend
npm run build

# Output: frontend/dist/
```

### Backend

```bash
cd middleware/netlify-db-service
npm run build

# Ready for Netlify/Vercel/Heroku
```

---

## 📝 Environment Variables Reference

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE` | `http://localhost:3001` | Backend API URL |
| `VITE_APP_NAME` | `Apolaki Solar` | App title |
| `VITE_ENVIRONMENT` | `development` | Environment name |

### Backend (`middleware/netlify-db-service/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Node environment |
| `PORT` | `3001` | Server port |
| `DATABASE_URL` | `sqlite://./apolaki.db` | Database connection |
| `JWT_SECRET` | Required | JWT signing key |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend URL |

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:5173
- [ ] Can see login page
- [ ] Can login with admin@apolaki.solar / admin123
- [ ] Dashboard loads after login
- [ ] No console errors (F12)
- [ ] Network requests show 200 status codes
- [ ] Color theme looks correct

---

## 📞 Getting Help

### Check Logs

**Frontend (Browser)**:
- Open DevTools: Press `F12`
- Check Console tab for errors
- Check Network tab for failed requests

**Backend (Terminal)**:
- Look for error messages in startup output
- Run with `npm run dev` to see all logs
- Check database connection messages

### Common Log Messages

✅ **Good**:
```
✓ Backend running on port 3001
✓ Database connected
✓ Seeded default admin user
✓ VITE Local: http://localhost:5173
```

❌ **Bad**:
```
Error: ECONNREFUSED - Backend not running
Error: CORS policy - Frontend URL not in CORS_ORIGIN
Error: User not found - Database not seeded
```

---

## 🎯 Next Steps After Setup

1. **Test Colors**: See the new color theme in action!
   - New Solar Gold (#FFB81C) primary buttons
   - Sky Blue (#0066CC) secondary actions
   - Success, Warning, Error alerts

2. **Explore Dashboard**: After login, check out:
   - Real-time monitoring
   - Marketplace
   - Financial assessment
   - Contracts

3. **Run Tests**: 
   ```bash
   npm test  # Run test suite
   ```

4. **Check Documentation**:
   - `docs/COLOR_DESIGN_SYSTEM.md` - Color guidelines
   - `docs/API_REFERENCE.md` - API endpoints
   - `docs/ARCHITECTURE.md` - System design

---

**✅ You're all set!**

Local development is ready. Start building! 🚀

---

**Last Updated**: March 1, 2026  
**Version**: 1.0  
**Status**: Complete
