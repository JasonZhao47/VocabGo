#!/bin/bash

# Deploy all Supabase Edge Functions
# This script deploys all edge functions to your linked Supabase project

set -e

echo "🚀 Deploying all Supabase Edge Functions..."
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
echo "1. Verify functions are working: supabase functions list"
echo "2. Check function logs: supabase functions logs <function-name>"
echo "3. Test your application at: https://vocab-go.vercel.app"
