#!/bin/bash

################################################################################
# APOLAKI SOLAR PLATFORM - LOCAL DEVELOPMENT SETUP
# This script sets up everything for local development and testing
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

log_header "APOLAKI SOLAR PLATFORM - LOCAL SETUP"

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================

log_header "Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed. Please install Node.js 18 or later."
  exit 1
fi
NODE_VERSION=$(node -v)
log_success "Node.js is installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
  log_error "npm is not installed."
  exit 1
fi
NPM_VERSION=$(npm -v)
log_success "npm is installed: $NPM_VERSION"

# Check Docker (optional but recommended)
if ! command -v docker &> /dev/null; then
  log_warn "Docker is not installed. You'll need Docker to run PostgreSQL locally."
else
  log_success "Docker is installed: $(docker -v)"
  
  # Check Docker daemon
  if ! docker ps &> /dev/null; then
    log_warn "Docker daemon is not running. Please start Docker Desktop."
    DOCKER_RUNNING=false
  else
    log_success "Docker daemon is running"
    DOCKER_RUNNING=true
  fi
fi

# ============================================================================
# 2. INSTALL DEPENDENCIES
# ============================================================================

log_header "Installing Dependencies"

# Backend dependencies
if [ -d "$PROJECT_ROOT/middleware/netlify-db-service" ]; then
  log_info "Installing backend dependencies..."
  cd "$PROJECT_ROOT/middleware/netlify-db-service"
  npm install
  log_success "Backend dependencies installed"
fi

# Frontend dependencies
if [ -d "$PROJECT_ROOT/frontend" ]; then
  log_info "Installing frontend dependencies..."
  cd "$PROJECT_ROOT/frontend"
  npm install
  log_success "Frontend dependencies installed"
fi

cd "$PROJECT_ROOT"

# ============================================================================
# 3. START DOCKER SERVICES (if Docker is available and running)
# ============================================================================

if [ "$DOCKER_RUNNING" = true ]; then
  log_header "Starting Docker Services"
  
  # Check if containers are already running
  if docker ps | grep -q "apolaki-postgres"; then
    log_warn "PostgreSQL container is already running"
  else
    log_info "Starting PostgreSQL container..."
    cd "$PROJECT_ROOT/config"
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
      if docker exec apolaki-postgres pg_isready -U apolaki_user &> /dev/null; then
        log_success "PostgreSQL is ready!"
        break
      fi
      if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to start within 30 seconds"
        exit 1
      fi
      sleep 1
    done
  fi
  
  cd "$PROJECT_ROOT"
else
  log_warn "Docker is not running. Skipping PostgreSQL setup."
  log_info "Please start Docker and run: docker-compose -f config/docker-compose.yml up -d postgres"
fi

# ============================================================================
# 4. VERIFY DATABASE CONNECTION
# ============================================================================

log_header "Verifying Database Connection"

if [ "$DOCKER_RUNNING" = true ]; then
  # Try to connect to database
  if command -v psql &> /dev/null; then
    log_info "Testing database connection..."
    if psql -h localhost -U apolaki_user -d apolaki_db -c "SELECT 1" &> /dev/null; then
      log_success "Database connection successful!"
    else
      log_error "Could not connect to database. Check PostgreSQL is running."
    fi
  else
    log_warn "psql not installed. Skipping database connection test."
  fi
else
  log_warn "Skipping database connection test (Docker not running)"
fi

# ============================================================================
# 5. SUMMARY & NEXT STEPS
# ============================================================================

log_header "Setup Complete! Next Steps"

echo ""
echo -e "${BLUE}To start the development servers:${NC}"
echo ""
echo -e "1. ${YELLOW}In one terminal, start the backend:${NC}"
echo -e "   cd $PROJECT_ROOT/middleware/netlify-db-service"
echo -e "   npm run dev"
echo ""
echo -e "2. ${YELLOW}In another terminal, start the frontend:${NC}"
echo -e "   cd $PROJECT_ROOT/frontend"
echo -e "   npm run dev"
echo ""
echo -e "3. ${YELLOW}Open your browser to:${NC}"
echo -e "   http://localhost:5173"
echo ""
echo -e "${BLUE}Test credentials:${NC}"
echo -e "   Email: admin@apolaki.solar"
echo -e "   Password: admin123"
echo ""
echo -e "${BLUE}Troubleshooting:${NC}"
echo -e "   • If you see CORS errors: Make sure backend is running on port 3001"
echo -e "   • If login fails: Check browser console (F12) for detailed errors"
echo -e "   • If database errors: Verify PostgreSQL is running: docker ps"
echo -e "   • To view logs: tail -f $PROJECT_ROOT/logs/*"
echo ""
log_success "Setup completed successfully! 🎉"
echo ""
