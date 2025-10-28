#!/bin/bash

# Setup Supabase Secrets for Production
# Usage: ./scripts/setup-supabase-secrets.sh

set -e

echo "🔐 Setting up Supabase Secrets..."
echo ""
echo "This script will prompt you for required secrets."
echo "Press Ctrl+C to cancel at any time."
echo ""

# Required secrets
echo "📝 Required: GLM API Configuration"
read -p "Enter GLM_API_KEY: " GLM_API_KEY
read -p "Enter GLM_API_URL [https://open.bigmodel.cn/api/paas/v4/chat/completions]: " GLM_API_URL
GLM_API_URL=${GLM_API_URL:-https://open.bigmodel.cn/api/paas/v4/chat/completions}
read -p "Enter GLM_MODEL [glm-4-flash]: " GLM_MODEL
GLM_MODEL=${GLM_MODEL:-glm-4-flash}

echo ""
echo "Setting required secrets..."
supabase secrets set GLM_API_KEY="$GLM_API_KEY"
supabase secrets set GLM_API_URL="$GLM_API_URL"
supabase secrets set GLM_MODEL="$GLM_MODEL"

echo ""
read -p "Do you want to set optional GLM configuration? (y/N): " SET_OPTIONAL
if [[ "$SET_OPTIONAL" =~ ^[Yy]$ ]]; then
  read -p "Enter GLM_MAX_TOKENS [2000]: " GLM_MAX_TOKENS
  GLM_MAX_TOKENS=${GLM_MAX_TOKENS:-2000}
  read -p "Enter GLM_TEMPERATURE [0.7]: " GLM_TEMPERATURE
  GLM_TEMPERATURE=${GLM_TEMPERATURE:-0.7}
  read -p "Enter GLM_TIMEOUT_MS [30000]: " GLM_TIMEOUT_MS
  GLM_TIMEOUT_MS=${GLM_TIMEOUT_MS:-30000}
  read -p "Enter GLM_MAX_RETRIES [3]: " GLM_MAX_RETRIES
  GLM_MAX_RETRIES=${GLM_MAX_RETRIES:-3}
  
  echo ""
  echo "Setting optional GLM configuration..."
  supabase secrets set GLM_MAX_TOKENS="$GLM_MAX_TOKENS"
  supabase secrets set GLM_TEMPERATURE="$GLM_TEMPERATURE"
  supabase secrets set GLM_TIMEOUT_MS="$GLM_TIMEOUT_MS"
  supabase secrets set GLM_MAX_RETRIES="$GLM_MAX_RETRIES"
fi

echo ""
read -p "Do you want to set chunking configuration? (y/N): " SET_CHUNKING
if [[ "$SET_CHUNKING" =~ ^[Yy]$ ]]; then
  read -p "Enable chunking? [true]: " ENABLE_CHUNKING
  ENABLE_CHUNKING=${ENABLE_CHUNKING:-true}
  read -p "Enter CHUNK_TARGET_SIZE [8000]: " CHUNK_TARGET_SIZE
  CHUNK_TARGET_SIZE=${CHUNK_TARGET_SIZE:-8000}
  read -p "Enter MAX_CONCURRENT_CHUNKS [3]: " MAX_CONCURRENT_CHUNKS
  MAX_CONCURRENT_CHUNKS=${MAX_CONCURRENT_CHUNKS:-3}
  
  echo ""
  echo "Setting chunking configuration..."
  supabase secrets set ENABLE_CHUNKING="$ENABLE_CHUNKING"
  supabase secrets set CHUNK_TARGET_SIZE="$CHUNK_TARGET_SIZE"
  supabase secrets set MAX_CONCURRENT_CHUNKS="$MAX_CONCURRENT_CHUNKS"
fi

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "To view all secrets:"
echo "  supabase secrets list"
echo ""
echo "To update a secret:"
echo "  supabase secrets set KEY=value"
