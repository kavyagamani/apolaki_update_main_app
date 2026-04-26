# Apolaki Solar Platform - Local Development Guide

## ✅ Status Summary (Last Updated: 2025-01-03)

### What's Working
- ✅ **Backend API** running on `http://localhost:3001`
- ✅ **Frontend** running on `http://localhost:5173`
- ✅ **PostgreSQL Database** connected and schema created
- ✅ **Admin User** auto-seeded: `admin@apolaki.com` / `admin123`
- ✅ **Login API** endpoint working and returning JWT tokens
- ✅ **Color Theme System** implemented (Solar Gold, Sky Blue, Dark/Light modes)
- ✅ **Frontend-Backend Proxy** configured (Vite routes `/api` to backend)
- ✅ **Responsive UI** with improved buttons, cards, and navbar/footer

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ (running locally or via Docker)
- npm 8+

### 1. Setup Backend

```bash
cd middleware/netlify-db-service
npm install
# Ensure .env has DATABASE_URL configured
npm run dev
```

**Expected Output:**
```
✅ Database schema already exists
✅ Seeded default admin user: admin@apolaki.com / admin123
Server running on http://localhost:3001
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

**Frontend available at:** `http://localhost:5173`

### 3. Verify Everything Works

```bash
./verify-local-login.sh
```

This script checks:
- ✅ Backend running
- ✅ Frontend running
- ✅ Database connected
- ✅ Admin user seeded
- ✅ API login working
- ✅ Frontend-backend connectivity

---

## 🔐 Login & Authentication

### Test Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@apolaki.com` |
| **Password** | `admin123` |

### How to Login

#### Option 1: Via Browser UI
1. Open `http://localhost:5173`
2. Click "Login" or navigate to `/login`
3. Enter email and password
4. Click "Login" button
5. Should redirect to dashboard

#### Option 2: Via API (curl)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@apolaki.com", "password": "admin123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "537cca54-82a7-4417-afa0-8fc58130f9c0",
    "email": "admin@apolaki.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "sessionToken": "5d7e58ef-05b2-4b88-a32a-38c044218deb"
}
```

### JWT Token Details
- **Token Type:** Bearer
- **Expiry:** 24 hours
- **Location:** Stored in `localStorage` as `token`
- **Usage:** Attach to API requests: `Authorization: Bearer <token>`

---

## 🎨 Color Theme & UI

### Theme System
The app implements a consistent color theme with dark and light modes:

#### Colors
| Color | Light Mode | Dark Mode |
|-------|-----------|-----------|
| **Primary (Solar Gold)** | `#D4A600` | `#E8B92C` |
| **Secondary (Sky Blue)** | `#5B8EC8` | `#7A9FD8` |
| **Background** | `#FFFFFF` | `#1A1A1A` |
| **Text** | `#1A1A1A` | `#E8E8E8` |

#### CSS Variables
All colors defined in `frontend/src/styles/main.css`:
```css
:root {
  --color-solar-gold: #D4A600;
  --color-sky-blue: #5B8EC8;
  --color-light-bg: #FFFFFF;
  --color-dark-bg: #1A1A1A;
}

:root[data-theme="dark"] {
  --color-solar-gold: #E8B92C;
  --color-primary-gradient: linear-gradient(135deg, #E8B92C, #D97706);
}
```

### Toggling Theme
- **Click** the sun/moon icon in the navbar (top-right)
- **Persists** in `localStorage`
- **Applies** immediately to entire UI

### UI Components
- ✅ **Buttons** - Solar Gold gradient, hover effects, visible on all backgrounds
- ✅ **Cards** - Shadow, border, proper spacing
- ✅ **Forms** - Proper styling, focus states, error messages
- ✅ **Navbar** - Theme toggle, logo, navigation links
- ✅ **Footer** - Content at bottom, visually differentiated
- ✅ **Status Badges** - Color-coded (success, warning, error, info)

---

## 📁 Project Structure

```
apolaki-udpated-app/
├── frontend/                          # Vue.js + Vite frontend
│   ├── src/
│   │   ├── App.vue                   # Main app component (theme toggle, navbar, router)
│   │   ├── main.js                   # Entry point
│   │   ├── views/
│   │   │   ├── Login.vue             # Login page
│   │   │   ├── Dashboard.vue         # Protected dashboard
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Button.vue            # Reusable button component
│   │   │   └── ...
│   │   ├── stores/
│   │   │   └── userStore.js          # Pinia state management (auth)
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with interceptors
│   │   └── styles/
│   │       └── main.css              # Color system & utility classes
│   ├── vite.config.js                # Vite proxy config (/api → localhost:3001)
│   └── package.json
│
├── middleware/netlify-db-service/     # Node.js + Express backend
│   ├── src/
│   │   ├── server.js                 # Express server setup
│   │   ├── routes/
│   │   │   └── auth.js               # Auth endpoints (login, signup, OAuth)
│   │   ├── db.js                     # Database client & schema creation
│   │   ├── auth/
│   │   │   ├── jwt.js                # JWT token generation/verification
│   │   │   └── password.js           # Password hashing & verification
│   │   └── config/
│   │       └── index.js              # Config management
│   ├── .env                          # Environment variables
│   └── package.json
│
├── verify-local-login.sh              # Login verification script
├── DOCUMENTATION.md                   # Full documentation
└── ...
```

