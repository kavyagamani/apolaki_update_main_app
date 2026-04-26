#!/usr/bin/env bash
# ============================================================================
# Apolaki Solar Platform - Local Development Startup
# Run: ./start-dev.sh
# ============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/middleware/netlify-db-service"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "╔══════════════════════════════════════════════════════╗"
echo "║   Apolaki Solar Platform - Dev Startup               ║"
echo "╚══════════════════════════════════════════════════════╝"

# ── 1. Install dependencies ──────────────────────────────────────────────
echo ""
echo "📦 Installing dependencies..."

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "  → Root..."
  (cd "$ROOT_DIR" && npm install --silent)
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "  → Frontend..."
  (cd "$FRONTEND_DIR" && npm install --silent)
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "  → Backend..."
  (cd "$BACKEND_DIR" && npm install --silent)
fi

echo "  ✅ Dependencies ready"

# ── 2. Start PostgreSQL via Docker ───────────────────────────────────────
echo ""
echo "🐘 Starting PostgreSQL..."

if command -v docker &> /dev/null; then
  CONTAINER_RUNNING=$(docker ps -q -f name=apolaki-postgres 2>/dev/null || true)

  if [ -z "$CONTAINER_RUNNING" ]; then
    # Check if container exists but stopped
    CONTAINER_EXISTS=$(docker ps -aq -f name=apolaki-postgres 2>/dev/null || true)
    if [ -n "$CONTAINER_EXISTS" ]; then
      docker start apolaki-postgres > /dev/null 2>&1
      echo "  ✅ PostgreSQL container restarted"
    else
      docker compose -f "$ROOT_DIR/config/docker-compose.yml" up -d postgres 2>/dev/null \
        || docker-compose -f "$ROOT_DIR/config/docker-compose.yml" up -d postgres 2>/dev/null \
        || echo "  ⚠️  Could not start via docker-compose. Trying standalone..."

      if ! docker ps -q -f name=apolaki-postgres > /dev/null 2>&1; then
        docker run -d \
          --name apolaki-postgres \
          -e POSTGRES_USER=apolaki_user \
          -e POSTGRES_PASSWORD=apolaki_pass \
          -e POSTGRES_DB=apolaki_db \
          -p 5432:5432 \
          -v apolaki_postgres_data:/var/lib/postgresql/data \
          postgres:15-alpine > /dev/null 2>&1
        echo "  ✅ PostgreSQL container created"
      fi
    fi

    # Wait for PostgreSQL to be ready
    echo "  ⏳ Waiting for PostgreSQL..."
    for i in {1..30}; do
      if docker exec apolaki-postgres pg_isready -U apolaki_user > /dev/null 2>&1; then
        echo "  ✅ PostgreSQL is ready"
        break
      fi
      sleep 1
    done

    # Apply schema
    echo "  📋 Applying database schema..."
    docker exec -i apolaki-postgres psql -U apolaki_user -d apolaki_db < "$ROOT_DIR/config/init-db.sql" > /dev/null 2>&1 || true
    echo "  ✅ Schema applied"
  else
    echo "  ✅ PostgreSQL already running"
  fi
else
  echo "  ⚠️  Docker not found. Please start PostgreSQL manually."
  echo "     Connection: postgresql://apolaki_user:apolaki_pass@localhost:5432/apolaki_db"

  # Check if psql is available and PostgreSQL is running locally
  if command -v psql &> /dev/null; then
    if psql -h localhost -U apolaki_user -d apolaki_db -c "SELECT 1" > /dev/null 2>&1; then
      echo "  ✅ Local PostgreSQL detected and accessible"
      psql -h localhost -U apolaki_user -d apolaki_db < "$ROOT_DIR/config/init-db.sql" > /dev/null 2>&1 || true
    fi
  fi
fi

# ── 3. Start Backend ────────────────────────────────────────────────────
echo ""
echo "🔧 Starting backend (port 3001)..."
(cd "$BACKEND_DIR" && npm run dev &) 2>&1 | sed 's/^/  [backend] /' &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# ── 4. Start Frontend ───────────────────────────────────────────────────
echo ""
echo "🎨 Starting frontend (port 5173)..."
(cd "$FRONTEND_DIR" && npm run dev &) 2>&1 | sed 's/^/  [frontend] /' &
FRONTEND_PID=$!

sleep 2

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🌞 Apolaki Solar Platform Running!                ║"
echo "║                                                      ║"
echo "║   Frontend:  http://localhost:5173                   ║"
echo "║   Backend:   http://localhost:3001                   ║"
echo "║   Health:    http://localhost:3001/health            ║"
echo "║                                                      ║"
echo "║   Press Ctrl+C to stop all services                  ║"
echo "╚══════════════════════════════════════════════════════╝"

# Handle shutdown
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo "  ✅ Services stopped (PostgreSQL still running in Docker)"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
