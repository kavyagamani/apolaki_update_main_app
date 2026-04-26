#!/bin/bash

################################################################################
# APOLAKI SOLAR PLATFORM - LOGIN & CONNECTION DEBUG SCRIPT
# Diagnoses and fixes common local login issues
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

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

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

log_header "APOLAKI SOLAR PLATFORM - LOGIN & CONNECTION DEBUG"

# ============================================================================
# 1. PORT AVAILABILITY CHECK
# ============================================================================

log_section "Port Availability Check"

check_port() {
  local port=$1
  local name=$2
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_success "$name is running on port $port"
    return 0
  else
    log_error "$name is NOT running on port $port"
    log_info "Expected port: $port"
    return 1
  fi
}

BACKEND_OK=false
FRONTEND_OK=false

if check_port 3001 "Backend (Express)"; then
  BACKEND_OK=true
fi

if check_port 5173 "Frontend (Vite)"; then
  FRONTEND_OK=true
fi

# ============================================================================
# 2. API CONNECTIVITY TEST
# ============================================================================

log_section "API Connectivity Test"

if [ "$BACKEND_OK" = true ]; then
  log_info "Testing backend health endpoint..."
  
  if command -v curl &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/health)
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
    BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
      log_success "Backend health check passed (HTTP 200)"
      
      # Try to parse database status
      if echo "$BODY" | grep -q "database.*connected"; then
        log_success "Database is connected"
      elif echo "$BODY" | grep -q "database.*error"; then
        log_error "Database connection failed"
        log_info "Response: $BODY"
      fi
    else
      log_error "Backend health check failed (HTTP $HTTP_CODE)"
      log_info "Response: $BODY"
    fi
  else
    log_warn "curl not available, skipping health check"
  fi
else
  log_error "Cannot test backend - it's not running on port 3001"
fi

# ============================================================================
# 3. DATABASE CONNECTION TEST
# ============================================================================

log_section "Database Connection Test"

