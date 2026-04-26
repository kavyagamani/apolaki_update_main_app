#!/bin/bash

# ============================================================================
# APOLAKI SOLAR PLATFORM - START HERE
# ============================================================================
# This script provides a quick start guide for running the application locally
# and testing the login functionality.
#
# Prerequisites:
# - Node.js 18+ installed
# - PostgreSQL 13+ running on localhost:5432
# - npm 8+ installed
#
# Usage:
#   chmod +x START_HERE.sh
#   ./START_HERE.sh
# ============================================================================

set -e

clear

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                    APOLAKI SOLAR PLATFORM                                 ║"
echo "║            Local Development - Quick Start Guide                          ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 SETUP CHECKLIST:"
echo ""

# Check Node.js
echo -n "1. Checking Node.js... "
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "✅ Found: $NODE_VERSION"
else
  echo "❌ Not found. Install from https://nodejs.org/"
  exit 1
fi

# Check npm
echo -n "2. Checking npm... "
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo "✅ Found: $NPM_VERSION"
else
  echo "❌ Not found. Install from https://nodejs.org/"
  exit 1
fi

# Check PostgreSQL
echo -n "3. Checking PostgreSQL... "
if command -v psql &> /dev/null; then
  PG_VERSION=$(psql --version | head -1)
  echo "✅ Found: $PG_VERSION"
else
  echo "❌ Not found. Install: brew install postgresql@13"
  exit 1
fi

# Check if PostgreSQL is running
echo -n "4. Checking if PostgreSQL is running... "
if pg_isready -h localhost -p 5432 &> /dev/null; then
  echo "✅ Running"
else
  echo "⚠️  Not running. Starting PostgreSQL..."
  brew services start postgresql || true
  sleep 2
  if pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "✅ PostgreSQL started successfully"
  else
    echo "❌ Could not start PostgreSQL. Try: brew services start postgresql"
    exit 1
  fi
fi

echo ""
echo "✅ All prerequisites met!"
echo ""

# Offer to install dependencies
echo "📦 INSTALLING DEPENDENCIES:"
echo ""

if [ ! -d "middleware/netlify-db-service/node_modules" ]; then
  echo "   Installing backend dependencies..."
  cd middleware/netlify-db-service
  npm install
  cd ../../
  echo "   ✅ Backend dependencies installed"
else
  echo "   ✅ Backend dependencies already installed"
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "   Installing frontend dependencies..."
  cd frontend
  npm install
  cd ../
  echo "   ✅ Frontend dependencies installed"
else
  echo "   ✅ Frontend dependencies already installed"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                       🚀 READY TO START!                                 ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "NEXT STEPS - Open 3 Terminal Windows and Run:"
echo ""

echo "┌─ TERMINAL 1 (Backend API) ────────────────────────────────────────────────┐"
echo "│                                                                            │"
echo "│  cd middleware/netlify-db-service                                         │"
echo "│  npm run dev                                                              │"
echo "│                                                                            │"
echo "│  Expected: 'Server running on http://localhost:3001'                      │"
echo "│            '✅ Seeded default admin user: admin@apolaki.com / admin123'    │"
echo "│                                                                            │"
echo "└────────────────────────────────────────────────────────────────────────────┘"
echo ""

echo "┌─ TERMINAL 2 (Frontend) ───────────────────────────────────────────────────┐"
echo "│                                                                            │"
echo "│  cd frontend                                                              │"
echo "│  npm run dev                                                              │"
echo "│                                                                            │"
echo "│  Expected: 'Server running at http://localhost:5173'                      │"
echo "│                                                                            │"
echo "└────────────────────────────────────────────────────────────────────────────┘"
echo ""

echo "┌─ TERMINAL 3 (Verification) ───────────────────────────────────────────────┐"
echo "│                                                                            │"
echo "│  Wait 5 seconds for services to start, then run:                          │"
echo "│                                                                            │"
echo "│  ./verify-local-login.sh                                                  │"
echo "│                                                                            │"
echo "│  Or open browser: http://localhost:5173                                   │"
echo "│                                                                            │"
echo "└────────────────────────────────────────────────────────────────────────────┘"
echo ""

echo "🔐 LOGIN CREDENTIALS:"
echo ""
echo "   Email:    admin@apolaki.com"
echo "   Password: admin123"
echo ""

echo "🌐 USEFUL URLS:"
echo ""
echo "   Frontend:        http://localhost:5173"
echo "   Login Page:      http://localhost:5173/login"
echo "   Backend API:     http://localhost:3001/api"
echo "   API Health:      http://localhost:3001/api/health"
echo ""

echo "📚 DOCUMENTATION:"
echo ""
echo "   Quick Reference:    QUICK_REFERENCE_LOCAL.txt"
echo "   Full Guide:         LOCAL_DEVELOPMENT_GUIDE.md"
echo "   Status Report:      LOCAL_DEVELOPMENT_STATUS.md"
echo "   Task Summary:       TASK_COMPLETION_SUMMARY.md"
echo ""

echo "🆘 TROUBLESHOOTING:"
echo ""
echo "   • If port 3001 or 5173 is in use:"
echo "     lsof -i :3001 | grep LISTEN | awk '{print \$2}' | xargs kill -9"
echo "     lsof -i :5173 | grep LISTEN | awk '{print \$2}' | xargs kill -9"
echo ""
echo "   • If database connection fails:"
echo "     brew services start postgresql"
echo "     pg_isready -h localhost -p 5432"
echo ""
echo "   • If npm install fails:"
echo "     rm -rf node_modules package-lock.json"
echo "     npm install"
echo ""

echo "✨ KEY FEATURES READY TO TEST:"
echo ""
echo "   ✅ Login with email and password"
echo "   ✅ Dark/Light theme toggle (sun/moon icon in navbar)"
echo "   ✅ Consistent color theme (Solar Gold, Sky Blue)"
echo "   ✅ Visible buttons and UI components"
echo "   ✅ Footer positioned at bottom"
echo "   ✅ JWT token generation and storage"
echo "   ✅ Error handling and messages"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ready? Let's go! 🚀"
echo ""
echo "Open 3 terminal windows and follow the instructions above."
echo "Then open http://localhost:5173 in your browser."
echo ""
echo "Questions? Check the documentation files listed above."
echo ""
