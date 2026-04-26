#!/bin/bash

################################################################################
# API & Database Connection Diagnostic Tool
# Tests connectivity between API service and database
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    local level=$1
    shift
    local message="$@"
    
    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        SUCCESS)
            echo -e "${GREEN}[✓]${NC} $message"
            ;;
        WARN)
            echo -e "${YELLOW}[⚠]${NC} $message"
            ;;
        ERROR)
            echo -e "${RED}[✗]${NC} $message"
            ;;
    esac
}

echo "=================================================================================="
echo "                   API & Database Connection Diagnostic"
echo "=================================================================================="

# Check if in the right directory
if [ ! -f "middleware/netlify-db-service/src/server.js" ]; then
    log ERROR "Please run this from the project root directory"
    exit 1
fi

log INFO "Checking environment configuration..."

# Check for .env files
if [ -f "middleware/netlify-db-service/.env" ]; then
    log SUCCESS "✅ Database service .env file exists"
    
    # Check for critical variables
    source middleware/netlify-db-service/.env || true
    
    if [ -z "$NETLIFY_DATABASE_URL" ]; then
        log WARN "NETLIFY_DATABASE_URL not set in .env"
    else
        log SUCCESS "NETLIFY_DATABASE_URL is configured"
        # Mask the password
        MASKED_URL=$(echo "$NETLIFY_DATABASE_URL" | sed 's/:.*@/:***@/')
        log INFO "Database URL (masked): $MASKED_URL"
    fi
else
    log ERROR "❌ Database service .env file not found"
    log INFO "Creating .env from .env.example..."
    if [ -f "middleware/netlify-db-service/.env.example" ]; then
        cp middleware/netlify-db-service/.env.example middleware/netlify-db-service/.env
        log SUCCESS "Created .env file. Please edit with your configuration"
    fi
fi

echo ""
log INFO "Checking Node.js and npm..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log SUCCESS "Node.js $NODE_VERSION installed"
else
    log ERROR "Node.js not found"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log SUCCESS "npm $NPM_VERSION installed"
else
    log ERROR "npm not found"
    exit 1
fi

echo ""
log INFO "Checking database service dependencies..."

if [ -d "middleware/netlify-db-service/node_modules" ]; then
    log SUCCESS "Dependencies already installed"
else
    log WARN "Dependencies not installed"
    log INFO "Installing dependencies..."
    cd middleware/netlify-db-service
    npm install
    cd - > /dev/null
    log SUCCESS "Dependencies installed"
fi

echo ""
log INFO "Database Connection Test"
echo "=================================================================================="

# Check database connectivity
log INFO "Attempting to detect database configuration..."

# Get database URL from .env if available
if [ -f "middleware/netlify-db-service/.env" ]; then
    source middleware/netlify-db-service/.env 2>/dev/null || true
    
    if [ -n "$NETLIFY_DATABASE_URL" ]; then
        # Parse connection details
        if [[ "$NETLIFY_DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"
            DB_NAME="${BASH_REMATCH[5]}"
            
            log INFO "Database Details:"
            log INFO "  Host: $DB_HOST"
            log INFO "  Port: $DB_PORT"
            log INFO "  Database: $DB_NAME"
            log INFO "  User: $DB_USER"
            
            # Test connection
            log INFO "Testing database connectivity..."
            
            if command -v psql &> /dev/null; then
                if PGPASSWORD="${NETLIFY_DATABASE_URL#*://}" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
                    log SUCCESS "✅ Database connection successful!"
                else
                    log WARN "⚠️  Could not connect to database via psql (PostgreSQL client not properly configured)"
                    log INFO "This might be OK - the Node.js driver may still work"
                fi
            else
                log WARN "psql not installed - skipping direct connection test"
                log INFO "Will test via Node.js when service starts"
            fi
        else
            log WARN "Could not parse database URL"
        fi
    fi
fi

echo ""
log INFO "API Server Configuration Test"
echo "=================================================================================="

if [ -f "middleware/netlify-db-service/src/server.js" ]; then
    log SUCCESS "API server file found"
    
    # Check port configuration
    if grep -q "PORT.*3001" middleware/netlify-db-service/src/server.js; then
        log SUCCESS "API will run on port 3001"
    fi
    
    # Check database import
    if grep -q "import.*from.*db.js" middleware/netlify-db-service/src/server.js; then
        log SUCCESS "Database module imported"
    fi
    
    # Check if db.js exists
    if [ -f "middleware/netlify-db-service/src/db.js" ]; then
        log SUCCESS "Database module exists"
        
        # Check for Netlify Neon import
        if grep -q "from '@netlify/neon'" middleware/netlify-db-service/src/db.js; then
            log INFO "Using Netlify Neon database driver"
        fi
    fi
fi

echo ""
log INFO "Frontend Configuration Test"
echo "=================================================================================="

if [ -f "frontend/package.json" ]; then
    log SUCCESS "Frontend exists"
    
    # Check if axios is configured for API
    if [ -f "frontend/src/services/api.js" ] || [ -f "frontend/src/api.js" ]; then
        log SUCCESS "API service configured in frontend"
    else
        log WARN "No API service file found in frontend - may need to create one"
    fi
else
    log WARN "Frontend not found"
fi

echo ""
echo "=================================================================================="
log INFO "Recommended Next Steps:"
echo "=================================================================================="

echo ""
echo "1. START DATABASE (if using Docker):"
echo "   $ docker-compose -f config/docker-compose.yml up -d postgres"
echo ""
echo "2. INITIALIZE DATABASE:"
echo "   $ psql -U apolaki_user -h localhost -d apolaki_db < config/init-db.sql"
echo ""
echo "3. UPDATE .env FILE:"
echo "   $ nano middleware/netlify-db-service/.env"
echo "   Set NETLIFY_DATABASE_URL with your database credentials"
echo ""
echo "4. START API SERVICE:"
echo "   $ cd middleware/netlify-db-service"
echo "   $ npm start"
echo ""
echo "5. TEST CONNECTION:"
echo "   $ curl http://localhost:3001/health"
echo ""
echo "6. START FRONTEND:"
echo "   $ cd frontend && npm run dev"
echo ""

echo "=================================================================================="
log INFO "Diagnostic Complete!"
echo "=================================================================================="