# Check if PostgreSQL container is running
if docker ps 2>/dev/null | grep -q "apolaki-postgres"; then
  log_success "PostgreSQL container is running"
  
  # Try to connect
  log_info "Testing database connection..."
  if docker exec apolaki-postgres pg_isready -U apolaki_user &> /dev/null; then
    log_success "Database is accessible"
    
    # Check if tables exist
    log_info "Checking database schema..."
    TABLES=$(docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
    
    if [ "$TABLES" -gt 0 ]; then
      log_success "Database schema exists with $TABLES tables"
    else
      log_warn "No tables found in database. Schema may not be initialized."
    fi
  else
    log_error "Cannot connect to PostgreSQL"
  fi
else
  log_error "PostgreSQL container is NOT running"
  log_info "Start it with: docker-compose -f config/docker-compose.yml up -d postgres"
fi

# ============================================================================
# 4. ENVIRONMENT VARIABLES CHECK
# ============================================================================

log_section "Environment Variables Check"

log_info "Backend environment (.env):"
if [ -f "$PROJECT_ROOT/middleware/netlify-db-service/.env" ]; then
  log_success "Backend .env file exists"
  
  # Check critical variables without exposing secrets
  if grep -q "NETLIFY_DATABASE_URL" "$PROJECT_ROOT/middleware/netlify-db-service/.env"; then
    log_success "  ✓ NETLIFY_DATABASE_URL is configured"
  else
    log_error "  ✗ NETLIFY_DATABASE_URL is missing"
  fi
  
  if grep -q "JWT_SECRET" "$PROJECT_ROOT/middleware/netlify-db-service/.env"; then
    log_success "  ✓ JWT_SECRET is configured"
  else
    log_error "  ✗ JWT_SECRET is missing"
  fi
else
  log_error "Backend .env file not found"
fi

# ============================================================================
# 5. LOGIN CREDENTIALS VERIFICATION
# ============================================================================

log_section "Login Credentials Verification"

if [ "$BACKEND_OK" = true ]; then
  log_info "Testing login with default credentials..."
  
  if command -v curl &> /dev/null; then
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@apolaki.solar","password":"admin123"}')
    
    HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
    BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
      log_success "Login test PASSED (HTTP 200)"
      
      if echo "$BODY" | grep -q "token"; then
        log_success "Authentication token received"
      fi
    elif [ "$HTTP_CODE" = "401" ]; then
      log_error "Login test FAILED - Invalid credentials (HTTP 401)"
      log_info "Admin user may not be seeded. Run: npm run seed:admin in backend directory"
    else
      log_error "Login test FAILED (HTTP $HTTP_CODE)"
      log_info "Response: $BODY"
    fi
  else
    log_warn "curl not available, skipping login test"
  fi
else
  log_error "Cannot test login - backend is not running"
fi

# ============================================================================
# 6. CORS CONFIGURATION CHECK
# ============================================================================

log_section "CORS Configuration Check"

log_info "Checking Vite proxy configuration..."
if [ -f "$PROJECT_ROOT/frontend/vite.config.js" ]; then
  if grep -q "proxy" "$PROJECT_ROOT/frontend/vite.config.js"; then
    log_success "Vite proxy is configured"
    
    if grep -q "localhost:3001" "$PROJECT_ROOT/frontend/vite.config.js"; then
      log_success "Proxy correctly points to backend (localhost:3001)"
    else
      log_error "Proxy may not point to correct backend URL"
    fi
  else
    log_warn "Vite proxy not found in config"
  fi
else
  log_error "vite.config.js not found"
fi

# ============================================================================
# 7. BROWSER CONSOLE TIPS
# ============================================================================

log_section "Browser Console Debugging (F12)"

echo ""
echo -e "${YELLOW}When testing login in the browser:${NC}"
echo ""
echo "1. Open Developer Tools: F12"
echo "2. Go to Console tab"
echo "3. Look for these common issues:"
echo ""
echo "   • CORS error: 'Access to XMLHttpRequest blocked by CORS policy'"
echo "     → Backend not running or proxy not configured"
echo ""
echo "   • 401 error: 'Invalid credentials'"
echo "     → Admin user not seeded or wrong password"
echo ""
echo "   • 500 error: 'Login failed'"
echo "     → Database connection issue"
echo ""
echo "   • Network error: 'Failed to fetch'"
echo "     → Backend not responding, check if running on port 3001"
echo ""
echo "4. Go to Network tab to inspect API requests:"
echo "   • Check POST /api/auth/login request"
echo "   • Look at response body for error details"
echo "   • Check response headers for CORS issues"
echo ""

# ============================================================================
# 8. QUICK FIX COMMANDS
# ============================================================================

log_section "Quick Fix Commands"

echo ""
if [ "$BACKEND_OK" = false ]; then
  echo -e "${YELLOW}Backend is not running. Start it with:${NC}"
  echo "  cd $PROJECT_ROOT/middleware/netlify-db-service"
  echo "  npm run dev"
  echo ""
fi

if [ "$FRONTEND_OK" = false ]; then
  echo -e "${YELLOW}Frontend is not running. Start it with:${NC}"
  echo "  cd $PROJECT_ROOT/frontend"
  echo "  npm run dev"
  echo ""
fi

if docker ps 2>/dev/null | grep -q "apolaki-postgres"; then
  :
else
  echo -e "${YELLOW}PostgreSQL is not running. Start it with:${NC}"
  echo "  docker-compose -f $PROJECT_ROOT/config/docker-compose.yml up -d postgres"
  echo ""
fi

# ============================================================================
# 9. ADMIN USER SEEDING (if needed)
# ============================================================================

log_section "Admin User Seeding"

if [ "$BACKEND_OK" = true ]; then
  log_info "Checking if admin user exists..."
  
  if docker exec apolaki-postgres psql -U apolaki_user -d apolaki_db -c "SELECT email FROM users WHERE email='admin@apolaki.solar';" 2>/dev/null | grep -q "admin@apolaki.solar"; then
    log_success "Admin user already exists"
  else
    log_warn "Admin user does not exist yet"
    log_info "It will be auto-seeded when you first access /api/auth/login"
    log_info "Or manually trigger by: cd $PROJECT_ROOT/middleware/netlify-db-service && node -e \"import('./src/routes/auth.js').catch(console.error)\""
  fi
else
  log_warn "Cannot check admin user (backend not running)"
fi

# ============================================================================
# 10. SUMMARY
# ============================================================================

log_header "Debug Summary"

echo ""
if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
  log_success "✓ Both frontend and backend are running"
  echo ""
  echo -e "${GREEN}You should be able to access the app at: http://localhost:5173${NC}"
  echo -e "${GREEN}Try logging in with:${NC}"
  echo -e "${GREEN}  Email: admin@apolaki.solar${NC}"
  echo -e "${GREEN}  Password: admin123${NC}"
else
  log_error "One or more services are not running"
  echo ""
  if [ "$BACKEND_OK" = false ]; then
    echo "Start backend: cd $PROJECT_ROOT/middleware/netlify-db-service && npm run dev"
  fi
  if [ "$FRONTEND_OK" = false ]; then
    echo "Start frontend: cd $PROJECT_ROOT/frontend && npm run dev"
  fi
fi

echo ""
