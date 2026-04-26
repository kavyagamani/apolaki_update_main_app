#!/bin/bash

# Apolaki Solar Platform - Development Server Startup Script

echo "======================================"
echo "  Apolaki Solar Platform"
echo "  Development Environment Startup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >=18.0.0"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd middleware/netlify-db-service

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your Netlify DB credentials${NC}"
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend setup
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
EOF
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

echo "======================================"
echo "  Ready to start!"
echo "======================================"
echo ""
echo -e "${YELLOW}To start the development servers:${NC}"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd middleware/netlify-db-service"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:3001"
echo ""
echo -e "${GREEN}Happy coding! ☀️${NC}"
