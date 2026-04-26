# 🌱 DATABASE SEEDING - COMPLETE SETUP

## Summary

I've created a complete database seeding system for the Apolaki Solar Platform with the following admin credentials:

```
Email: admin@apolaki.com
Password: admin123
Role: admin (full system access)
```

---

## Files Created

### 1. **seed-admin.js** (Node.js Script)
Location: `middleware/netlify-db-service/seed-admin.js`

**Purpose:** Seeds the admin user into the PostgreSQL database

**Usage:**
```bash
cd middleware/netlify-db-service
node seed-admin.js
```

**What it does:**
- Connects to local PostgreSQL database
- Creates database schema if needed
- Checks if admin user exists
- Creates admin user with credentials
- Shows admin user details and login instructions

**Output:**
```
🌱 Starting database seeding...
✅ Schema ready
✅ Admin user created successfully!

📌 Admin Account Details:
   Email: admin@apolaki.com
   Password: admin123
   Role: admin

✨ Seeding completed successfully!
```

---

### 2. **quick-seed.sh** (Bash Script)
Location: `quick-seed.sh` (root directory)

**Purpose:** Quick one-command seeding with prerequisite checks

**Usage:**
```bash
./quick-seed.sh
```

**What it does:**
- Checks if PostgreSQL is running
- Verifies database exists
- Runs the Node.js seeding script
- Shows next steps

**Output:**
```
1️⃣  Checking PostgreSQL...
   ✅ PostgreSQL is running
2️⃣  Checking database...
   ✅ Database apolaki_db exists
3️⃣  Seeding admin user...
   ✅ Admin user created

✨ Seeding completed!

Next steps:
  1. Start backend: npm run dev
  2. Start frontend: cd ../../frontend && npm run dev
  3. Open: http://localhost:5173
  4. Login with: admin@apolaki.com / admin123
```

---

### 3. **DATABASE_SEEDING_GUIDE.md** (Documentation)
Location: `DATABASE_SEEDING_GUIDE.md` (root directory)

**Purpose:** Comprehensive seeding documentation

**Contains:**
- Setup instructions
- Troubleshooting guide
- Complete from-scratch setup
- Additional commands
- Success checklist

---

## Quick Start (2 Minutes)

### Step 1: Verify PostgreSQL is Running
```bash
lsof -i :5432
```

Should show a PostgreSQL process. If not:
```bash
brew services start postgresql@15
```

### Step 2: Create Database (One-Time)
```bash
psql -U postgres -c "CREATE DATABASE apolaki_db;"
psql -U postgres -c "CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';"
psql -U postgres -c "ALTER DATABASE apolaki_db OWNER TO apolaki_user;"
```

### Step 3: Seed Admin User
```bash
./quick-seed.sh
```

Or manually:
```bash
cd middleware/netlify-db-service
node seed-admin.js
```

---

## How It Works

### 1. **Automatic Seeding (On Backend Startup)**

When you start the backend with `npm run dev`, it automatically:
1. Connects to PostgreSQL
2. Creates schema (if needed)
3. Seeds admin user (if doesn't exist)

```bash
cd middleware/netlify-db-service
npm run dev
```

Watch for:
```
✅ Seeded default admin user: admin@apolaki.com / admin123
Express server running on port 3001
```

### 2. **Manual Seeding (Via Script)**

Use the seed script anytime:
```bash
node middleware/netlify-db-service/seed-admin.js
```

This is useful if:
- You need to reset the database
- You want to seed multiple times
- You're setting up a fresh environment

---

## What Gets Seeded

### Admin User
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
  'admin@apolaki.com',
  'bcrypt_hash_of_admin123',
  'Admin',
  'User',
  'admin'
);
```

### Verification

Check if admin was seeded:
```bash
psql -U apolaki_user -d apolaki_db -c "SELECT id, email, role FROM users WHERE email='admin@apolaki.com';"
```

Should output:
```
                  id                  |      email       | role
--------------------------------------+------------------+------
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | admin@apolaki.com | admin
```

---

## Testing the Seeded User

### Test 1: Via curl
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.com",
    "password": "admin123"
  }'
```

Should return 200 with JWT token.

