#!/bin/bash

# Verify Deployment Configuration
# Usage: ./scripts/verify-deployment.sh

set -e

echo "🔍 Verifying Deployment Configuration..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
    return 0
  else
    echo -e "${RED}✗${NC} $1 missing"
    return 1
  fi
}

check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 installed"
    return 0
  else
    echo -e "${RED}✗${NC} $1 not installed"
    return 1
  fi
}

# Check required files
echo "📁 Checking required files..."
check_file "package.json"
check_file "vite.config.ts"
check_file "tsconfig.json"
check_file ".env.example"
check_file "supabase/config.toml"
echo ""

# Check required commands
echo "🛠️  Checking required tools..."
check_command "node"
check_command "pnpm"
check_command "git"
check_command "supabase"
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node version: $NODE_VERSION"
if [[ "$NODE_VERSION" =~ ^v(1[8-9]|[2-9][0-9]) ]]; then
  echo -e "${GREEN}✓${NC} Node.js version is compatible"
else
  echo -e "${YELLOW}⚠${NC} Node.js version may be too old (need v18+)"
fi
echo ""

# Check pnpm version
echo "📦 Checking pnpm version..."
PNPM_VERSION=$(pnpm -v)
echo "   pnpm version: $PNPM_VERSION"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules exists"
else
  echo -e "${YELLOW}⚠${NC} node_modules not found. Run: pnpm install"
fi
echo ""

# Check Supabase functions
echo "🔧 Checking Supabase functions..."
FUNCTIONS=(
  "process-document"
  "save-wordlist"
  "delete-wordlist"
  "fetch-wordlists"
  "generate-practice-questions"
  "generate-questions-from-mistakes"
  "register-student-session"
  "record-practice-mistake"
  "fetch-practice-stats"
  "share-wordlist"
)

for func in "${FUNCTIONS[@]}"; do
  check_file "supabase/functions/$func/index.ts"
done
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} .env.local exists"
  
  # Check for required variables
  if grep -q "VITE_SUPABASE_URL" .env.local; then
    echo -e "${GREEN}✓${NC} VITE_SUPABASE_URL defined"
  else
    echo -e "${RED}✗${NC} VITE_SUPABASE_URL missing"
  fi
  
  if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
    echo -e "${GREEN}✓${NC} VITE_SUPABASE_ANON_KEY defined"
  else
    echo -e "${RED}✗${NC} VITE_SUPABASE_ANON_KEY missing"
  fi
else
  echo -e "${YELLOW}⚠${NC} .env.local not found (OK for production)"
fi
echo ""

# Try to build
echo "🏗️  Testing build..."
if pnpm build > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Build successful"
else
  echo -e "${RED}✗${NC} Build failed. Run 'pnpm build' to see errors"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Deployment Readiness Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps for deployment:"
echo ""
echo "1. Supabase Setup:"
echo "   - Create production project at supabase.com"
echo "   - Run migrations in SQL Editor"
echo "   - Deploy functions: ./scripts/deploy-supabase-functions.sh"
echo "   - Set secrets: ./scripts/setup-supabase-secrets.sh"
echo ""
echo "2. Vercel Setup:"
echo "   - Connect GitHub repo at vercel.com"
echo "   - Set environment variables:"
echo "     • VITE_SUPABASE_URL"
echo "     • VITE_SUPABASE_ANON_KEY"
echo "   - Deploy!"
echo ""
echo "3. Post-Deployment:"
echo "   - Test all features"
echo "   - Run performance audit"
echo "   - Configure custom domain (optional)"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
echo ""
