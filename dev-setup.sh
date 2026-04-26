#!/bin/bash

# ============================================================================
# Apolaki Solar Platform - Development Setup Script
# This script sets up the entire development environment
# ============================================================================

set -e  # Exit on error

echo "🚀 Apolaki Solar Platform - Development Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm $NPM_VERSION found${NC}"

echo ""
echo "🔧 Setting up development environment..."
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp config/env/.env.dev .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
else
    echo -e "${YELLOW}⚠ .env.local already exists, skipping creation${NC}"
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose -f config/docker-compose.yml up -d
echo -e "${GREEN}✓ Docker containers started${NC}"

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if PostgreSQL is ready
echo "Checking PostgreSQL..."
for i in {1..30}; do
    if docker-compose -f config/docker-compose.yml exec -T postgres pg_isready -U apolaki_user > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    echo "⏳ Waiting for PostgreSQL... ($i/30)"
    sleep 1
done

# Check if Redis is ready
echo "Checking Redis..."
for i in {1..15}; do
    if docker-compose -f config/docker-compose.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is ready${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Redis failed to start${NC}"
        exit 1
    fi
    echo "⏳ Waiting for Redis... ($i/15)"
    sleep 1
done

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

echo ""
echo "📦 Installing middleware dependencies..."
cd middleware/netlify-db-service
npm install
echo -e "${GREEN}✓ Middleware dependencies installed${NC}"
cd ../..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Start the frontend development server:"
echo "   cd frontend && npm run dev"
echo ""
echo "2. In another terminal, start the backend:"
echo "   cd middleware/netlify-db-service && npm start"
echo ""
echo "3. Visit http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - Project Overview: README.md"
echo "   - Complete Reference: DOCUMENTATION.md"
echo "   - Setup Guide: docs/SETUP_GUIDE.md"
echo ""
echo "🔗 Service URLs:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8080/api"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - RabbitMQ: localhost:5672 (Management: http://localhost:15672)"
echo "   - Elasticsearch: http://localhost:9200"
echo ""
echo "🛑 To stop services: docker-compose -f config/docker-compose.yml down"
echo ""
