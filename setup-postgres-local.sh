#!/bin/bash

################################################################################
# APOLAKI SOLAR PLATFORM - LOCAL POSTGRESQL SETUP & TEST
# This script sets up and manages local PostgreSQL for development
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
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
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PG_BIN="/opt/homebrew/opt/postgresql@15/bin"
PG_DATA="/opt/homebrew/var/postgresql@15"
PG_SOCKET="/tmp"

# ============================================================================
# 1. CHECK POSTGRESQL INSTALLATION
# ============================================================================

log_header "PostgreSQL Setup & Management"

log_section "Checking PostgreSQL Installation"

if [ ! -d "$PG_BIN" ]; then
  log_error "PostgreSQL 15 not found at $PG_BIN"
  log_info "Install it with: brew install postgresql@15"
  exit 1
fi

log_success "PostgreSQL 15 is installed at $PG_BIN"

# ============================================================================
# 2. CHECK IF POSTGRESQL IS RUNNING
# ============================================================================

log_section "Checking PostgreSQL Service Status"

if pgrep -f "postgres -D" > /dev/null; then
  log_success "PostgreSQL is running"
  PG_RUNNING=true
else
  log_warn "PostgreSQL is not running"
  PG_RUNNING=false
  
  log_info "Starting PostgreSQL..."
  LC_ALL="en_US.UTF-8" $PG_BIN/postgres -D $PG_DATA -k $PG_SOCKET > /dev/null 2>&1 &
  sleep 3
  
  if pgrep -f "postgres -D" > /dev/null; then
    log_success "PostgreSQL started successfully"
    PG_RUNNING=true
  else
    log_error "Failed to start PostgreSQL"
    exit 1
  fi
fi

# ============================================================================
# 3. TEST CONNECTION
# ============================================================================

log_section "Testing Database Connection"

log_info "Connecting to apolaki_db..."

if $PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db -c "SELECT 1;" > /dev/null 2>&1; then
  log_success "Successfully connected to apolaki_db"
else
  log_warn "Cannot connect to apolaki_db. Attempting to create it..."
  
  # Create database and user
  $PG_BIN/psql -h $PG_SOCKET -U macstudio postgres << 'EOSQL'
CREATE USER apolaki_user WITH PASSWORD 'apolaki_pass';
CREATE DATABASE apolaki_db OWNER apolaki_user;
ALTER USER apolaki_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE apolaki_db TO apolaki_user;
EOSQL
  
  log_success "Database and user created"
  
  # Initialize schema
  log_info "Initializing database schema..."
  $PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db < "$SCRIPT_DIR/config/init-db.sql" > /dev/null 2>&1
  log_success "Database schema initialized"
fi

# ============================================================================
# 4. VERIFY DATABASE CONTENTS
# ============================================================================

log_section "Verifying Database Schema"

TABLES=$($PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

log_info "Database contains $TABLES tables"

USERS=$($PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db -tc "SELECT COUNT(*) FROM users;")

if [ "$USERS" -gt 0 ]; then
  log_success "Database has $USERS users"
else
  log_warn "Database has no users yet (admin will be seeded on first login)"
fi

# ============================================================================
# 5. DISPLAY CONNECTION DETAILS
# ============================================================================

log_section "Connection Details"

echo ""
echo -e "${BLUE}PostgreSQL is configured and ready to use!${NC}"
echo ""
echo -e "${BLUE}Connection Details:${NC}"
echo "  Host:     localhost (via socket at $PG_SOCKET)"
echo "  Port:     5432"
echo "  Database: apolaki_db"
echo "  User:     apolaki_user"
echo "  Password: apolaki_pass"
echo ""

echo -e "${BLUE}Connect using psql:${NC}"
echo "  $PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db"
echo ""

echo -e "${BLUE}Or add this to your alias (.zshrc):${NC}"
echo "  alias psql-apolaki='$PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db'"
echo ""

# ============================================================================
# 6. BACKEND CONFIGURATION
# ============================================================================

log_section "Backend Configuration"

if [ -f "$SCRIPT_DIR/middleware/netlify-db-service/.env" ]; then
  log_success ".env file exists for backend"
  
  if grep -q "apolaki_user" "$SCRIPT_DIR/middleware/netlify-db-service/.env"; then
    log_success "Backend is configured to use apolaki_db"
  else
    log_warn "Backend .env may need updating"
  fi
else
  log_error "Backend .env not found"
fi

# ============================================================================
# 7. QUICK COMMANDS
# ============================================================================

log_section "Quick Commands"

echo ""
echo -e "${YELLOW}Start Backend:${NC}"
echo "  cd $SCRIPT_DIR/middleware/netlify-db-service"
echo "  npm run dev"
echo ""

echo -e "${YELLOW}Start Frontend:${NC}"
echo "  cd $SCRIPT_DIR/frontend"
echo "  npm run dev"
echo ""

echo -e "${YELLOW}Access Database:${NC}"
echo "  $PG_BIN/psql -h $PG_SOCKET -U apolaki_user apolaki_db"
echo ""

echo -e "${YELLOW}Stop PostgreSQL:${NC}"
echo "  pkill -f 'postgres -D'"
echo ""

# ============================================================================
# 8. TEST THE FULL STACK
# ============================================================================

log_section "Next Steps"

echo ""
echo "1. Start the backend:"
echo "   cd middleware/netlify-db-service && npm run dev"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "4. Login with:"
echo "   Email: admin@apolaki.solar"
echo "   Password: admin123"
echo ""
echo -e "${GREEN}Database setup complete! 🎉${NC}"
echo ""
