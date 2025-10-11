t#!/bin/bash
# Start development environment with proper environment variables

echo "Starting Supabase with environment variables..."
supabase start

echo ""
echo "Starting Edge Functions with environment file..."
supabase functions serve --env-file supabase/.env

