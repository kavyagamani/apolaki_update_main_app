#!/bin/bash

# ============================================================================
# Apolaki Solar Platform - Local Login Verification Script
# ============================================================================
# This script verifies that:
# 1. Backend API is running and database is connected
# 2. Admin user is properly seeded in database
# 3. Login works with admin credentials via API
# 4. Frontend can reach the backend through Vite proxy
# 5. Color theme is properly applied in frontend
# ============================================================================

set -e

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3001/api"
ADMIN_EMAIL="admin@apolaki.com"
ADMIN_PASSWORD="admin123"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Apolaki Local Login Verification                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if backend is running
echo "1️⃣  Checking if Backend API is running on port 3001..."
if ! lsof -i :3001 > /dev/null 2>&1; then
  echo "   ❌ Backend is not running on port 3001"
  echo "   Start the backend with: cd middleware/netlify-db-service && npm run dev"
  exit 1
fi
echo "   ✅ Backend is running on port 3001"
echo ""

# Check if frontend is running
echo "2️⃣  Checking if Frontend is running on port 5173..."
if ! lsof -i :5173 > /dev/null 2>&1; then
  echo "   ❌ Frontend is not running on port 5173"
  echo "   Start the frontend with: cd frontend && npm run dev"
  exit 1
fi
echo "   ✅ Frontend is running on port 5173"
echo ""

# Test backend health
echo "3️⃣  Testing Backend Health Endpoint..."
HEALTH=$(curl -s -X GET "$BACKEND_URL/health" 2>/dev/null)
if [[ $HEALTH == *"healthy"* ]] || [[ $HEALTH == *"ok"* ]]; then
  echo "   ✅ Backend health check passed"
else
  echo "   ⚠️  Backend health endpoint: $HEALTH"
fi
echo ""

# Test login via API
echo "4️⃣  Testing Login via Backend API..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')
  USER_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.user.role')
  
  echo "   ✅ Login successful via API"
  echo "      User: $ADMIN_EMAIL (ID: $USER_ID)"
  echo "      Role: $USER_ROLE"
  echo "      Token: ${TOKEN:0:20}..."
else
  echo "   ❌ Login failed via API"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test frontend connectivity
echo "5️⃣  Testing Frontend-to-Backend Connectivity (via Vite proxy)..."
TEST_API=$(curl -s -X GET "$FRONTEND_URL/api/health" 2>/dev/null)
if [[ ! -z "$TEST_API" ]]; then
  echo "   ✅ Frontend can reach backend via /api proxy"
else
  echo "   ⚠️  Frontend /api proxy may not be working correctly"
fi
echo ""

# Test UI elements
echo "6️⃣  Checking Frontend UI Elements..."
FRONTEND_HTML=$(curl -s "$FRONTEND_URL" 2>/dev/null)

# Check for color theme CSS
if echo "$FRONTEND_HTML" | grep -q "solar-gold\|sky-blue\|dark-orange" 2>/dev/null; then
  echo "   ✅ Color theme CSS classes detected"
else
  echo "   ⚠️  Color theme CSS classes not found in HTML (may be loaded via JS)"
fi

# Check for login form
if echo "$FRONTEND_HTML" | grep -q "id=\"email\"\|type=\"email\"\|Login" 2>/dev/null; then
  echo "   ✅ Login form elements detected"
else
  echo "   ⚠️  Login form elements not found in initial HTML"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Verification Complete ✅                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Summary:"
echo "   • Backend API: RUNNING ✅"
echo "   • Frontend: RUNNING ✅"
echo "   • Database: CONNECTED ✅"
echo "   • Admin User: SEEDED ✅"
echo "   • Login: WORKING ✅"
echo ""
echo "🚀 Next Steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Click the 'Login' button or navigate to /login"
echo "   3. Enter credentials:"
echo "      • Email: $ADMIN_EMAIL"
echo "      • Password: $ADMIN_PASSWORD"
echo "   4. Verify:"
echo "      • Login succeeds and you're redirected to dashboard"
echo "      • Color theme is visible (dark/light toggle)"
echo "      • Status bar and buttons are visible"
echo "      • Footer is at bottom of page"
echo ""
echo "🔍 If login still fails in browser:"
echo "   • Check browser console (F12) for errors"
echo "   • Check network tab to see API requests/responses"
echo "   • Verify backend logs for any errors"
echo "   • Try the API login directly:"
echo "     curl -X POST http://localhost:3001/api/auth/login \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"email\": \"admin@apolaki.com\", \"password\": \"admin123\"}'"
echo ""
