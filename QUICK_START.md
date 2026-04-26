# 🚀 Quick Start Guide - Apolaki Solar Platform

## ✅ What's Been Fixed (End-to-End Working)

- ✅ **Frontend** (Vue.js 3 + Vite) - All views and components configured
- ✅ **Backend** (Node.js + Express) - All API routes with proper error handling
- ✅ **Database** (PostgreSQL) - Schema matches backend queries
- ✅ **OAuth** - Gracefully skips when credentials not configured
- ✅ **Environment** - Proper `.env` files with sensible defaults
- ✅ **Installation** - Auto-fetch installations with proper API response unwrapping

## 🛠️ Prerequisites

```bash
# Required: Node.js 18+ and npm 8+
node --version  # v18.0.0 or higher
npm --version   # 8.0.0 or higher

# Optional but recommended: Docker for PostgreSQL
docker --version
```

## 📦 Installation

### 1. Install All Dependencies

```bash
# Install root dependencies
npm install

# Install frontend
npm --prefix frontend install

# Install backend
npm --prefix middleware/netlify-db-service install
```

Or use the automated script:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 🗄️ Database Setup

### Option A: Docker PostgreSQL (Recommended)

```bash
# Start PostgreSQL + Redis + RabbitMQ containers
docker-compose -f config/docker-compose.yml up -d

# Initialize database schema
docker-compose -f config/docker-compose.yml exec -T postgres psql -U apolaki_user -d apolaki_db -f /docker-entrypoint-initdb.d/init.sql

# Verify connection
docker-compose -f config/docker-compose.yml exec postgres pg_isready -U apolaki_user
```

### Option B: Local PostgreSQL

```bash
# Create database and user
createuser -P apolaki_user  # Password: apolaki_pass
createdb -O apolaki_user apolaki_db

# Initialize schema
psql -U apolaki_user -d apolaki_db -f config/init-db.sql

# Verify connection
psql -U apolaki_user -d apolaki_db -c "SELECT version();"
```

## 🚀 Start Development Servers

### Terminal 1: Frontend (Port 5173)
```bash
cd frontend
npm run dev
# Opens: http://localhost:5173
```

### Terminal 2: Backend (Port 3001)
```bash
cd middleware/netlify-db-service
npm run dev
# Server: http://localhost:3001
# Health: http://localhost:3001/health
```

## 🧪 Test the Application

### 1. **Sign Up**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. **Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

### 3. **Create Installation**
```bash
curl -X POST http://localhost:3001/api/installations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "YOUR_USER_ID",
    "name": "My Solar System",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "capacity": 5.5,
    "panel_count": 20,
    "inverter_type": "SMA Sunny Boy"
  }'
```

### 4. **Fetch All Installations**
```bash
curl http://localhost:3001/api/installations
```

### 5. **Browse Marketplace**
```bash
curl http://localhost:3001/api/marketplace/products
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **API Docs**: http://localhost:3001 (shows all endpoints)
- **Health Check**: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=/api
VITE_APP_NAME=Apolaki Solar Platform
```

**Backend** (`middleware/netlify-db-service/.env`):
```env
NETLIFY_DATABASE_URL=postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=dev-secret-change-in-production
```

### OAuth Configuration (Optional)

To enable OAuth logins, add credentials to backend `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

If not configured, OAuth strategies gracefully skip.

## 📁 Project Structure

```
apolaki-udpated-app/
├── frontend/              # Vue.js 3 app
│   ├── src/
│   │   ├── views/        # Page components
│   │   ├── components/   # Reusable UI components
│   │   ├── stores/       # Pinia state management
│   │   ├── services/     # API client
│   │   └── router/       # Vue Router config
│   └── package.json
│
├── middleware/
│   └── netlify-db-service/  # Node.js backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── auth/        # OAuth & auth middleware
│       │   ├── db.js        # Database client
│       │   └── server.js    # Express app
│       └── package.json
│
├── config/
│   ├── config.manager.js    # Configuration management
│   ├── init-db.sql          # Database schema
│   └── docker-compose.yml   # Docker services
│
└── docs/  # Architecture & deployment docs
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql -U apolaki_user -d apolaki_db -c "SELECT 1"

