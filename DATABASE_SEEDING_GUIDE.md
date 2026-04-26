# 🌱 Database Seeding Guide - Apolaki Solar

## Admin User Credentials

The following admin user will be seeded into your local PostgreSQL database:

```
Email: admin@apolaki.com
Password: admin123
Role: admin
```

---

## Quick Setup (3 Steps)

### Step 1: Ensure Database is Running

Make sure PostgreSQL is running on your machine:

```bash
# If using Homebrew (macOS)
brew services start postgresql@15

# Or manually:
pg_ctl -D /usr/local/var/postgres start
```

Verify it's running:
```bash
lsof -i :5432
```

You should see a PostgreSQL process listening on port 5432.

### Step 2: Create the Database and User

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Inside psql, run:
CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';
CREATE DATABASE apolaki_db OWNER apolaki_user;
ALTER ROLE apolaki_user WITH CREATEDB;

# Exit psql
\q
```

Verify the database was created:
```bash
psql -U apolaki_user -d apolaki_db -c "SELECT 1"
```

Should return:
```
 ?column?
----------
        1
```

### Step 3: Seed the Admin User

**Option A: Automatic Seeding (When Backend Starts)**

When you start the backend with `npm run dev`, it will automatically:
1. Create the database schema
2. Seed the admin user

```bash
cd middleware/netlify-db-service
npm run dev
```

Watch for this message:
```
✅ Seeded default admin user: admin@apolaki.com / admin123
```

**Option B: Manual Seeding (Using Script)**

```bash
cd middleware/netlify-db-service
node seed-admin.js
```

You should see:
```
🌱 Starting database seeding...

📊 Initializing database connection...
📋 Ensuring schema exists...
✅ Schema ready

👤 Checking for existing admin user: admin@apolaki.com
✍️  Creating admin user: admin@apolaki.com
✅ Admin user created successfully!

📌 Admin Account Details:
   ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Email: admin@apolaki.com
   Name: Admin User
   Role: admin
   Created: 2026-03-01 ...

🔑 Login Credentials:
   Email: admin@apolaki.com
   Password: admin123

✨ Seeding completed successfully!
🚀 You can now login to the application.
```

---

## Verify Seeding Worked

Connect to the database and check:

```bash
# Connect to database
psql -U apolaki_user -d apolaki_db

# Inside psql, check admin user exists:
SELECT id, email, role, created_at FROM users WHERE email='admin@apolaki.com';
```

You should see:
```
                  id                  |      email       | role  |     created_at
--------------------------------------+------------------+-------+---------------------
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | admin@apolaki.com | admin | 2026-03-01 ...
(1 row)
```

Exit psql:
```bash
\q
```

---

## Test Login

### Via API (curl)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.com",
    "password": "admin123"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "admin@apolaki.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "sessionToken": "..."
}
```

### Via Browser

1. Start the frontend: `cd frontend && npm run dev`
2. Open http://localhost:5173
3. Click "Login"
4. Enter:
   - Email: `admin@apolaki.com`
   - Password: `admin123`
5. Click Login
6. Should redirect to assessment page

---

## Troubleshooting

### "Cannot connect to database"

**Check PostgreSQL is running:**
```bash
lsof -i :5432
```

If not running, start it:
```bash
# macOS with Homebrew
brew services start postgresql@15

# Or manually
pg_ctl -D /usr/local/var/postgres start
```

### "Database does not exist"

**Create the database:**
```bash
psql -U postgres -c "CREATE DATABASE apolaki_db;"
psql -U postgres -c "CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';"
psql -U postgres -c "ALTER DATABASE apolaki_db OWNER TO apolaki_user;"
```

### "Permission denied"

**Ensure user has correct privileges:**
```bash
psql -U postgres -c "ALTER ROLE apolaki_user WITH CREATEDB;"
```

### "Admin user already exists"

The script will skip if the user already exists. To reset:

```bash
# Connect to database
psql -U apolaki_user -d apolaki_db

# Inside psql, delete the admin user:
DELETE FROM users WHERE email='admin@apolaki.com';

# Exit
\q

# Re-seed
node seed-admin.js
```

### "Tables do not exist"

The schema is created automatically when:
1. Backend starts (`npm run dev`)
2. Or when seeding script runs (`node seed-admin.js`)

If tables still don't exist, try manually:

```bash
# Run the schema SQL file
psql -U apolaki_user -d apolaki_db -f schema.sql
```

---

## Environment Variables

Ensure these are set in `.env`:

```properties
# Database Configuration
NETLIFY_DATABASE_URL=postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db

# Or for Unix socket (macOS/Linux)
NETLIFY_DATABASE_URL=postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db?host=/tmp

# Server
PORT=3001
NODE_ENV=development

# Secrets (change in production)
JWT_SECRET=apolaki-dev-secret-key-change-in-production-123456
SESSION_SECRET=apolaki-session-secret-change-in-production-654321
```

---

## Complete Setup from Scratch

```bash
# 1. Start PostgreSQL
brew services start postgresql@15

# 2. Create database and user
psql -U postgres -c "CREATE DATABASE apolaki_db;"
psql -U postgres -c "CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';"
psql -U postgres -c "ALTER DATABASE apolaki_db OWNER TO apolaki_user;"

# 3. Seed admin user
cd middleware/netlify-db-service
npm install
node seed-admin.js

# 4. Start backend
npm run dev

# 5. In another terminal, start frontend
cd frontend
npm install
npm run dev

# 6. Open http://localhost:5173 and login with:
#    Email: admin@apolaki.com
#    Password: admin123
```

---

## Additional Commands

### View all users in database
```bash
psql -U apolaki_user -d apolaki_db -c "SELECT id, email, first_name, last_name, role, created_at FROM users;"
```

### Reset database completely
```bash
# Drop database (careful!)
psql -U postgres -c "DROP DATABASE apolaki_db;"

# Recreate
psql -U postgres -c "CREATE DATABASE apolaki_db;"
psql -U postgres -c "ALTER DATABASE apolaki_db OWNER TO apolaki_user;"

# Re-seed
cd middleware/netlify-db-service
node seed-admin.js
```

### Update admin password
```bash
# Connect to database
psql -U apolaki_user -d apolaki_db

# Use this SQL to update (requires hashing):
-- Copy the hash from the seeding output or generate new one
UPDATE users SET password_hash='$2a$10$...' WHERE email='admin@apolaki.com';
```

---

## Success Checklist

✅ PostgreSQL is running on port 5432
✅ Database `apolaki_db` exists
✅ User `apolaki_user` exists with password `apolaki_pass`
✅ Schema tables are created
✅ Admin user exists in `users` table
✅ Login works with `admin@apolaki.com` / `admin123`
✅ Backend shows seeding message on startup
✅ Frontend loads and redirects to assessment after login

---

## Support

If you encounter issues:

1. Check PostgreSQL is running: `lsof -i :5432`
2. Verify database exists: `psql -U apolaki_user -d apolaki_db -c "SELECT 1"`
3. Check users table: `psql -U apolaki_user -d apolaki_db -c "SELECT * FROM users"`
4. Read backend logs: Check terminal running `npm run dev`
5. Check browser console: F12 → Console tab

---

**Created:** March 1, 2026
**Status:** Ready for Production ✅
