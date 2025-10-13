#!/bin/bash

# Quick check if local Supabase is ready for testing

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Checking local Supabase setup..."
echo ""

# Check 1: Supabase CLI installed
if command -v supabase &> /dev/null; then
  echo -e "${GREEN}✓${NC} Supabase CLI installed"
else
  echo -e "${RED}✗${NC} Supabase CLI not installed"
  echo "  Install: brew install supabase/tap/supabase"
  exit 1
fi

# Check 2: Supabase running
if supabase status &> /dev/null; then
  echo -e "${GREEN}✓${NC} Supabase is running"
  
  # Get details
  API_URL=$(supabase status | grep "API URL:" | awk '{print $3}')
  STUDIO_URL=$(supabase status | grep "Studio URL:" | awk '{print $3}')
  
  echo "  API URL: $API_URL"
  echo "  Studio URL: $STUDIO_URL"
else
  echo -e "${YELLOW}⚠${NC} Supabase is not running"
  echo "  Start with: supabase start"
  exit 1
fi

# Check 3: Functions directory exists
if [ -d "supabase/functions" ]; then
  echo -e "${GREEN}✓${NC} Functions directory exists"
  
  # Count functions
  FUNC_COUNT=$(ls -d supabase/functions/*/ 2>/dev/null | wc -l | tr -d ' ')
  echo "  Found $FUNC_COUNT functions"
else
  echo -e "${RED}✗${NC} Functions directory not found"
  exit 1
fi

# Check 4: Auth utility exists
if [ -f "supabase/functions/_shared/auth.ts" ]; then
  echo -e "${GREEN}✓${NC} Auth utility exists"
else
  echo -e "${RED}✗${NC} Auth utility not found"
  echo "  Expected: supabase/functions/_shared/auth.ts"
  exit 1
fi

# Check 5: Test if functions server is accessible
echo ""
echo "Testing functions server..."

if curl -s http://localhost:54321/functions/v1/save-wordlist &> /dev/null; then
  RESPONSE=$(curl -s http://localhost:54321/functions/v1/save-wordlist)
  if echo "$RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Functions server is running and healthy"
  else
    echo -e "${YELLOW}⚠${NC} Functions server responding but not healthy"
    echo "  Response: $RESPONSE"
  fi
else
  echo -e "${YELLOW}⚠${NC} Functions server not accessible"
  echo "  Start with: supabase functions serve"
  echo ""
  echo "Run this in a separate terminal:"
  echo "  supabase functions serve"
  exit 1
fi

# All checks passed
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Local setup is ready for testing!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Run tests: ./scripts/test-local-edge-functions.sh"
echo "  2. Watch logs: supabase functions logs --follow"
echo "  3. Start frontend: pnpm dev"
