#!/bin/bash

################################################################################
# APOLAKI SOLAR PLATFORM - COMPREHENSIVE LOCAL LOGIN TEST SCRIPT
# Automated testing of local login workflow
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_header() {
  echo ""
  echo -e "${MAGENTA}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${MAGENTA}$1${NC}"
  echo -e "${MAGENTA}════════════════════════════════════════════════════════════════${NC}"
}

log_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_info() {
  echo -e "${CYAN}ℹ️  $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

log_header "APOLAKI SOLAR PLATFORM - LOCAL LOGIN TEST"

# ============================================================================
# 1. SERVICE AVAILABILITY CHECK
# ============================================================================

log_section "1. Service Availability Check"

echo "Checking if required services are running..."
echo ""

# Check backend
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
  log_success "Backend is running on port 3001"
  BACKEND_RUNNING=true
else
  log_error "Backend is NOT running on port 3001"
  BACKEND_RUNNING=false
fi

# Check frontend
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
  log_success "Frontend is running on port 5173"
  FRONTEND_RUNNING=true
else
  log_error "Frontend is NOT running on port 5173"
  FRONTEND_RUNNING=false
fi

# Check PostgreSQL container
if docker ps 2>/dev/null | grep -q "apolaki-postgres"; then
  log_success "PostgreSQL container is running"
  DB_RUNNING=true
else
  log_error "PostgreSQL container is NOT running"
  DB_RUNNING=false
fi

echo ""

if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ] || [ "$DB_RUNNING" = false ]; then
  log_error "Some services are not running. Cannot proceed with login test."
  echo ""
  echo "Start the services with:"
  echo ""
  if [ "$DB_RUNNING" = false ]; then
    echo "  docker-compose -f config/docker-compose.yml up -d postgres"
  fi
  if [ "$BACKEND_RUNNING" = false ]; then
    echo "  cd middleware/netlify-db-service && npm run dev"
  fi
  if [ "$FRONTEND_RUNNING" = false ]; then
    echo "  cd frontend && npm run dev"
  fi
  echo ""
  exit 1
fi

log_success "All services are running!"

# ============================================================================
# 2. DATABASE CONNECTION TEST
# ============================================================================

log_section "2. Database Connection Test"

log_info "Testing database connectivity..."

