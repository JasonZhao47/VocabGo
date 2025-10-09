#!/bin/bash

# Local Supabase Setup Script
# This script helps set up Supabase for local development

set -e

echo "🚀 Setting up local Supabase environment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if Docker is running (required for local Supabase)
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"

# Start Supabase
echo "📦 Starting Supabase services..."
supabase start

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres

# Display connection info
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Connection Details:"
supabase status

echo ""
echo "🔗 Quick Links:"
echo "   Studio UI: http://localhost:54323"
echo "   API URL: http://localhost:54321"
echo ""
echo "💡 Next Steps:"
echo "   1. Copy the API URL and anon key to your .env.local file"
echo "   2. Start your dev server: pnpm dev"
echo "   3. Test the connection in your app"
echo ""
echo "🛑 To stop Supabase: supabase stop"