### Test 2: Via Browser
1. Start backend: `cd middleware/netlify-db-service && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Click "Login"
5. Enter `admin@apolaki.com` / `admin123`
6. Should redirect to assessment page ✅

---

## Troubleshooting

### "ECONNREFUSED" Error

**Cause:** PostgreSQL not running

**Fix:**
```bash
brew services start postgresql@15
```

### "Database does not exist"

**Cause:** apolaki_db not created

**Fix:**
```bash
psql -U postgres -c "CREATE DATABASE apolaki_db;"
psql -U postgres -c "ALTER DATABASE apolaki_db OWNER TO apolaki_user;"
```

### "User already exists"

**Cause:** Admin user was already seeded

**Result:** Script will skip and show existing user details. This is normal!

**To reset:**
```bash
psql -U apolaki_user -d apolaki_db -c "DELETE FROM users WHERE email='admin@apolaki.com';"
node middleware/netlify-db-service/seed-admin.js
```

### "relation users does not exist"

**Cause:** Schema wasn't created

**Fix:** Restart backend to trigger auto-schema creation
```bash
cd middleware/netlify-db-service
npm run dev
```

---

## Configuration

### Backend Environment Variables
File: `middleware/netlify-db-service/.env`

```properties
# Database
NETLIFY_DATABASE_URL=postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db

# Server
PORT=3001
NODE_ENV=development

# Security (change in production!)
JWT_SECRET=apolaki-dev-secret-key-change-in-production-123456
SESSION_SECRET=apolaki-session-secret-change-in-production-654321
```

All are already configured! ✅

---

## Complete Setup from Scratch

```bash
# 1. Start PostgreSQL
brew services start postgresql@15

# 2. Create database and user
psql -U postgres << EOF
CREATE DATABASE apolaki_db;
CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';
ALTER DATABASE apolaki_db OWNER TO apolaki_user;
EOF

# 3. Install backend dependencies
cd middleware/netlify-db-service
npm install

# 4. Seed admin user
node seed-admin.js

# 5. Start backend (in Terminal 1)
npm run dev

# 6. Start frontend (in Terminal 2)
cd ../../frontend
npm install
npm run dev

# 7. Open browser and login
# http://localhost:5173
# admin@apolaki.com / admin123
```

---

## Key Features

✅ **Auto-Seeding:** Admin user created automatically when backend starts
✅ **Idempotent:** Safe to run multiple times (won't create duplicates)
✅ **Secure:** Password hashed with bcrypt
✅ **Comprehensive:** Includes all user fields
✅ **Documented:** Clear console output
✅ **Easy:** One command to seed: `./quick-seed.sh`

---

## Next Steps

1. ✅ Run `./quick-seed.sh` to seed admin user
2. ✅ Start backend: `cd middleware/netlify-db-service && npm run dev`
3. ✅ Start frontend: `cd frontend && npm run dev`
4. ✅ Open http://localhost:5173
5. ✅ Login with `admin@apolaki.com` / `admin123`
6. ✅ Test the full application

---

## Support

### View Seeding Logs
- Backend terminal shows seeding messages
- Check `DATABASE_SEEDING_GUIDE.md` for troubleshooting

### View Database
```bash
psql -U apolaki_user -d apolaki_db
```

Inside psql:
```sql
SELECT * FROM users;
SELECT COUNT(*) FROM users;
\dt  -- List all tables
\q   -- Exit
```

### Reset Everything
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE apolaki_db;"
psql -U postgres -c "CREATE DATABASE apolaki_db;"
psql -U postgres -c "ALTER DATABASE apolaki_db OWNER TO apolaki_user;"

# Re-seed
node middleware/netlify-db-service/seed-admin.js
```

---

## Success Indicators

When seeding is complete:

✅ `./quick-seed.sh` shows "✨ Seeding completed!"
✅ Backend shows "✅ Seeded default admin user: admin@apolaki.com / admin123"
✅ Database query shows admin user exists
✅ Login works with `admin@apolaki.com` / `admin123`
✅ Redirects to assessment page after login

---

**Status:** ✅ Complete and Ready to Use
**Created:** March 1, 2026
**Admin User:** admin@apolaki.com / admin123
