#!/bin/bash

# 🌱 QUICK SEED REFERENCE - Copy Paste These Commands

echo "═════════════════════════════════════════════════════════════"
echo "APOLAKI SOLAR - QUICK DATABASE SEEDING"
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "Admin Credentials:"
echo "  Email: admin@apolaki.com"
echo "  Password: admin123"
echo ""
echo "═════════════════════════════════════════════════════════════"
echo ""

# Check PostgreSQL
echo "1️⃣  Checking PostgreSQL..."
if lsof -i :5432 > /dev/null 2>&1; then
  echo "   ✅ PostgreSQL is running"
else
  echo "   ❌ PostgreSQL is NOT running"
  echo "   Start with: brew services start postgresql@15"
  exit 1
fi

echo ""

# Check database exists
echo "2️⃣  Checking database..."
if psql -U apolaki_user -d apolaki_db -c "SELECT 1" > /dev/null 2>&1; then
  echo "   ✅ Database apolaki_db exists"
else
  echo "   ❌ Database does not exist"
  echo "   Create with:"
  echo "     psql -U postgres -c \"CREATE DATABASE apolaki_db;\""
  echo "     psql -U postgres -c \"CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';\""
  echo "     psql -U postgres -c \"ALTER DATABASE apolaki_db OWNER TO apolaki_user;\""
  exit 1
fi

echo ""

# Seed admin user
echo "3️⃣  Seeding admin user..."
cd "$(dirname "$0")/middleware/netlify-db-service"

if node seed-admin.js; then
  echo ""
  echo "✨ Seeding completed!"
  echo ""
  echo "Next steps:"
  echo "  1. Start backend: npm run dev"
  echo "  2. Start frontend: cd ../../frontend && npm run dev"
  echo "  3. Open: http://localhost:5173"
  echo "  4. Login with: admin@apolaki.com / admin123"
else
  echo "❌ Seeding failed"
  exit 1
fi
