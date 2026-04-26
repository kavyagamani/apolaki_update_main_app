#!/bin/bash

# ============================================
# Apolaki Local Development Verification
# Quick checks before running the app
# ============================================

echo "🌞 Apolaki Local Development - Verification"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check frontend dependencies
echo "Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependencies not installed${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check backend dependencies
echo "Checking backend dependencies..."
if [ -d "middleware/netlify-db-service/node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend dependencies not installed${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check backend .env
echo "Checking backend configuration..."
if [ -f "middleware/netlify-db-service/.env" ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env file missing${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check frontend .env
echo "Checking frontend configuration..."
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ Frontend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env file missing${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to run.${NC}"
    echo ""
    echo "Start the servers with:"
    echo -e "  ${BLUE}Terminal 1:${NC} cd middleware/netlify-db-service && npm run dev"
    echo -e "  ${BLUE}Terminal 2:${NC} cd frontend && npm run dev"
    echo ""
    echo "Then open: http://localhost:5173"
    exit 0
else
    echo -e "${RED}❌ $ISSUES issue(s) found${NC}"
    echo ""
    echo "Run setup first:"
    echo -e "  ${BLUE}./setup-local.sh${NC}"
    exit 1
fi
