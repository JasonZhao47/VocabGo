#!/bin/bash

# Test Local Edge Functions - Authorization Header Fix
# Tests health checks, auth validation, and basic functionality

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:54321/functions/v1"
SESSION_ID="test-session-$(date +%s)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Testing Local Edge Functions - Auth Header Fix      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Supabase is running
echo -e "${YELLOW}Checking Supabase status...${NC}"
if ! supabase status &> /dev/null; then
  echo -e "${RED}✗ Supabase is not running${NC}"
  echo "Please run: supabase start"
  exit 1
fi
echo -e "${GREEN}✓ Supabase is running${NC}"
echo ""

# Get local anon key
ANON_KEY=$(supabase status | grep "anon key:" | awk '{print $3}')
if [ -z "$ANON_KEY" ]; then
  echo -e "${RED}✗ Could not get anon key${NC}"
  exit 1
fi

echo "Session ID: $SESSION_ID"
echo "Anon Key: ${ANON_KEY:0:20}..."
echo "Base URL: $BASE_URL"
echo ""

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Function to run a test
run_test() {
  local test_name=$1
  local test_command=$2
  local expected_pattern=$3
  
  TOTAL=$((TOTAL + 1))
  echo -e "${YELLOW}Test $TOTAL: $test_name${NC}"
  
  RESPONSE=$(eval "$test_command" 2>&1)
  
  if echo "$RESPONSE" | grep -q "$expected_pattern"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Expected pattern: $expected_pattern"
    echo "Response: $RESPONSE"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

# Test 1: Health Check - save-wordlist
run_test "Health Check - save-wordlist" \
  "curl -s '$BASE_URL/save-wordlist'" \
  "healthy"

# Test 2: Health Check - delete-wordlist
run_test "Health Check - delete-wordlist" \
  "curl -s '$BASE_URL/delete-wordlist'" \
  "healthy"

# Test 3: Health Check - fetch-wordlists
run_test "Health Check - fetch-wordlists" \
  "curl -s '$BASE_URL/fetch-wordlists'" \
  "healthy"

# Test 4: Health Check - process-document
run_test "Health Check - process-document" \
  "curl -s '$BASE_URL/process-document'" \
  "healthy"

# Test 5: Health Check - generate-practice-questions
run_test "Health Check - generate-practice-questions" \
  "curl -s '$BASE_URL/generate-practice-questions'" \
  "healthy"

# Test 6: Missing Session ID - save-wordlist
run_test "Missing Session ID - save-wordlist" \
  "curl -s -X POST '$BASE_URL/save-wordlist' \
    -H 'Content-Type: application/json' \
    -H 'apikey: $ANON_KEY' \
    -d '{\"filename\":\"test.pdf\",\"documentType\":\"pdf\",\"words\":[{\"en\":\"test\",\"zh\":\"测试\"}]}'" \
  "UNAUTHORIZED"

# Test 7: Missing Session ID - delete-wordlist
run_test "Missing Session ID - delete-wordlist" \
  "curl -s -X POST '$BASE_URL/delete-wordlist' \
    -H 'Content-Type: application/json' \
    -H 'apikey: $ANON_KEY' \
    -d '{\"wordlistId\":\"test-id\"}'" \
  "UNAUTHORIZED"

# Test 8: Missing Session ID - fetch-wordlists
run_test "Missing Session ID - fetch-wordlists" \
  "curl -s '$BASE_URL/fetch-wordlists' \
    -H 'apikey: $ANON_KEY'" \
  "UNAUTHORIZED"

# Test 9: Valid Request - save-wordlist
run_test "Valid Request - save-wordlist" \
  "curl -s -X POST '$BASE_URL/save-wordlist' \
    -H 'Content-Type: application/json' \
    -H 'apikey: $ANON_KEY' \
    -H 'X-Session-ID: $SESSION_ID' \
    -d '{\"filename\":\"test.pdf\",\"documentType\":\"pdf\",\"words\":[{\"en\":\"hello\",\"zh\":\"你好\"},{\"en\":\"world\",\"zh\":\"世界\"}]}'" \
  "success.*true"

# Test 10: Valid Request - fetch-wordlists
run_test "Valid Request - fetch-wordlists" \
  "curl -s '$BASE_URL/fetch-wordlists' \
    -H 'apikey: $ANON_KEY' \
    -H 'X-Session-ID: $SESSION_ID'" \
  "success.*true"

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Summary                                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✓ All tests passed! Ready for deployment.            ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ✗ Some tests failed. Please review the output.       ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