# View Docker container logs
docker-compose -f config/docker-compose.yml logs postgres

# Verify NETLIFY_DATABASE_URL in .env
echo $NETLIFY_DATABASE_URL
```

### Frontend Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check CORS origin in backend .env
# Should include: http://localhost:5173

# Verify proxy in frontend vite.config.js
```

### OAuth Errors
```bash
# Check if credentials are configured
grep GOOGLE_CLIENT_ID middleware/netlify-db-service/.env

# If not configured, OAuth gracefully skips
# Login with email/password instead
```

## 📊 Database Views

### List All Installations
```bash
psql -U apolaki_user -d apolaki_db -c "SELECT id, name, capacity, status FROM solar_installations;"
```

### List All Users
```bash
psql -U apolaki_user -d apolaki_db -c "SELECT id, email, role, created_at FROM users;"
```

### List Marketplace Products
```bash
psql -U apolaki_user -d apolaki_db -c "SELECT id, name, category, price FROM marketplace_products LIMIT 5;"
```

## 🚢 Deploy to Production

See [`DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) for:
- Building Docker images
- Deploying to Kubernetes
- Setting up CI/CD with GitHub Actions
- Database migration strategies

## 📚 Additional Documentation

- **Architecture**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **API Reference**: [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md)
- **OAuth Setup**: [`docs/OAUTH_SETUP_GUIDE.md`](docs/OAUTH_SETUP_GUIDE.md)
- **Deployment**: [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)

## 💡 Common Commands

```bash
# Development
npm run dev:all          # Start frontend + backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Database
npm run db:init          # Initialize database via Docker
npm run db:seed          # Seed with sample data

# Docker
npm run docker:up        # Start all containers
npm run docker:down      # Stop all containers
npm run docker:logs      # View container logs

# Testing
npm run test             # Run all tests
npm run lint             # Check code style

# Building
npm run build:all        # Build frontend + backend
npm run build:frontend   # Frontend build only
```

## ✨ What's Included

### Frontend Features
- ✅ Authentication (Email/Password + OAuth)
- ✅ Dashboard with KPIs and charts
- ✅ Solar installations management
- ✅ Real-time monitoring
- ✅ Marketplace with product browser
- ✅ Financial assessments
- ✅ Contract management
- ✅ Admin & operations portals

### Backend Features
- ✅ RESTful API with 50+ endpoints
- ✅ JWT authentication
- ✅ OAuth integration (Google, Facebook, Instagram, Viber, Telegram)
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Database operations for all entities
- ✅ Error handling & validation

### Database Schema
- ✅ Users & OAuth providers
- ✅ Solar installations
- ✅ Monitoring & performance data
- ✅ Maintenance logs
- ✅ Contracts
- ✅ Assessments
- ✅ Marketplace products
- ✅ Financial transactions
- ✅ Audit logs
- ✅ Break-glass sessions (emergency access)

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install && npm --prefix frontend install && npm --prefix middleware/netlify-db-service install`
2. ✅ Start PostgreSQL: `docker-compose -f config/docker-compose.yml up -d`
3. ✅ Initialize database: `docker-compose -f config/docker-compose.yml exec -T postgres psql -U apolaki_user -d apolaki_db -f /docker-entrypoint-initdb.d/init.sql`
4. ✅ Start backend: `cd middleware/netlify-db-service && npm run dev`
5. ✅ Start frontend: `cd frontend && npm run dev`
6. ✅ Open http://localhost:5173 in browser
7. ✅ Sign up or log in
8. ✅ Create your first solar installation!

## 🤝 Support

For issues or questions:
- Check the documentation in `docs/`
- Review the API documentation at http://localhost:3001
- Check logs in both frontend and backend terminals
- Verify database connection with provided test commands

---

**Last Updated**: February 26, 2026  
**Status**: ✅ End-to-End Ready
