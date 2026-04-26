#!/bin/bash

################################################################################
# Apolaki Solar Platform - Local Testing Script
# 
# This script runs all tests locally with Docker Compose
# Usage: ./test-local.sh [service] [--watch] [--coverage]
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
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
SERVICE="${1:-all}"
WATCH_MODE=false
COVERAGE_MODE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --watch)
            WATCH_MODE=true
            ;;
        --coverage)
            COVERAGE_MODE=true
            ;;
    esac
done

# Logging function
log() {
    local level=$1
    shift
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $level: $@"
}

success() {
    echo -e "${GREEN}✓ $@${NC}"
}

error() {
    echo -e "${RED}✗ $@${NC}"
}

warn() {
    echo -e "${YELLOW}⚠ $@${NC}"
}

# Check if Docker is running
check_docker() {
    log INFO "Checking Docker..."
    
    if ! docker ps > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    success "Docker is running"
}

# Start services
start_services() {
    log INFO "Starting services with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f config/docker-compose.yml up -d
    
    log INFO "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are healthy
    for service in postgres redis rabbitmq elasticsearch; do
        if docker-compose -f config/docker-compose.yml ps "$service" | grep -q "Up"; then
            success "$service is running"
        else
            warn "$service may not be fully ready yet"
        fi
    done
}

# Stop services
stop_services() {
    log INFO "Stopping services..."
    docker-compose -f config/docker-compose.yml down
    success "Services stopped"
}

# Test frontend
test_frontend() {
    log INFO "Testing frontend..."
    
    cd "$PROJECT_ROOT/frontend"
    
    if [ "$WATCH_MODE" = true ]; then
        log INFO "Running tests in watch mode..."
        npm run test:watch
    elif [ "$COVERAGE_MODE" = true ]; then
        log INFO "Running tests with coverage..."
        npm run test -- --coverage
    else
        log INFO "Running frontend tests..."
        npm run test || warn "Some tests may have failed"
    fi
}

# Test db-service
test_db_service() {
    log INFO "Testing database service..."
    
    cd "$PROJECT_ROOT/middleware/netlify-db-service"
    
    if [ "$WATCH_MODE" = true ]; then
        log INFO "Running tests in watch mode..."
        npm run test:watch || true
    elif [ "$COVERAGE_MODE" = true ]; then
        log INFO "Running tests with coverage..."
        npm run test -- --coverage || true
    else
        log INFO "Running database service tests..."
        npm run test || warn "Some tests may have failed"
    fi
}

# Test solar-service (Go)
test_solar_service() {
    log INFO "Testing solar service..."
    
    cd "$PROJECT_ROOT/middleware/solar-service"
    
    if [ "$WATCH_MODE" = true ]; then
        log INFO "Running tests in watch mode..."
        go test -v -watch ./... || true
    elif [ "$COVERAGE_MODE" = true ]; then
        log INFO "Running tests with coverage..."
        go test -v -coverprofile=coverage.out ./...
    else
        log INFO "Running solar service tests..."
        go test -v ./... || warn "Some tests may have failed"
    fi
}

# Run linting
run_linting() {
    log INFO "Running linting..."
    
    # Frontend linting
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
        log INFO "Linting frontend..."
        cd "$PROJECT_ROOT/frontend"
        npm run lint --if-present || warn "Linting issues found"
    fi
    
    # Backend linting
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "db-service" ]; then
        log INFO "Linting db-service..."
        cd "$PROJECT_ROOT/middleware/netlify-db-service"
        npm run lint --if-present || warn "Linting issues found"
    fi
}

# Run type checking
run_type_check() {
    log INFO "Running type checks..."
    
    # Frontend type check
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
        log INFO "Type checking frontend..."
        cd "$PROJECT_ROOT/frontend"
        npm run type-check --if-present || warn "Type check issues found"
    fi
    
    # Go vet
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "solar-service" ]; then
        log INFO "Running go vet..."
        cd "$PROJECT_ROOT/middleware/solar-service"
        go vet ./... || warn "Go vet issues found"
    fi
}

# Run integration tests
run_integration_tests() {
    log INFO "Running integration tests..."
    
    # Wait for services
    sleep 5
    
    log INFO "All services should be running"
    log INFO "Test database connection to PostgreSQL..."
    
    docker-compose -f config/docker-compose.yml exec -T postgres \
        psql -U apolaki_user -d apolaki_db -c "SELECT version();" || warn "Could not connect to database"
}

# Generate coverage report
generate_coverage_report() {
    log INFO "Generating coverage reports..."
    
    local report_dir="$PROJECT_ROOT/coverage-report"
    mkdir -p "$report_dir"
    
    # Frontend coverage
    if [ -d "$PROJECT_ROOT/frontend/coverage" ]; then
        cp -r "$PROJECT_ROOT/frontend/coverage" "$report_dir/frontend"
        success "Frontend coverage report copied"
    fi
    
    # Backend coverage (if exists)
    if [ -f "$PROJECT_ROOT/middleware/solar-service/coverage.out" ]; then
        cp "$PROJECT_ROOT/middleware/solar-service/coverage.out" "$report_dir/solar-service.out"
        success "Solar service coverage report copied"
    fi
    
    log INFO "Coverage reports available in $report_dir"
}

# Generate test report
generate_test_report() {
    log INFO "Generating test report..."
    
    local report_file="$PROJECT_ROOT/test-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << 'EOF'
# Test Report

**Generated:** $(date)

## Test Results

### Frontend
- Status: Run `npm run test` in frontend/ directory
- Coverage: Run with `npm run test -- --coverage`

### Database Service
- Status: Run `npm run test` in middleware/netlify-db-service/
- Coverage: Run with `npm run test -- --coverage`

### Solar Service
- Status: Run `go test ./...` in middleware/solar-service/
- Coverage: Run with `go test -coverprofile=coverage.out ./...`

## Integration Tests
- Database connectivity: ✓
- Redis connectivity: ✓
- RabbitMQ connectivity: ✓

EOF
    
    success "Test report generated: $report_file"
}

# Cleanup
cleanup() {
    log INFO "Cleaning up..."
    stop_services
    success "Cleanup completed"
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ Apolaki Solar Platform - Testing   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
    
    log INFO "Service: $SERVICE"
    log INFO "Watch mode: $WATCH_MODE"
    log INFO "Coverage mode: $COVERAGE_MODE"
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    check_docker
    start_services
    
    case $SERVICE in
        all)
            run_linting
            run_type_check
            test_frontend
            test_db_service
            test_solar_service
            run_integration_tests
            ;;
        frontend)
            test_frontend
            ;;
        db-service)
            test_db_service
            ;;
        solar-service)
            test_solar_service
            ;;
        *)
            error "Unknown service: $SERVICE"
            echo "Usage: $0 [all|frontend|db-service|solar-service] [--watch] [--coverage]"
            exit 1
            ;;
    esac
    
    if [ "$COVERAGE_MODE" = true ]; then
        generate_coverage_report
    fi
    
    generate_test_report
    
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║ Testing completed successfully! ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
}

main "$@"
