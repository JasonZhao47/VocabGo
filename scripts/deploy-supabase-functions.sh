#!/bin/bash

# Deploy all Supabase Edge Functions
# Usage: ./scripts/deploy-supabase-functions.sh

set -e

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# List of all functions
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

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
  echo "📦 Deploying $func..."
  supabase functions deploy "$func" --no-verify-jwt
  echo "✅ $func deployed"
  echo ""
done

echo "🎉 All functions deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Set secrets: supabase secrets set GLM_API_KEY=your-key"
echo "2. Test functions in Supabase Dashboard"
echo "3. Check logs: supabase functions logs <function-name>"