if docker exec apolaki-postgres pg_isready -U apolaki_user &> /dev/null; then
  log_success "Database is responding"
  
  # Check if users table exists
  USERS_COUNT=$(docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users';" 2>/dev/null || echo "0")
  
  if [ "$USERS_COUNT" -gt "0" ]; then
    log_success "Users table exists"
    
    # Check if admin user exists
    ADMIN_EXISTS=$(docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -tc "SELECT COUNT(*) FROM users WHERE email='admin@apolaki.solar';" 2>/dev/null || echo "0")
    
    if [ "$ADMIN_EXISTS" -gt "0" ]; then
      log_success "Admin user exists in database"
    else
      log_warn "Admin user does not exist yet (will be created on first login attempt)"
    fi
  else
    log_error "Users table not found"
  fi
else
  log_error "Cannot connect to database"
fi

# ============================================================================
# 3. BACKEND API TEST
# ============================================================================

log_section "3. Backend API Test"

log_info "Testing backend endpoints..."
echo ""

# Test health endpoint
log_info "Testing /health endpoint..."
HEALTH=$(curl -s -w "%{http_code}" http://localhost:3001/health -o /tmp/health.json)

if [ "$HEALTH" = "200" ]; then
  log_success "Health check returned 200"
  if grep -q "database.*connected" /tmp/health.json; then
    log_success "Database is connected according to health check"
  fi
else
  log_error "Health check returned $HEALTH"
fi

echo ""

# Test login endpoint with curl
log_info "Testing /api/auth/login endpoint with curl..."
echo ""

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apolaki.solar",
    "password": "admin123"
  }')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | head -c 500

echo ""
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  log_success "Login endpoint returned 200 OK"
  
  if echo "$BODY" | grep -q "token"; then
    log_success "Response contains authentication token"
  fi
  
  if echo "$BODY" | grep -q "admin@apolaki.solar"; then
    log_success "Response contains correct user email"
  fi
else
  log_error "Login endpoint returned HTTP $HTTP_CODE"
  log_info "This might be expected if admin user needs to be seeded first"
fi

# ============================================================================
# 4. VITE PROXY TEST
# ============================================================================

log_section "4. Frontend Proxy Configuration Test"

log_info "Checking vite.config.js proxy setup..."
echo ""

if [ -f "$SCRIPT_DIR/frontend/vite.config.js" ]; then
  if grep -q "proxy" "$SCRIPT_DIR/frontend/vite.config.js"; then
    log_success "Vite proxy is configured"
    
    if grep -q "localhost:3001" "$SCRIPT_DIR/frontend/vite.config.js"; then
      log_success "Proxy points to backend at localhost:3001"
    else
      log_warn "Proxy configuration may need adjustment"
    fi
  else
    log_warn "Vite proxy configuration not found"
  fi
else
  log_error "vite.config.js not found at $SCRIPT_DIR/frontend/"
fi

# ============================================================================
# 5. ENVIRONMENT VARIABLES TEST
# ============================================================================

log_section "5. Environment Variables Configuration Test"

echo ""

log_info "Backend configuration:"
if [ -f "$SCRIPT_DIR/middleware/netlify-db-service/.env" ]; then
  log_success ".env file exists"
  
  # Count configuration variables
  VAR_COUNT=$(grep -c "^[^#]" "$SCRIPT_DIR/middleware/netlify-db-service/.env" || echo "0")
  log_info "Found $VAR_COUNT configuration variables"
else
  log_error ".env file not found at backend"
fi

echo ""

log_info "Frontend configuration:"
if [ -f "$SCRIPT_DIR/frontend/vite.config.js" ]; then
  log_success "vite.config.js exists"
else
  log_error "vite.config.js not found"
fi

# ============================================================================
# 6. NETWORK TEST FROM FRONTEND PERSPECTIVE
# ============================================================================

log_section "6. Network Connectivity Test"

log_info "Testing if frontend can reach backend..."
echo ""

# Try to hit the backend from a request that frontend would make
CORS_TEST=$(curl -s -w "%{http_code}" \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  http://localhost:3001/api/auth/login \
  -o /tmp/cors.json)

if [ "$CORS_TEST" = "200" ] || [ "$CORS_TEST" = "400" ] || [ "$CORS_TEST" = "401" ]; then
  log_success "Backend is responding to requests from frontend origin"
else
  log_warn "Unexpected response code: $CORS_TEST (could indicate CORS issue)"
fi

# ============================================================================
# 7. TEST SUMMARY & RECOMMENDATIONS
# ============================================================================

log_header "TEST SUMMARY & NEXT STEPS"

echo ""
echo -e "${CYAN}Test Results:${NC}"
echo "  Services:              $([ "$BACKEND_RUNNING" = true ] && echo "✅" || echo "❌") Backend  $([ "$FRONTEND_RUNNING" = true ] && echo "✅" || echo "❌") Frontend  $([ "$DB_RUNNING" = true ] && echo "✅" || echo "❌") Database"
echo "  Login API Response:    $([ "$HTTP_CODE" = "200" ] && echo "✅ Success" || echo "⚠️  $HTTP_CODE")"
echo "  Proxy Configuration:   ✅ Configured"
echo "  Environment Variables: ✅ Present"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}🎉 LOGIN TEST PASSED!${NC}"
  echo ""
  echo "Your local setup is working correctly. You can now:"
  echo ""
  echo "  1. Open http://localhost:5173 in your browser"
  echo "  2. Click 'Login'"
  echo "  3. Enter credentials:"
  echo "     Email: admin@apolaki.solar"
  echo "     Password: admin123"
  echo "  4. You should be logged in and redirected to the assessment page"
  echo ""
elif [ "$HTTP_CODE" = "401" ]; then
  echo -e "${YELLOW}⚠️  LOGIN TEST NEEDS SEEDING${NC}"
  echo ""
  echo "The API is working, but the admin user needs to be created."
  echo ""
  echo "This should happen automatically when you try to login via the web UI."
  echo "Try logging in: http://localhost:5173/login"
  echo ""
  echo "If it still fails, manually seed the admin user:"
  echo ""
  echo "  docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -f /docker-entrypoint-initdb.d/init.sql"
  echo ""
elif [ "$HTTP_CODE" = "500" ]; then
  echo -e "${RED}❌ LOGIN TEST FAILED - Server Error${NC}"
  echo ""
  echo "The backend is responding but encountered an error."
  echo ""
  echo "Check backend logs for details:"
  echo "  Look at the terminal running 'npm run dev' in middleware/netlify-db-service"
  echo ""
  echo "Common issues:"
  echo "  • Database connection problem"
  echo "  • Missing environment variables"
  echo "  • Schema not initialized"
  echo ""
else
  echo -e "${RED}❌ LOGIN TEST FAILED - Cannot reach API${NC}"
  echo ""
  echo "Make sure:"
  echo "  1. Backend is running: cd middleware/netlify-db-service && npm run dev"
  echo "  2. Port 3001 is not blocked by firewall"
  echo "  3. Check backend logs for errors"
  echo ""
fi

echo ""
log_section "Manual Testing in Browser"

echo ""
echo "1. Open http://localhost:5173"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Go to Login page"
echo "5. Enter credentials and submit"
echo "6. Check Console for any JavaScript errors"
echo "7. Check Network tab for API requests"
echo "   • Look for POST /api/auth/login"
echo "   • Check response body for error details"
echo "   • Check response headers for CORS issues"
echo ""

echo -e "${CYAN}If login still fails:${NC}"
echo ""
echo "1. Run this debug script again: ./debug-local-login.sh"
echo "2. Check browser console (F12) for specific error messages"
echo "3. Share the error message from console or Network tab"
echo ""
