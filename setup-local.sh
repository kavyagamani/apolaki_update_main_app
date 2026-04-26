#!/bin/bash

# ============================================
# Apolaki Local Development Setup Script
# Sets up both frontend and backend for local testing
# ============================================

set -e  # Exit on error

echo "🌞 Apolaki Solar Platform - Local Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version:$(node --version)${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Install root dependencies
echo -e "${BLUE}📦 Installing root dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo "   Root node_modules already exists, skipping..."
else
    npm install --legacy-peer-deps
fi

# Install frontend dependencies
echo ""
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
if [ -d "node_modules" ]; then
    echo "   Frontend node_modules already exists, skipping..."
else
    npm install --legacy-peer-deps
fi
cd ..

# Install backend dependencies
echo ""
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd middleware/netlify-db-service
if [ -d "node_modules" ]; then
    echo "   Backend node_modules already exists, skipping..."
else
    npm install --legacy-peer-deps
fi
cd ../..

# Create .env file for backend if it doesn't exist
echo ""
echo -e "${BLUE}⚙️  Setting up environment variables...${NC}"

BACKEND_ENV="middleware/netlify-db-service/.env"
if [ ! -f "$BACKEND_ENV" ]; then
    cat > "$BACKEND_ENV" << 'EOF'
# Backend Configuration
NODE_ENV=development
PORT=3001
API_BASE=http://localhost:3001

# Database Configuration (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/apolaki_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-12345
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth Configuration (Development - replace with your app credentials)
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/auth/facebook/callback

INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_CALLBACK_URL=http://localhost:3001/api/auth/instagram/callback

# Viber and Telegram - Optional
VIBER_TOKEN=optional-viber-bot-token
TELEGRAM_BOT_TOKEN=optional-telegram-bot-token
TELEGRAM_CALLBACK_URL=http://localhost:3001/api/auth/telegram/callback

# Session Configuration
SESSION_SECRET=your-session-secret-change-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Features
ENABLE_OAUTH=true
ENABLE_2FA=false
EOF
    echo -e "${GREEN}✓ Created $BACKEND_ENV${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Update OAuth credentials in $BACKEND_ENV if needed${NC}"
else
    echo -e "${YELLOW}   $BACKEND_ENV already exists${NC}"
fi

# Create .env file for frontend if it doesn't exist
FRONTEND_ENV="frontend/.env"
if [ ! -f "$FRONTEND_ENV" ]; then
    cat > "$FRONTEND_ENV" << 'EOF'
VITE_API_BASE=http://localhost:3001
VITE_APP_NAME=Apolaki Solar
VITE_ENVIRONMENT=development
EOF
    echo -e "${GREEN}✓ Created $FRONTEND_ENV${NC}"
else
    echo -e "${YELLOW}   $FRONTEND_ENV already exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Local setup complete!${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo ""
echo "1. Start the backend server:"
echo -e "   ${YELLOW}cd middleware/netlify-db-service && npm run dev${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo -e "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Open in your browser:"
echo -e "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}🔐 Default Test Credentials:${NC}"
echo "   Email:    ${YELLOW}admin@apolaki.solar${NC}"
echo "   Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${BLUE}ℹ️  Endpoints:${NC}"
echo "   Frontend: ${YELLOW}http://localhost:5173${NC}"
echo "   Backend:  ${YELLOW}http://localhost:3001${NC}"
echo "   API:      ${YELLOW}http://localhost:3001/api${NC}"
echo ""