---

## 🔍 Troubleshooting

### Backend Won't Start

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:** Kill existing process
```bash
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
npm run dev
```

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:** Check PostgreSQL is running
```bash
# macOS with Homebrew
brew services start postgresql

# Or check if running
pg_isready -h localhost -p 5432
```

### Login Returns 401 "Invalid credentials"

**Causes:**
1. ❌ Admin user not seeded
2. ❌ Database schema not created
3. ❌ Password hash incorrect

**Solution:**
```bash
# Check if admin user exists in database
psql -U apolaki_user -d apolaki_db -c "SELECT * FROM users;"

# If empty, restart backend (auto-seeds on startup)
npm run dev

# Or manually seed via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@apolaki.com", "password": "admin123"}'
```

### Frontend Shows Blank Page

**Cause:** Vite dev server not running or JS not loading

**Solution:**
```bash
cd frontend
npm install
npm run dev
# Check console (F12) for errors
```

### Login Works via API but Fails in Browser

**Possible Issues:**
1. ❌ Vite proxy not routing `/api` correctly
2. ❌ CORS headers missing
3. ❌ Frontend token not being stored

**Debug Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Attempt login
4. Check request to `/api/auth/login`:
   - ✅ Status should be 200
   - ✅ Response should have `token` field
5. Check Console for JS errors
6. Check if `localStorage.token` is set after login

### Color Theme Not Changing

**Solution:**
1. Check `App.vue` has `data-theme` attribute on root div
2. Verify `main.css` has `:root[data-theme="dark"]` rules
3. Click theme toggle button (sun/moon icon in navbar)
4. Check `localStorage.theme` is set

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Backend Server**
  - [ ] Starts without errors
  - [ ] Logs show "Seeded default admin user"
  - [ ] API returns 200 on `/api/health`

- [ ] **Frontend Server**
  - [ ] Loads at `http://localhost:5173`
  - [ ] No console errors (F12)
  - [ ] Can navigate to `/login`

- [ ] **Login Flow**
  - [ ] Can enter email and password
  - [ ] Login button is visible and clickable
  - [ ] Submitting login makes API request (Network tab)
  - [ ] Success response has `token` and `user` fields
  - [ ] Redirects to dashboard on success
  - [ ] Shows error message on invalid credentials

- [ ] **UI/Theme**
  - [ ] Navbar visible at top
  - [ ] Sun/moon icon visible in navbar
  - [ ] Clicking theme toggle changes colors
  - [ ] Dark theme shows dark orange background
  - [ ] Light theme shows light orange/white background
  - [ ] Buttons are visible and clickable
  - [ ] Footer is at bottom of page
  - [ ] Status badges are color-coded

### Automated Testing

```bash
# Run login verification
./verify-local-login.sh

# Run backend tests (if available)
cd middleware/netlify-db-service
npm test

# Run frontend tests (if available)
cd frontend
npm test
```

---

## 📚 Key Files Modified

### Backend
- `middleware/netlify-db-service/src/routes/auth.js` - Login endpoint with admin seeding
- `middleware/netlify-db-service/src/db.js` - Database schema and user operations
- `middleware/netlify-db-service/.env` - Database connection config

### Frontend
- `frontend/src/App.vue` - Theme toggle, navbar/footer layout
- `frontend/src/views/Login.vue` - Login form with email/password
- `frontend/src/stores/userStore.js` - Authentication state management
- `frontend/src/styles/main.css` - Color system and utility classes
- `frontend/src/components/Button.vue` - Reusable button component with theme support
- `frontend/vite.config.js` - Proxy configuration for `/api`

---

## 📖 Documentation Files

- **`DOCUMENTATION.md`** - Complete project documentation
- **`docs/SETUP_GUIDE.md`** - Step-by-step setup instructions
- **`docs/DEPLOYMENT_GUIDE.md`** - Production deployment guide
- **`QUICK_START.md`** - Quick start guide
- **`CONTRIBUTING.md`** - Contributing guidelines

---

## 🔗 Useful Links

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001/api`
- **API Docs:** `/api/docs` (if Swagger enabled)
- **Database:** `postgresql://localhost:5432/apolaki_db`

---

## ✨ Next Steps

1. ✅ Verify login works with `./verify-local-login.sh`
2. ✅ Test login in browser at `http://localhost:5173/login`
3. ✅ Verify color theme toggle works
4. ✅ Check UI visibility (buttons, status bar, footer)
5. 🔄 Create new test users (if needed)
6. 🔄 Test other features (installations, monitoring, etc.)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs: `npm run dev` output
3. Check frontend console: Press F12 in browser
4. Check browser Network tab for API errors
5. Verify database connection: `pg_isready -h localhost`

---

**Last Updated:** 2025-01-03  
**Status:** ✅ All Core Features Working
