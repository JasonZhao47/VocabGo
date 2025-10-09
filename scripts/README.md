# VocabGo Scripts

This directory contains utility scripts for development and testing.

## Available Scripts

### verify-setup.sh

Verifies that your development environment is properly configured.

**Usage:**
```bash
./scripts/verify-setup.sh
```

**What it checks:**
- Node.js and pnpm installation
- Supabase CLI installation
- Docker status
- Environment configuration files
- Supabase running status
- Edge Functions presence
- Required environment variables

**Example output:**
```
🔍 VocabGo Setup Verification
==============================

📦 Checking Dependencies...
✓ Node.js installed: v20.11.0
✓ pnpm installed: 9.0.0
✓ Supabase CLI installed: 1.142.2
✓ Docker is running

📝 Checking Configuration Files...
✓ .env.local exists
✓ VITE_SUPABASE_URL is set
✓ VITE_SUPABASE_ANON_KEY is set
✓ GLM_API_KEY is configured
✓ node_modules exists

🗄️  Checking Supabase Status...
✓ Supabase is running

🔧 Checking Edge Functions...
✓ Edge Functions directory exists
✓ Function 'process-document' exists
✓ Function 'save-wordlist' exists
✓ Function 'fetch-wordlists' exists
✓ Function 'delete-wordlist' exists

📊 Summary
==========
✓ All checks passed!

🚀 You're ready to start development:
   1. Start dev server: pnpm dev
   2. Open browser: http://localhost:5173
   3. Run tests: pnpm test
```

## Adding New Scripts

When adding new scripts:

1. Create the script file in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add documentation to this README
4. Use clear error messages and status indicators
5. Follow the existing script patterns for consistency
