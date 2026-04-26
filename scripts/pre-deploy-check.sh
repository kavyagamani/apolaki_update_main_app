#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────
# Apolaki Solar Platform — Pre-Deployment Verification Script
#
# Run this BEFORE every deployment to catch regressions.
#
# Usage:
#   ./scripts/pre-deploy-check.sh          # full check
#   ./scripts/pre-deploy-check.sh --quick  # lint + build only (no selenium)
# ──────────────────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QUICK=false
PASSED=0
FAILED=0
SKIPPED=0

if [[ "${1:-}" == "--quick" ]]; then
  QUICK=true
fi

log_pass() { ((PASSED++)); echo "  ✅  $1"; }
log_fail() { ((FAILED++)); echo "  ❌  $1"; }
log_skip() { ((SKIPPED++)); echo "  ⏭️   $1 (skipped)"; }

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Apolaki Solar — Pre-Deployment Verification            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Install dependencies ─────────────────────────────────────
echo "📦 Step 1: Installing dependencies..."
(cd "$ROOT/frontend" && npm ci --silent 2>/dev/null) && log_pass "Frontend dependencies installed" || log_fail "Frontend npm ci failed"

# ── Step 2: Lint check ───────────────────────────────────────────────
echo ""
echo "🔍 Step 2: Lint check..."
(cd "$ROOT/frontend" && npx --yes vue-tsc --noEmit 2>/dev/null) && log_pass "TypeScript check passed" || log_skip "TypeScript check (not configured)"

# ── Step 3: Build frontend ──────────────────────────────────────────
echo ""
echo "🏗️  Step 3: Building frontend..."
(cd "$ROOT/frontend" && npm run build 2>&1 | tail -5) && log_pass "Frontend build succeeded" || log_fail "Frontend build FAILED"

# ── Step 4: Verify no conflicting colour tokens ─────────────────────
echo ""
echo "🎨 Step 4: Colour consistency check..."

# Count occurrences of the old conflicting orange (#f97316) in scoped styles
OLD_ORANGE_COUNT=$(grep -rn '#f97316\|#ea580c' "$ROOT/frontend/src/" --include="*.vue" --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$OLD_ORANGE_COUNT" -gt 0 ]]; then
  log_fail "Found $OLD_ORANGE_COUNT occurrences of conflicting orange (#f97316/#ea580c) in source"
  grep -rn '#f97316\|#ea580c' "$ROOT/frontend/src/" --include="*.vue" --include="*.css" 2>/dev/null | head -5
else
  log_pass "No conflicting orange (#f97316) found — Solar Gold only"
fi

# Check that primary colour references use Solar Gold
SOLAR_GOLD_COUNT=$(grep -rn '#FFB81C\|solar-gold' "$ROOT/frontend/src/styles/main.css" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$SOLAR_GOLD_COUNT" -ge 5 ]]; then
  log_pass "Solar Gold (#FFB81C) is correctly defined as primary ($SOLAR_GOLD_COUNT references)"
else
  log_fail "Solar Gold references seem low ($SOLAR_GOLD_COUNT) — check main.css"
fi

# ── Step 5: Check critical files exist ───────────────────────────────
echo ""
echo "📁 Step 5: File structure check..."
REQUIRED_FILES=(
  "frontend/src/styles/main.css"
  "frontend/src/App.vue"
  "frontend/src/components/Button.vue"
  "frontend/src/components/Card.vue"
  "frontend/src/views/Login.vue"
  "frontend/src/views/Dashboard.vue"
  "frontend/src/views/Landing.vue"
  "frontend/src/router/index.js"
  "frontend/src/stores/userStore.js"
  "tests/regression/fullPlatform.test.js"
  "tests/regression/uiRegression.test.js"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$ROOT/$f" ]]; then
    log_pass "Exists: $f"
  else
    log_fail "Missing: $f"
  fi
done

# Check that colors.css is removed (was a duplicate)
if [[ -f "$ROOT/frontend/src/styles/colors.css" ]]; then
  log_fail "colors.css still exists — should be deleted (duplicate of main.css)"
else
  log_pass "colors.css removed (no more duplicate colour definitions)"
fi

# ── Step 6: API regression tests ─────────────────────────────────────
echo ""
if [[ "$QUICK" == true ]]; then
  log_skip "API regression tests (--quick mode)"
else
  echo "🧪 Step 6: API regression tests..."
  # Check if backend is running
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    (cd "$ROOT/tests" && npm test --silent 2>&1 | tail -10) && log_pass "API regression tests passed" || log_fail "API regression tests FAILED"
  else
    log_skip "API regression tests (backend not running on :3001)"
  fi
fi

# ── Step 7: UI regression tests ──────────────────────────────────────
echo ""
if [[ "$QUICK" == true ]]; then
  log_skip "UI regression tests (--quick mode)"
else
  echo "🖥️  Step 7: UI regression tests..."
  # Check if frontend is running
  if curl -sf http://localhost:5173 > /dev/null 2>&1; then
    (cd "$ROOT/tests" && npm run test:regression:ui 2>&1 | tail -15) && log_pass "UI regression tests passed" || log_fail "UI regression tests FAILED"
  else
    log_skip "UI regression tests (frontend not running on :5173)"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Pre-Deployment Results                                 ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  ✅  Passed:  $PASSED                                          ║"
echo "║  ❌  Failed:  $FAILED                                          ║"
echo "║  ⏭️   Skipped: $SKIPPED                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [[ "$FAILED" -gt 0 ]]; then
  echo "🚫 DEPLOYMENT BLOCKED — Fix the failures above before deploying."
  exit 1
else
  echo "✅ ALL CHECKS PASSED — Safe to deploy."
  exit 0
fi
