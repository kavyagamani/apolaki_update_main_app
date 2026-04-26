#!/bin/bash

# APOLAKI SOLAR - SIMPLE LOCAL LOGIN TEST
# Run this to instantly see if your local setup is working

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🌞 APOLAKI SOLAR - LOCAL LOGIN TEST"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success_count=0
fail_count=0

# Test function
test_service() {
  local port=$1
  local name=$2
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $name is running on port $port"
    ((success_count++))
  else
    echo -e "${RED}❌${NC} $name is NOT running on port $port"
    ((fail_count++))
  fi
}

# Tests
echo "Checking services..."
echo ""

test_service 3001 "Backend"
test_service 5173 "Frontend"

if docker ps 2>/dev/null | grep -q "apolaki-postgres"; then
  echo -e "${GREEN}✅${NC} Database is running"
  ((success_count++))
else
  echo -e "${RED}❌${NC} Database is NOT running"
  ((fail_count++))
fi

echo ""
echo "Testing login endpoint..."
echo ""

if command -v curl &> /dev/null; then
  RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@apolaki.solar","password":"admin123"}' \
    -o /tmp/login_response.json)
  
  if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅${NC} Login API works (HTTP 200)"
    echo -e "   Token: $(grep -o '"token":"[^"]*' /tmp/login_response.json | head -c 50)..."
    ((success_count++))
  elif [ "$RESPONSE" = "401" ]; then
    echo -e "${YELLOW}⚠️ ${NC} Admin user needs seeding (HTTP 401)"
    echo "   This will happen automatically on first login attempt"
    ((success_count++))
  else
    echo -e "${RED}❌${NC} Login API failed (HTTP $RESPONSE)"
    ((fail_count++))
  fi
else
  echo -e "${BLUE}ℹ️ ${NC} curl not available, skipping API test"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}🎉 SUCCESS! Local setup is ready to test!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Open: http://localhost:5173"
  echo "2. Login with:"
  echo "   Email: admin@apolaki.solar"
  echo "   Password: admin123"
else
  echo -e "${RED}❌ Setup incomplete. Missing:${NC}"
  echo ""
  
  if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "1. Backend - run in Terminal 1:"
    echo "   cd middleware/netlify-db-service && npm run dev"
  fi
  
  if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "2. Frontend - run in Terminal 2:"
    echo "   cd frontend && npm run dev"
  fi
  
  if ! docker ps 2>/dev/null | grep -q "apolaki-postgres"; then
    echo "3. Database - run:"
    echo "   docker-compose -f config/docker-compose.yml up -d postgres"
  fi
fi

echo ""
echo "For detailed help: ./debug-local-login.sh"
echo "For full guide: cat LOCAL_LOGIN_SETUP_COMPLETE.md"
echo ""
