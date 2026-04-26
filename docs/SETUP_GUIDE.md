# Setup & Quick Start Guide

## Overview

This guide covers installation, configuration, and running the Apolaki Solar Platform locally or in staging/production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Database Setup](#database-setup)
6. [Configuration](#configuration)
7. [Running Locally](#running-locally)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: 2.30 or higher
- **Docker**: 20.10 or higher (optional, for containerized deployment)
- **PostgreSQL**: 14 or higher (for local database)
- **Go**: 1.19 or higher (for solar-service)

### System Requirements

- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB minimum
- **OS**: macOS, Linux, or Windows (with WSL2)

### Required Accounts

- GitHub account (for OAuth testing)
- Google account (for OAuth testing)
- Optional: Viber and Telegram accounts (for messaging OAuth)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/apolaki-updated-app.git
cd apolaki-updated-app
```

### 2. Automated Setup

Run the automated setup script:

```bash
./scripts/dev-setup-local.sh
```

This script will:
- Check prerequisites
- Install dependencies
- Set up environment files
- Initialize database
- Build Docker images (optional)

### 3. Manual Setup (Alternative)

If automated setup doesn't work:

```bash
# Install all dependencies
cd frontend && npm install && cd ..
cd middleware/netlify-db-service && npm install && cd ../..

# Create environment files
cp middleware/netlify-db-service/.env.example middleware/netlify-db-service/.env
cp frontend/.env.example frontend/.env.local

# Initialize database
psql -U postgres -f config/init-db.sql
```

---

## Frontend Setup

### Installation

```bash
cd frontend
npm install
```

### Environment Configuration

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Apolaki Solar Platform
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Get OAuth Credentials

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5173/auth/callback/google`
6. Copy Client ID to `.env.local`

#### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/auth/callback/github`
4. Copy Client ID and Secret to backend `.env`

### Development Server

```bash
cd frontend
npm run dev
```

Server runs on `http://localhost:5173`

### Available Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run type-check   # TypeScript type checking
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
```

---

## Backend Setup

### Database Service (Node.js)

#### Installation

```bash
cd middleware/netlify-db-service
npm install
```

#### Environment Configuration

Create `.env`:

```env
DATABASE_URL=postgresql://apolaki_user:password@localhost:5432/apolaki
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-here
PORT=3000
LOG_LEVEL=debug
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Start Server

```bash
cd middleware/netlify-db-service
npm start
```

Server runs on `http://localhost:3000`

#### Available Commands

```bash
npm start            # Start server
npm run dev          # Start with nodemon (auto-reload)
npm run test         # Run tests
npm run lint         # Check code quality
npm run seed         # Seed database with sample data
```

### Solar Service (Go)

#### Setup

```bash
cd middleware/solar-service
go mod download
go mod verify
```

#### Environment

Create `.env`:

```env
PORT=8080
ENV=development
DATABASE_URL=postgresql://apolaki_user:password@localhost:5432/apolaki
```

#### Start Server

```bash
cd middleware/solar-service
go run main.go
```

Server runs on `http://localhost:8080`

---

## Database Setup

### Install PostgreSQL

**macOS**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Initialize Database

#### Method 1: Automated Script

```bash
./scripts/dev-setup-local.sh
```

#### Method 2: Manual Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE apolaki;
CREATE USER apolaki_user WITH PASSWORD 'apolaki_password';
ALTER ROLE apolaki_user SET client_encoding TO 'utf8';
ALTER ROLE apolaki_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE apolaki_user SET default_transaction_deferrable TO on;
ALTER ROLE apolaki_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE apolaki TO apolaki_user;
\c apolaki
GRANT ALL ON SCHEMA public TO apolaki_user;

\q  # Exit psql
```

#### Initialize Schema

```bash
psql -U apolaki_user -d apolaki -f config/init-db.sql
```

### Verify Database

```bash
psql -U apolaki_user -d apolaki

# In psql:
\dt                 # List tables
SELECT * FROM users; # Query users table
\q                  # Exit
```

---

## Configuration

### Environment Files

Create in root directory:

**frontend/.env.local**:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-id
```

**middleware/netlify-db-service/.env**:
```env
DATABASE_URL=postgresql://apolaki_user:password@localhost:5432/apolaki
JWT_SECRET=dev-secret-key
NODE_ENV=development
```

### Environment Variables

#### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:3000 | Backend API URL |
| VITE_APP_NAME | Apolaki Solar | App name |
| VITE_GOOGLE_CLIENT_ID | - | Google OAuth Client ID |

#### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NODE_ENV | Yes | development, staging, production |
| JWT_SECRET | Yes | Secret key for JWT tokens |
| PORT | No | Server port (default: 3000) |
| GOOGLE_CLIENT_ID | No | Google OAuth credentials |
| GITHUB_CLIENT_ID | No | GitHub OAuth credentials |

### Docker Configuration

For Docker Compose setup:

```bash
docker-compose -f config/docker-compose.yml up
```

This starts:
- PostgreSQL database
- Backend API service
- Frontend dev server
- Solar service

---

## Running Locally

### Step 1: Start Database

```bash
# Ensure PostgreSQL is running
psql -U apolaki_user -d apolaki -c "SELECT 1"
```

### Step 2: Start Backend

```bash
cd middleware/netlify-db-service
npm run dev
```

Wait for: `Server running on http://localhost:3000`

### Step 3: Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Wait for: `VITE v5.0.0 ready in XXX ms`

### Step 4: Open Application

Open browser: `http://localhost:5173`

### Expected Result

- Landing page loads
- Can click "Login with Google"
- Dashboard loads after login
- Can create and view installations

---

## Testing

### Frontend Tests

```bash
cd frontend
npm run test              # Run all tests
npm run test:ui          # Interactive test UI
npm run test -- --watch  # Watch mode
```

### Backend Tests

```bash
cd middleware/netlify-db-service
npm run test
npm run test -- --watch
```

### API Testing

Use curl or Postman:

```bash
# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","first_name":"Test"}'

# Get users
curl http://localhost:3000/api/users

# Health check
curl http://localhost:3000/health
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:

1. Check PostgreSQL is running:
```bash
psql -U postgres -c "SELECT 1"
```

2. Verify database exists:
```bash
psql -U postgres -lqt | cut -d \| -f 1 | grep -w apolaki
```

3. Check user permissions:
```bash
psql -U apolaki_user -d apolaki -c "SELECT 1"
```

4. Reset database:
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS apolaki"
psql -U postgres -f config/init-db.sql
```

### Issue: Port Already in Use

**Symptoms**: `Error: listen EADDRINUSE :::3000`

**Solutions**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: Frontend Won't Load

**Symptoms**: White screen, console errors

**Solutions**:

1. Clear cache: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. Check backend API is running: `curl http://localhost:3000/health`
3. Check environment variables: `cat frontend/.env.local`
4. Restart dev server: `npm run dev`

### Issue: OAuth Login Failed

**Symptoms**: Redirect loop, 401 errors

**Solutions**:

1. Verify credentials:
   - Check `VITE_GOOGLE_CLIENT_ID` matches Google Console
   - Check redirect URI matches: `http://localhost:5173/auth/callback/google`

2. Check backend has credentials:
   - Verify `GOOGLE_CLIENT_ID` in `middleware/netlify-db-service/.env`

3. Test OAuth endpoint:
```bash
curl -X POST http://localhost:3000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"code":"your-auth-code"}'
```

### Issue: Hot Reload Not Working

**Symptoms**: Changes not reflected without manual refresh

**Solutions**:

1. Restart dev server: `npm run dev`
2. Check file is in `src/` directory
3. Verify Vite config: `vite.config.js`

### Getting Help

1. Check logs:
   - Frontend: Browser DevTools Console
   - Backend: Terminal output
   - Database: `psql` logs

2. Review error messages carefully - they usually indicate the problem

3. Check environment variables are set correctly

4. Restart all services and try again

---

## Next Steps

1. **Explore the Dashboard**: Navigate to `http://localhost:5173`
2. **Review Code**: Check `frontend/src/` and `middleware/` directories
3. **Read API Docs**: See [DOCUMENTATION.md - API Reference](DOCUMENTATION.md#api-reference)
4. **Build Features**: Use [COMPONENTS.md](COMPONENTS.md) as reference
5. **Deploy**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## Quick Commands Reference

```bash
# Local development
npm run dev              # Frontend
npm run dev              # Backend (in middleware/netlify-db-service)

# Building
npm run build            # Production build

# Testing
npm run test             # Run tests
npm run lint             # Code quality

# Database
psql -U apolaki_user -d apolaki  # Connect to DB

# Docker
docker-compose -f config/docker-compose.yml up  # Run all services

# Deployment
./scripts/deploy-prod.sh production v1.0.0  # Deploy to production
```

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0
