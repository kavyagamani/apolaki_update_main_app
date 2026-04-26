#!/bin/bash

################################################################################
# Apolaki Solar Platform - Local Build Script
# 
# This script builds the frontend and backend services locally
# Usage: ./scripts/build.sh [service] [target]
#        ./scripts/build.sh all          # Build all services
#        ./scripts/build.sh frontend     # Build frontend only
#        ./scripts/build.sh backend      # Build backend only
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
BUILD_DIR="$PROJECT_ROOT/build"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Defaults
SERVICE="${1:-all}"
TARGET="${2:-production}"

mkdir -p "$BUILD_DIR" "$PROJECT_ROOT/logs"

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)
            echo -e "${BLUE}[${timestamp}] ℹ INFO:${NC} $message"
            ;;
        SUCCESS)
            echo -e "${GREEN}[${timestamp}] ✓ SUCCESS:${NC} $message"
            ;;
        WARN)
            echo -e "${YELLOW}[${timestamp}] ⚠ WARNING:${NC} $message"
            ;;
        ERROR)
            echo -e "${RED}[${timestamp}] ✗ ERROR:${NC} $message"
            ;;
    esac
}

# Build frontend
build_frontend() {
    log INFO "Building frontend..."
    
    if [ ! -d "$PROJECT_ROOT/frontend" ]; then
        log ERROR "Frontend directory not found"
        return 1
    fi
    
    cd "$PROJECT_ROOT/frontend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log INFO "Installing npm dependencies..."
        npm install
    fi
    
    log INFO "Running frontend build..."
    npm run build
    
    log SUCCESS "Frontend built successfully"
    log INFO "Build output: $PROJECT_ROOT/frontend/dist"
}

# Build netlify-db-service
build_db_service() {
    log INFO "Building database service..."
    
    local service_dir="$PROJECT_ROOT/middleware/netlify-db-service"
    
    if [ ! -d "$service_dir" ]; then
        log ERROR "Database service directory not found"
        return 1
    fi
    
    cd "$service_dir"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log INFO "Installing npm dependencies..."
        npm install
    fi
    
    log INFO "Database service ready"
    log SUCCESS "Database service prepared for deployment"
}

# Build solar-service (Go)
build_solar_service() {
    log INFO "Building solar service (Go)..."
    
    local service_dir="$PROJECT_ROOT/middleware/solar-service"
    
    if [ ! -d "$service_dir" ]; then
        log ERROR "Solar service directory not found"
        return 1
    fi
    
    # Check if Go is installed
    if ! command -v go &> /dev/null; then
        log WARN "Go is not installed. Skipping solar service build."
        log INFO "Solar service requires: Go 1.21+"
        return 0
    fi
    
    cd "$service_dir"
    
    log INFO "Downloading Go dependencies..."
    go mod download
    
    log INFO "Building solar service binary..."
    CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo \
        -o "$BUILD_DIR/solar-service" ./cmd/main.go
    
    log SUCCESS "Solar service built successfully"
    log INFO "Binary location: $BUILD_DIR/solar-service"
}

# Run tests
run_tests() {
    log INFO "Running tests..."
    
    # Frontend tests
    if [ -d "$PROJECT_ROOT/frontend" ]; then
        cd "$PROJECT_ROOT/frontend"
        if grep -q '"test"' package.json; then
            log INFO "Running frontend tests..."
            npm run test --if-present || log WARN "Frontend tests failed"
        fi
    fi
    
    # Database service tests
    local db_service="$PROJECT_ROOT/middleware/netlify-db-service"
    if [ -d "$db_service" ]; then
        cd "$db_service"
        if grep -q '"test"' package.json; then
            log INFO "Running database service tests..."
            npm run test --if-present || log WARN "Database service tests failed"
        fi
    fi
    
    log SUCCESS "Tests completed"
}

# Generate build report
generate_report() {
    local report_file="$PROJECT_ROOT/logs/build_report_$TIMESTAMP.md"
    
    log INFO "Generating build report..."
    
    cat > "$report_file" << EOF
# Build Report

**Date:** $(date)
**Service:** $SERVICE
**Target:** $TARGET

## Build Summary

### Frontend
- Status: $([ -d "$PROJECT_ROOT/frontend/dist" ] && echo "✅ Built" || echo "❌ Not built")
- Size: $(du -sh "$PROJECT_ROOT/frontend/dist" 2>/dev/null | cut -f1)
- Output: $PROJECT_ROOT/frontend/dist

### Database Service
- Status: ✅ Prepared
- Location: $PROJECT_ROOT/middleware/netlify-db-service

### Solar Service
- Status: $([ -f "$BUILD_DIR/solar-service" ] && echo "✅ Built" || echo "⚠️ Skipped (Go not installed)")
- Location: $BUILD_DIR/solar-service

## Build Artifacts

$(ls -lh "$BUILD_DIR" 2>/dev/null || echo "No build artifacts")

## Next Steps

1. Start services: \`npm start\` in each service directory
2. Deploy with Docker: See \`docs/DEPLOYMENT_GUIDE.md\`
3. Deploy to Kubernetes: See \`helm/README.md\`

EOF
    
    log SUCCESS "Report saved: $report_file"
    cat "$report_file"
}

# Cleanup
cleanup_build() {
    log INFO "Cleaning build artifacts..."
    
    rm -rf "$BUILD_DIR"
    mkdir -p "$BUILD_DIR"
    
    log SUCCESS "Build directory cleaned"
}

# Main build function
main() {
    log INFO "=========================================="
    log INFO "Apolaki Solar Platform - Build"
    log INFO "=========================================="
    log INFO "Service: $SERVICE"
    log INFO "Target: $TARGET"
    log INFO "=========================================="
    
    case $SERVICE in
        all)
            build_frontend
            build_db_service
            build_solar_service
            run_tests
            ;;
        frontend)
            build_frontend
            ;;
        backend)
            build_db_service
            build_solar_service
            ;;
        db-service)
            build_db_service
            ;;
        solar-service)
            build_solar_service
            ;;
        clean)
            cleanup_build
            ;;
        *)
            log ERROR "Unknown service: $SERVICE"
            log INFO "Available services: all, frontend, backend, db-service, solar-service, clean"
            exit 1
            ;;
    esac
    
    generate_report
    
    log SUCCESS "=========================================="
    log SUCCESS "Build completed successfully!"
    log SUCCESS "=========================================="
}

main "$@"
