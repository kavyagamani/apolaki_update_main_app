# Apolaki Solar Platform — Complete System Documentation

**Version**: 2.0  
**Status**: Production-Ready  
**Last Updated**: February 26, 2026  
**Authoritative Source**: Use this file as your single reference

---

## Quick Navigation

**👤 Getting Started?**
- [System Overview](#overview)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)

**💻 Building Code?**
- [Development Setup](#development-setup)
- [Technology Stack](#technology-stack)
- [Code Guidelines → AGENTS.md](AGENTS.md)

**🚀 Deploying?**
- [Deployment Architecture](#deployment-architecture)
- [Configuration Management](#configuration-management)
- [Environment Variables](#environment-variables)

**🔐 Setting Up Security?**
- [Authentication](#authentication)
- [OWASP Compliance → AGENTS.md](AGENTS.md)

**📊 Monitoring?**
- [Logging & Monitoring](#logging-monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What is Apolaki?

Apolaki is an enterprise-grade **Solar Energy Management Platform** with:
- Real-time monitoring of solar installations
- Financial assessment & ROI calculations
- Digital marketplace for solar products
- Contract management & e-signatures
- Multi-provider OAuth authentication

### Architecture Pattern

**Three-Tier Separate Deployables**:
1. **Frontend** (Vue.js 3) - Independent deployable to CDN/Netlify/Vercel
2. **Backend** (Node.js + Go) - Independent deployable to FaaS/Docker/Kubernetes
3. **Data** (PostgreSQL + Redis) - External services with runtime configuration

**Key Feature**: Same backend container code runs in dev/staging/production with different configuration (ConfigManager pattern).

---

## Prerequisites

### System Requirements
- macOS 13+, Linux (Ubuntu 20+), or Windows 10+ with WSL2
- 8GB RAM minimum, 16GB recommended
- 10GB disk space

### Required Software
- **Node.js**: 18+ (https://nodejs.org/)
- **PostgreSQL**: 15+ (https://www.postgresql.org/download/)
- **Git**: Latest version
- **Docker** (optional but recommended)

### Optional Tools
- VS Code with Vue, JavaScript, Go extensions
- Postman/Insomnia for API testing

---

## Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd apolaki-updated-app

# 2. Install all dependencies
npm install

# 3. Set environment variables
cp config/env/.env.example .env.local
# Edit .env.local with your PostgreSQL credentials

# 4. Initialize database
npm run db:reset
npm run db:migrate

# 5. Start everything
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## Technology Stack

### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State**: Pinia
- **Styling**: Tailwind CSS
- **HTTP**: Axios
- **Real-time**: WebSocket

### Backend
- **Database Service**: Node.js + Express
- **Solar Service**: Go 1.21+
- **Database**: PostgreSQL 15+
- **Cache**: Redis (optional)
- **Auth**: JWT + Passport.js
- **Testing**: Jest (Node), Testify (Go)

### Infrastructure
- **Containers**: Docker & Docker Compose
- **Orchestration**: Kubernetes + Helm
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (optional)

---

## Project Structure

```
apolaki-updated-app/
├── README.md                       Main entry point
├── DOCUMENTATION.md               THIS FILE (single source of truth)
├── AGENTS.md                      AI agent operating guidelines
├── CONSTITUTION.md                Governance & principles
├── CONTRIBUTING.md                Contribution process
│
├── frontend/                      Vue.js 3 (Independent Build)
│   ├── src/
│   │   ├── components/           UI components
│   │   ├── pages/                Page components
│   │   ├── stores/               Pinia state
│   │   ├── services/             API client
│   │   ├── composables/          Reusable logic
│   │   └── styles/               Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── middleware/                    Backend Services (Independent Build)
│   ├── netlify-db-service/        Node.js Database & Auth Service
│   │   ├── src/
│   │   │   ├── routes/           HTTP endpoints
│   │   │   ├── services/         Business logic
│   │   │   ├── models/           Database models
│   │   │   ├── middleware/       Express middleware
│   │   │   └── config/           ConfigManager
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── solar-service/             Go Microservice
│       ├── cmd/                   Entry point
│       ├── internal/              Internal packages
│       └── Dockerfile
│
├── config/                        Configuration
│   ├── config.manager.js          Loads env variables at startup
│   ├── docker-compose.yml         Local development
│   ├── init-db.sql                Database schema
│   └── env/
│       └── .env.example           Template
│
├── docs/                          Reference Documentation
│   ├── ARCHITECTURE.md            System design details
│   ├── API_REFERENCE.md           REST endpoints
│   ├── CI_CD_PIPELINE.md          GitHub Actions
│   ├── COMPONENTS.md              UI components library
│   ├── DEPLOYMENT_GUIDE.md        Production deployment procedures
│   ├── MONITORING_LOGGING.md      Observability & logging
│   ├── OAUTH_SETUP_GUIDE.md       OAuth provider configuration
│   ├── SETUP_GUIDE.md             Detailed local setup
│   ├── VIBER_TELEGRAM_SETUP_GUIDE.md  Bot integration
│   ├── PRODUCTION_RUNBOOK.md      Emergency procedures
│   └── MVP.PRD.md, PHASE*.PRD.md  Product roadmap
│
├── tests/                         Test Suite
├── seeds/                         Database Seeders
├── scripts/                       Automation Scripts
├── helm/                          Kubernetes Charts
└── netlify.toml                   Netlify Config
```

---

## Development Setup

### Step 1: Clone & Install

```bash
git clone <repo-url>
cd apolaki-updated-app
npm install
```

### Step 2: Environment Configuration

```bash
# Copy template
cp config/env/.env.example .env.local

# Edit with your database credentials
vim .env.local

# Minimum required:
# DATABASE_URL=postgresql://user:password@localhost:5432/apolaki
# JWT_SECRET=random-secret-min-32-chars
# NODE_ENV=development
# VITE_API_URL=http://localhost:3000
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
createdb apolaki

# Initialize schema
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### Step 4: Start Development

```bash
# All at once
npm run dev

# Or individually (separate terminals):
cd frontend && npm run dev                    # Port 5173
cd middleware/netlify-db-service && npm run dev  # Port 3000
```

### Step 5: Verify

```bash
# Frontend
curl http://localhost:5173

# Backend
curl http://localhost:3000/health

# Database
psql apolaki -c "SELECT COUNT(*) FROM users"
```

### Available Commands

**Frontend**:
```bash
npm run dev              # Vite dev server
npm run build            # Production build
npm run preview          # Preview build
npm run test             # Unit tests
npm run lint             # Code linting
```

**Backend**:
```bash
npm run dev              # Start with hot reload
npm run start            # Production start
npm run test             # Tests
npm run lint             # Linting
```

**Database**:
```bash
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:reset         # Reset (development only!)
```

**All**:
```bash
npm run build:all        # Build frontend + backend
npm run test:all         # Test all
npm run lint:all         # Lint all
```

---

## Deployment Architecture

### Separate Deployables Pattern

**Benefit**: Frontend and backend can be deployed independently without coordination.

#### Frontend Deployable

```
INPUT:  frontend/ directory
BUILD:  npm run build → frontend/dist/
OUTPUT: HTML, CSS, JavaScript static files
DEPLOY: Upload to CDN or Netlify Static
HOSTS:  Netlify, Vercel, AWS S3, GitHub Pages
TIME:   ~30 seconds
```

**Example Deployment**:
```bash
cd frontend
npm install
npm run build
netlify deploy --prod --dir dist/
```

#### Backend Deployable

```
INPUT:  middleware/ directory
BUILD:  Docker build or npm build
OUTPUT: Docker image or compiled binaries
DEPLOY: Push to registry, deploy to FaaS/Docker/K8s
HOSTS:  Netlify Functions, Heroku, Railway, AWS Lambda
TIME:   ~2 minutes
```

**Example Deployment**:
```bash
cd middleware/netlify-db-service
npm install
docker build -t apolaki-backend .
docker push my-registry/apolaki-backend:latest
```

#### Data Layer (External Services)

```
Components: PostgreSQL, Redis, Message Queue, S3
Location:   External (Netlify Neon, AWS RDS, etc.)
Config:     Injected at container startup
Benefit:    Same image, different config per environment
```

### Deployment Scenarios

#### Scenario 1: Netlify (MVP)

```
                Netlify
        ┌───────────────────┐
        │ Frontend CDN      │
        │ (frontend/dist)   │
        └────────┬──────────┘
                 │
            ┌────┴─────┐
            │           │
        ┌───▼──┐   ┌────▼────┐
        │Backend │   │ Neon DB │
        │Funcs   │   │(Postgres)
        └────────┘   └─────────┘
```

**Deploy**: `git push origin main` (automatic Netlify deploy)

#### Scenario 2: Frontend on Netlify, Backend on Heroku

```
Netlify CDN ─────┐
                 │
            ┌────┴────────┐
            │             │
        Frontend      Heroku API
            │             │
            └──────┬──────┘
                   │
               AWS RDS
            (PostgreSQL)
```

#### Scenario 3: Kubernetes (Enterprise)

```
         ┌─── Kubernetes Cluster ───┐
         │                          │
    ┌────▼────┐          ┌─────────▼──┐
    │ Frontend │          │ API Pods   │
    │ Service  │─────────→│ (replicas) │
    └──────────┘          └─────────┬──┘
                                    │
                            ┌───────▼──────┐
                            │ Cloud SQL    │
                            │ (Postgres)   │
                            └──────────────┘
```

**Deploy**: `helm install apolaki ./helm -f helm/values-production.yaml`

---

## Configuration Management

### The Problem

Hardcoding database URLs, API keys, and secrets in code makes it impossible to use the same codebase in development, staging, and production.

### The Solution: ConfigManager

All configuration is loaded from environment variables at application startup, **not** from code.

### How It Works

```javascript
// config/config.manager.js
class ConfigManager {
  static async load() {
    const config = {
      database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        name: process.env.DATABASE_NAME,
      },
      jwt: {
        secret: process.env.JWT_SECRET,
      },
      // ... more config
    };

    // Validate all required config is present
    if (!config.database.host) {
      throw new Error('DATABASE_HOST environment variable is required');
    }
    // ... more validation

    return config;
  }
}

// At startup
async function start() {
  const config = await ConfigManager.load();
  // Pass config to all services
  startServer(config);
}
```

### Zero Hardcoding Rule

**❌ WRONG** (hardcoded):
```javascript
const DB_HOST = "localhost";
const JWT_SECRET = "my-secret-key";  // NEVER!
```

**❌ WRONG** (fallback to hardcoded):
```javascript
const host = process.env.DATABASE_HOST || "localhost";
// This is still hardcoding!
```

**✅ CORRECT** (fail if missing):
```javascript
const host = process.env.DATABASE_HOST;
if (!host) throw new Error('DATABASE_HOST is required');
```

### Same Code, Different Config

```bash
# Development (.env.local)
DATABASE_HOST=localhost
DATABASE_PASSWORD=dev-password
NODE_ENV=development

# Production (Netlify Dashboard env vars)
DATABASE_HOST=neon-production.com
DATABASE_PASSWORD=<secure-production-password>
NODE_ENV=production

# Same Docker image, different behavior!
docker run -e DATABASE_HOST=localhost app:latest     # Development
docker run -e DATABASE_HOST=prod.db app:latest       # Production
```

---

## Environment Variables

### Frontend

**Build-time variables** (in `.env` or `.env.local`):

```bash
# API Endpoint
VITE_API_URL=http://localhost:3000              # Development
VITE_API_URL=https://api.apolaki.com            # Production

# Feature Flags (optional)
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_BETA_FEATURES=false

# OAuth Providers (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

**Note**: Build-time variables are baked into the bundle. API URL can alternatively be set at deploy time via netlify.toml.

### Backend

**Runtime variables** (in `.env.local` for development OR Netlify Dashboard for production):

```bash
# === DATABASE (REQUIRED) ===
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=apolaki

# OR use connection string (recommended for production)
DATABASE_URL=postgresql://user:pass@host:5432/apolaki

# === SERVER ===
NODE_ENV=development              # or production
API_PORT=3000
API_TIMEOUT=30000

# === SECURITY (GENERATED) ===
JWT_SECRET=<random-32-char-string>
BCRYPT_COST=12
SESSION_SECRET=<another-random-string>

# === CORS ===
CORS_ORIGINS=http://localhost:5173,https://apolaki.com

# === CACHE (OPTIONAL) ===
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600

# === OAuth PROVIDERS ===
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=yyy
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=yyy

# === LOGGING ===
LOG_LEVEL=debug                   # development
LOG_LEVEL=info                    # production
LOG_FORMAT=json                   # structured logging
```

### Generating Secure Values

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Setting Variables by Platform

**Development** (local):
```bash
cp config/env/.env.example .env.local
vim .env.local
```

**Netlify** (production):
1. Go to Netlify Dashboard
2. Site Settings → Build & Deploy → Environment
3. Add each variable (secured)
4. No .env file needed

**Heroku**:
```bash
heroku config:set DATABASE_URL="..." JWT_SECRET="..." --app myapp
```

**Kubernetes**:
```bash
kubectl create secret generic apolaki-config \
  --from-literal=DATABASE_URL="..." \
  --from-literal=JWT_SECRET="..." \
  -n apolaki
```

---

## Authentication

### Supported Methods

#### 1. Email/Password
- Registration with email validation
- Login with password
- Password reset
- Bcrypt hashing (cost 12)

#### 2. OAuth2 Multi-Provider
- Google OAuth
- Facebook OAuth
- Instagram OAuth
- GitHub OAuth (extensible)

#### 3. Session Management
- JWT access tokens (15 minutes)
- Refresh tokens (7 days)
- HttpOnly, Secure, SameSite cookies
- Automatic token refresh

#### 4. Authorization (RBAC)
- Roles: admin, manager, viewer, provider
- Per-endpoint permission checks
- Resource-level access control

### OAuth Setup Quick Guide

**Google OAuth**:

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable OAuth 2.0 APIs
4. Create OAuth credentials (Web application)
5. Set callback: `https://yourdomain.com/api/auth/google/callback`
6. Copy Client ID and Secret
7. Add to environment:
   ```bash
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=yyy
   ```

**Facebook OAuth**: Similar process at https://developers.facebook.com/

**Full OAuth Guide**: See `docs/OAUTH_SETUP_GUIDE.md`

---

## Logging & Monitoring

### Structured Logging

All logs are in JSON format for easy parsing:

```javascript
logger.info('User login', {
  userId: '123',
  provider: 'google',
  timestamp: new Date().toISOString(),
  correlationId: 'req-abc123'
});

// Output:
// {"level":"info","message":"User login","userId":"123",...}
```

### Log Levels

- **debug**: Development details (verbose)
- **info**: Important events (logins, API calls)
- **warn**: Potential issues (slow queries)
- **error**: Errors (not fatal)
- **fatal**: Critical errors (requires restart)

### Monitoring Tools

- **Logs**: Netlify Logs, CloudWatch, or ELK Stack
- **Metrics**: Prometheus + Grafana
- **APM**: DataDog or New Relic

### Health Checks

```bash
# Application health
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"..."}

# Database connectivity
curl http://localhost:3000/health/db
# Response: {"status":"healthy","latency":5}
```

---

## Database

### Schema (Quick Overview)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Installations
CREATE TABLE installations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  capacity_kw DECIMAL(10,2),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Monitoring Data
CREATE TABLE monitoring_data (
  id UUID PRIMARY KEY,
  installation_id UUID REFERENCES installations(id),
  power_output DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- (See config/init-db.sql for complete schema)
```

### Migrations

```bash
# Create migration
npm run db:migration:create -- add_users_table

# Run all pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Reset (development only!)
npm run db:reset
```

### Security

- ✅ Parameterized queries (GORM/pg-promise)
- ✅ Bcrypt password hashing (cost 12)
- ✅ Foreign key constraints
- ✅ Audit logging
- ✅ Encrypted PII columns
- ✅ Regular backups

---

## API Reference

### Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://api.apolaki.com`

### Authentication

All endpoints (except login/register) require JWT in header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Key Endpoints

**Authentication**:
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login with email/password
GET    /api/auth/oauth/:provider   OAuth login initiation
POST   /api/auth/refresh           Refresh access token
POST   /api/auth/logout            Logout
```

**Installations**:
```
GET    /api/installations          List user's installations
POST   /api/installations          Create new installation
GET    /api/installations/:id      Get installation details
PUT    /api/installations/:id      Update installation
DELETE /api/installations/:id      Delete installation
```

**Monitoring**:
```
GET    /api/monitoring/:id/current  Get latest data
GET    /api/monitoring/:id/range    Get data range
WS     /ws/monitoring/:id          WebSocket real-time
```

**Marketplace**:
```
GET    /api/marketplace/products   List products
GET    /api/marketplace/providers  List providers
```

**Assessment**:
```
POST   /api/assessment/calculate   Calculate ROI
```

**Contracts**:
```
GET    /api/contracts             List contracts
GET    /api/contracts/:id         Get contract
POST   /api/contracts/:id/sign    Sign contract
```

### Error Responses

All errors return consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "correlationId": "req-abc123"
}
```

**Status Codes**:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 500: Server error

---

## Deployment Checklist

### Before Deploy

- [ ] All tests pass: `npm run test:all`
- [ ] Linting passes: `npm run lint:all`
- [ ] No hardcoded secrets in code
- [ ] Database migrations created
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Security review completed

### During Deploy

- [ ] Backup production database
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Verify monitoring is working
- [ ] Deploy to production
- [ ] Monitor logs & metrics

### After Deploy

- [ ] Monitor for 24+ hours
- [ ] Check error rates
- [ ] Verify core workflows
- [ ] Be ready to rollback

---

## Troubleshooting

### Database Connection Failed

**Error**: `Error: getaddrinfo ENOTFOUND postgres`

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   pg_isready -h localhost
   ```

2. Check credentials in `.env.local`:
   ```bash
   DATABASE_HOST=localhost
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   ```

3. Verify database exists:
   ```bash
   psql -l | grep apolaki
   ```

### Port Already in Use

**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**:
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
API_PORT=3001 npm run dev
```

### Frontend API Connection Refused

**Error**: `Failed to fetch from http://localhost:3000`

**Solutions**:
1. Check backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check CORS is configured:
   ```bash
   # In .env.local
   CORS_ORIGINS=http://localhost:5173
   ```

3. Check API URL in frontend:
   ```bash
   # In .env.local
   VITE_API_URL=http://localhost:3000
   ```

### Module Not Found

**Error**: `Cannot find module 'X'`

**Solutions**:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Check file exists (case-sensitive):
   ```bash
   ls -la path/to/file
   ```

3. Verify import path:
   ```javascript
   // Correct
   import Button from '@/components/Button.vue'
   // Wrong (case-sensitive)
   import Button from '@/components/button.vue'
   ```

### "JWT Token Expired"

**Solution**: Refresh token or re-login

**In frontend**:
```javascript
// Auto refresh in api client
if (error.status === 401) {
  await refreshToken();
  return retryRequest();
}
```

---

## Code Guidelines

**All code must comply with**:

1. **SOLID Principles**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
2. **Tier Separation**: Frontend → Backend → Database (NO direct frontend → database)
3. **OWASP Security**: Input validation, parameterized queries, secure auth, encryption
4. **Code Quality**: Tests, linting, documentation, proper error handling

**Full Guidelines**: See `AGENTS.md`

---

## Resources

### Documentation
- `DOCUMENTATION.md` — **THIS FILE** (system reference)
- `docs/SETUP_GUIDE.md` — Installation & local setup
- `docs/DEPLOYMENT_GUIDE.md` — Production deployment
- `AGENTS.md` — Code guidelines & standards
- `docs/ARCHITECTURE.md` — Detailed system design
- `docs/API_REFERENCE.md` — API endpoints
- `docs/COMPONENTS.md` — UI components
- `docs/OAUTH_SETUP_GUIDE.md` — OAuth setup

### External Resources
- Vue.js: https://vuejs.org/
- Express.js: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Docker: https://docs.docker.com/
- Kubernetes: https://kubernetes.io/docs/

### Support
- **Issues**: GitHub Issues (with labels: bug, feature, question)
- **Discussions**: GitHub Discussions
- **Email**: (team contact if applicable)

---

**Maintained By**: Apolaki Team  
**License**: MIT  
**Last Updated**: February 26, 2026
