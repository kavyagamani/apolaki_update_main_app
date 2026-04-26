#!/bin/bash

# ============================================================================
# Apolaki Solar Platform - Quick Start Script
# This script sets up and runs the entire application end-to-end (development)
# ============================================================================

set -e  # Exit on error

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/middleware/netlify-db-service"
CONFIG_DIR="$PROJECT_DIR/config"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm found: $NPM_VERSION"

# Check Docker (optional but recommended)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v)
    print_success "Docker found: $DOCKER_VERSION"
    HAS_DOCKER=true
else
    print_warning "Docker not found - Database will need to be running separately"
    HAS_DOCKER=false
fi

# Setup environment variables
print_header "Setting Up Environment Variables"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    print_error ".env file not found in project root. Copy .env.example to .env and customize."
    exit 1
fi
print_success ".env file exists"

# Install root dependencies
print_header "Installing Root Dependencies"

cd "$PROJECT_DIR"
npm ci --ignore-scripts || npm install --legacy-peer-deps
print_success "Root dependencies installed"

# Install frontend dependencies
print_header "Installing Frontend Dependencies"

cd "$FRONTEND_DIR"
npm ci --ignore-scripts || npm install --legacy-peer-deps
print_success "Frontend dependencies installed"

# Install backend dependencies
print_header "Installing Backend Dependencies"

cd "$BACKEND_DIR"
npm ci --ignore-scripts || npm install --legacy-peer-deps
print_success "Backend dependencies installed"

# Setup database
print_header "Setting Up Database"

if [ "$HAS_DOCKER" = true ]; then
    cd "$PROJECT_DIR"
    print_info "Starting PostgreSQL and Redis containers..."
    docker-compose -f "$CONFIG_DIR/docker-compose.yml" up -d postgres redis
    
    print_info "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Check if container is healthy
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f "$CONFIG_DIR/docker-compose.yml" exec -T postgres pg_isready -U apolaki_user &> /dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            print_error "PostgreSQL failed to start within timeout"
            exit 1
        fi
        sleep 1
    done
    
    print_info "Initializing database schema (if not already initialized)..."
    docker-compose -f "$CONFIG_DIR/docker-compose.yml" exec -T postgres psql -U apolaki_user -d apolaki_db -f /docker-entrypoint-initdb.d/init.sql 2>/dev/null || true
    print_success "Database initialized"
else
    print_warning "Skipping Docker database setup - please ensure PostgreSQL is running on localhost:5432 and credentials match .env"
fi

# Instructions to run services
print_header "Setup Complete!"

print_success "All components installed and configured"

print_info "To run the application locally, open two terminals and run the following commands:"

echo -e "  ${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd $BACKEND_DIR && npm run dev"
echo ""
echo -e "  ${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd $FRONTEND_DIR && npm run dev"

echo ""
print_info "Frontend will be available at http://localhost:5173"
print_info "Backend API will be available at http://localhost:3001 (or PORT as set in .env)"

print_info "If you need to stop Docker containers run:"
echo "  docker-compose -f $CONFIG_DIR/docker-compose.yml down"

print_success "Happy hacking!"
