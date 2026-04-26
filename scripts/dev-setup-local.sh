#!/bin/bash

################################################################################
# Apolaki Solar Platform - Local Development Setup Script
# 
# This script sets up the local development environment with all dependencies
# Usage: ./scripts/dev-setup-local.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Logging
log() {
    local level=$1
    shift
    local message="$@"
    
    case $level in
        INFO) echo -e "${BLUE}ℹ ${message}${NC}" ;;
        SUCCESS) echo -e "${GREEN}✓ ${message}${NC}" ;;
        WARN) echo -e "${YELLOW}⚠ ${message}${NC}" ;;
        ERROR) echo -e "${RED}✗ ${message}${NC}" && exit 1 ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log INFO "Checking prerequisites..."
    
    local required_commands=("docker" "node" "npm")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log ERROR "$cmd is not installed"
        fi
    done
    
    log SUCCESS "All prerequisites found"
}

# Start Docker services
start_docker_services() {
    log INFO "Starting Docker services..."
    
    cd "$PROJECT_ROOT"
    
    if ! docker ps -q > /dev/null 2>&1; then
        log ERROR "Docker daemon is not running"
    fi
    
    docker-compose -f config/docker-compose.yml up -d
    
    log INFO "Waiting for services to be ready..."
    sleep 10
    
    # Check PostgreSQL
    if docker-compose -f config/docker-compose.yml exec -T postgres pg_isready -U apolaki_user > /dev/null 2>&1; then
        log SUCCESS "PostgreSQL is ready"
    else
        log WARN "PostgreSQL may not be fully ready yet"
    fi
    
    log SUCCESS "Docker services started"
}

# Setup environment file
setup_env_file() {
    log INFO "Setting up environment file..."
    
    if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
        log INFO "Creating .env.local from .env.example"
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env.local"
        log SUCCESS "Environment file created"
    else
        log WARN ".env.local already exists, skipping"
    fi
}

# Install frontend dependencies
install_frontend() {
    log INFO "Installing frontend dependencies..."
    
    cd "$PROJECT_ROOT/frontend"
    npm install
    
    log SUCCESS "Frontend dependencies installed"
}

# Install backend dependencies
install_backend() {
    log INFO "Installing backend/middleware dependencies..."
    
    cd "$PROJECT_ROOT/middleware/netlify-db-service"
    npm install
    
    log SUCCESS "Backend dependencies installed"
}

# Initialize database
init_database() {
    log INFO "Initializing database..."
    
    sleep 5  # Wait a bit more for PostgreSQL
    
    if docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" exec -T postgres psql -U apolaki_user -d apolaki_db -c '\l' > /dev/null 2>&1; then
        log SUCCESS "Database initialized successfully"
    else
        log WARN "Could not verify database initialization"
    fi
}

# Create necessary directories
create_directories() {
    log INFO "Creating necessary directories..."
    
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/backups"
    mkdir -p "$PROJECT_ROOT/tmp"
    
    log SUCCESS "Directories created"
}

# Main setup flow
main() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Apolaki Solar Platform - Local Development Setup         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_prerequisites
    create_directories
    setup_env_file
    start_docker_services
    init_database
    install_frontend
    install_backend
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Setup completed successfully!                             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start frontend:  cd frontend && npm run dev"
    echo "  2. Start backend:   cd middleware/netlify-db-service && npm start"
    echo "  3. View services:   docker-compose -f config/docker-compose.yml ps"
    echo "  4. View logs:       docker-compose -f config/docker-compose.yml logs -f"
    echo ""
    echo "Documentation: See DOCUMENTATION.md for guides and references"
    echo ""
}

main "$@"
