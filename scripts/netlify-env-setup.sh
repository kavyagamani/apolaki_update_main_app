#!/bin/bash

# Apolaki Solar Platform - Netlify Environment Setup Script
# This script helps set environment variables on your Netlify site
# Usage: ./scripts/netlify-env-setup.sh <site-name>

set -e

SITE_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "$SITE_NAME" ]; then
  echo "❌ Error: Site name required"
  echo ""
  echo "Usage: ./scripts/netlify-env-setup.sh <site-name>"
  echo ""
  echo "Example: ./scripts/netlify-env-setup.sh apolaki-solar"
  echo ""
  echo "Get your site name from: https://app.netlify.com"
  exit 1
fi

echo "🚀 Setting up Netlify environment variables for: $SITE_NAME"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
  echo "❌ netlify-cli not found. Install with:"
  echo "   npm install -g netlify-cli"
  exit 1
fi

# Function to prompt for input with validation
prompt_input() {
  local var_name=$1
  local description=$2
  local default=$3
  local is_secret=$4

  echo -n "Enter $description"
  if [ -n "$default" ]; then
    echo -n " [$default]"
  fi
  echo ": "

  read -r value
  value=${value:-$default}

  if [ -z "$value" ]; then
    echo "❌ Error: $var_name cannot be empty"
    return 1
  fi

  echo "$var_name=$value"
}

# Create a temporary .env file with user input
TEMP_ENV=$(mktemp)
trap "rm -f $TEMP_ENV" EXIT

echo ""
echo "=== Core Configuration ==="
echo ""

# Database
echo "Database Configuration:"
echo "For Netlify Neon: Visit https://app.netlify.com → Integrations → Neon"
echo "Your NETLIFY_DATABASE_URL will be automatically set."
echo "If using self-hosted PostgreSQL, set it below."
echo ""
read -p "Enter NETLIFY_DATABASE_URL (leave blank if using Netlify Neon): " DB_URL
if [ -n "$DB_URL" ]; then
  echo "NETLIFY_DATABASE_URL=$DB_URL" >> "$TEMP_ENV"
fi

echo ""

# Security - Generate secrets
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))")
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))")

echo "Generated JWT_SECRET: $JWT_SECRET"
echo "Generated SESSION_SECRET: $SESSION_SECRET"
echo ""

echo "JWT_SECRET=$JWT_SECRET" >> "$TEMP_ENV"
echo "SESSION_SECRET=$SESSION_SECRET" >> "$TEMP_ENV"

# Node configuration
echo ""
echo "=== Application Configuration ==="
echo ""

read -p "Enter FRONTEND_URL (e.g., https://apolaki.netlify.app): " FRONTEND_URL
echo "FRONTEND_URL=$FRONTEND_URL" >> "$TEMP_ENV"

API_BASE_URL="${FRONTEND_URL}/api"
echo "API_BASE_URL will be set to: $API_BASE_URL"
echo "API_BASE_URL=$API_BASE_URL" >> "$TEMP_ENV"

CORS_ORIGINS="$FRONTEND_URL"
echo "CORS_ALLOWED_ORIGINS will be set to: $CORS_ORIGINS"
echo "CORS_ALLOWED_ORIGINS=$CORS_ORIGINS" >> "$TEMP_ENV"

# Node env
echo "NODE_ENV=production" >> "$TEMP_ENV"

echo ""
echo "=== OAuth Configuration (Optional) ==="
echo ""

read -p "Configure Google OAuth? (y/n) [n]: " GOOGLE_OAUTH
if [ "$GOOGLE_OAUTH" = "y" ]; then
  read -p "Enter GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
  read -p "Enter GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
  read -p "Enter GOOGLE_PROJECT_ID: " GOOGLE_PROJECT_ID
  
  echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> "$TEMP_ENV"
  echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> "$TEMP_ENV"
  echo "GOOGLE_CALLBACK_URL=${FRONTEND_URL}/api/auth/google/callback" >> "$TEMP_ENV"
  echo "GOOGLE_PROJECT_ID=$GOOGLE_PROJECT_ID" >> "$TEMP_ENV"
fi

echo ""

read -p "Configure Facebook OAuth? (y/n) [n]: " FACEBOOK_OAUTH
if [ "$FACEBOOK_OAUTH" = "y" ]; then
  read -p "Enter FACEBOOK_APP_ID: " FACEBOOK_APP_ID
  read -p "Enter FACEBOOK_APP_SECRET: " FACEBOOK_APP_SECRET
  
  echo "FACEBOOK_APP_ID=$FACEBOOK_APP_ID" >> "$TEMP_ENV"
  echo "FACEBOOK_APP_SECRET=$FACEBOOK_APP_SECRET" >> "$TEMP_ENV"
  echo "FACEBOOK_CALLBACK_URL=${FRONTEND_URL}/api/auth/facebook/callback" >> "$TEMP_ENV"
fi

echo ""

read -p "Configure Instagram OAuth? (y/n) [n]: " INSTAGRAM_OAUTH
if [ "$INSTAGRAM_OAUTH" = "y" ]; then
  read -p "Enter INSTAGRAM_APP_ID: " INSTAGRAM_APP_ID
  read -p "Enter INSTAGRAM_APP_SECRET: " INSTAGRAM_APP_SECRET
  
  echo "INSTAGRAM_APP_ID=$INSTAGRAM_APP_ID" >> "$TEMP_ENV"
  echo "INSTAGRAM_APP_SECRET=$INSTAGRAM_APP_SECRET" >> "$TEMP_ENV"
  echo "INSTAGRAM_CALLBACK_URL=${FRONTEND_URL}/api/auth/instagram/callback" >> "$TEMP_ENV"
fi

echo ""

# Display what will be set
echo "=== Environment Variables to Set ==="
echo ""
cat "$TEMP_ENV"
echo ""

read -p "Proceed with setting these variables? (y/n) [n]: " PROCEED
if [ "$PROCEED" != "y" ]; then
  echo "❌ Cancelled"
  exit 0
fi

echo ""
echo "🔐 Setting environment variables on Netlify..."
echo ""

# Set variables using netlify CLI
while IFS='=' read -r key value; do
  if [ -n "$key" ] && [ -n "$value" ]; then
    echo "Setting $key..."
    netlify env:set "$key" "$value" --scope all --site "$SITE_NAME" 2>/dev/null || {
      echo "⚠️  Failed to set $key. You may need to set it manually in Netlify dashboard."
    }
  fi
done < "$TEMP_ENV"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "Next steps:"
echo "1. Verify variables in Netlify dashboard: https://app.netlify.com/sites/$SITE_NAME/settings/build"
echo "2. If using Neon, ensure NETLIFY_DATABASE_URL is set"
echo "3. Update OAuth provider callback URLs to match FRONTEND_URL"
echo "4. Trigger a new build: netlify build --context production"
echo ""
