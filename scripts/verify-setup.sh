#!/bin/bash

# VocabGo Setup Verification Script
# This script checks if the environment is properly configured

set -e

echo "🔍 VocabGo Setup Verification"
echo "=============================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0
WARNINGS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ERRORS=$((ERRORS + 1))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Check Node.js
echo "📦 Checking Dependencies..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js installed: $NODE_VERSION"
else
    print_status 1 "Node.js not found"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_status 0 "pnpm installed: $PNPM_VERSION"
else
    print_status 1 "pnpm not found (required by package.json)"
fi

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    print_status 0 "Supabase CLI installed: $SUPABASE_VERSION"
else
    print_status 1 "Supabase CLI not found"
fi

# Check Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_status 0 "Docker is running"
    else
        print_status 1 "Docker is installed but not running"
    fi
else
    print_status 1 "Docker not found (required for local Supabase)"
fi

echo ""
echo "📝 Checking Configuration Files..."

# Check .env.local
if [ -f ".env.local" ]; then
    print_status 0 ".env.local exists"
    
    # Check for required variables
    if grep -q "VITE_SUPABASE_URL" .env.local; then
        print_status 0 "VITE_SUPABASE_URL is set"
    else
        print_status 1 "VITE_SUPABASE_URL not found in .env.local"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        print_status 0 "VITE_SUPABASE_ANON_KEY is set"
    else
        print_status 1 "VITE_SUPABASE_ANON_KEY not found in .env.local"
    fi
    
    if grep -q "GLM_API_KEY" .env.local; then
        GLM_KEY=$(grep "GLM_API_KEY" .env.local | cut -d '=' -f2)
        if [ "$GLM_KEY" != "your-glm-api-key-here" ] && [ -n "$GLM_KEY" ]; then
            print_status 0 "GLM_API_KEY is configured"
        else
            print_warning "GLM_API_KEY needs to be set to a real value"
        fi
    else
        print_warning "GLM_API_KEY not found in .env.local"
    fi
else
    print_status 1 ".env.local not found (copy from .env.local.example)"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    print_status 0 "node_modules exists"
else
    print_status 1 "node_modules not found (run: pnpm install)"
fi

echo ""
echo "🗄️  Checking Supabase Status..."

# Check if Supabase is running
if command -v supabase &> /dev/null; then
    if supabase status &> /dev/null; then
        print_status 0 "Supabase is running"
        
        # Show connection details
        echo ""
        echo "   Connection Details:"
        supabase status | grep -E "(API URL|Studio URL|anon key)" | sed 's/^/   /'
        
    else
        print_warning "Supabase is not running (run: supabase start)"
    fi
fi

echo ""
echo "🔧 Checking Edge Functions..."

# Check if Edge Functions exist
FUNCTIONS_DIR="supabase/functions"
if [ -d "$FUNCTIONS_DIR" ]; then
    print_status 0 "Edge Functions directory exists"
    
    # Check for required functions
    REQUIRED_FUNCTIONS=("process-document" "save-wordlist" "fetch-wordlists" "delete-wordlist")
    for func in "${REQUIRED_FUNCTIONS[@]}"; do
        if [ -d "$FUNCTIONS_DIR/$func" ]; then
            print_status 0 "Function '$func' exists"
        else
            print_status 1 "Function '$func' not found"
        fi
    done
else
    print_status 1 "Edge Functions directory not found"
fi

echo ""
echo "📊 Summary"
echo "=========="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "🚀 You're ready to start development:"
    echo "   1. Start dev server: pnpm dev"
    echo "   2. Open browser: http://localhost:5173"
    echo "   3. Run tests: pnpm test"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup is mostly complete with $WARNINGS warning(s)${NC}"
    echo ""
    echo "You can proceed, but consider addressing the warnings above."
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    echo ""
    echo "Quick fixes:"
    echo "  - Install dependencies: pnpm install"
    echo "  - Copy environment file: cp .env.local.example .env.local"
    echo "  - Start Supabase: cd supabase && ./setup-local.sh"
    echo "  - Set GLM API key in .env.local"
    exit 1
fi
