# Environment Setup Guide

This guide explains how to configure environment variables for VocabGo in both local development and production environments.

## Overview

VocabGo uses two sets of environment variables:
1. **Frontend variables** (Vite) - Prefixed with `VITE_`, used by the Vue.js frontend
2. **Backend variables** (Supabase Edge Functions) - Used by Deno-based Edge Functions

## Quick Start

### Local Development

1. **Start Supabase locally:**
   ```bash
   cd supabase
   ./setup-local.sh
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Copy Supabase credentials:**
   After running `supabase start`, copy the API URL and anon key from the output:
   ```bash
   supabase status
   ```
   
   Update `.env.local` with these values:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
   ```

4. **Set GLM API key:**
   Get your API key from [GLM Platform](https://open.bigmodel.cn/) and add it to `.env.local`:
   ```env
   GLM_API_KEY=your-actual-api-key
   ```

5. **Set Edge Function secrets:**
   ```bash
   supabase secrets set GLM_API_KEY=your-actual-api-key
   ```

6. **Start the dev server:**
   ```bash
   pnpm dev
   ```

### Production Deployment

1. **Set frontend environment variables:**
   In your hosting platform (Vercel, Netlify, etc.), add:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   ```

2. **Set Edge Function secrets in Supabase Dashboard:**
   - Go to Project Settings > Edge Functions
   - Add the following secrets:
     - `GLM_API_KEY` (required)
     - `GLM_API_URL` (optional, defaults to GLM endpoint)
     - `GLM_MODEL` (optional, defaults to glm-4-flash)

## Required Environment Variables

### Frontend (VITE_*)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key | `eyJhbGc...` |

### Backend (Edge Functions)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `GLM_API_KEY` | ✅ Yes | GLM API authentication key | - |
| `GLM_API_URL` | ❌ No | GLM API endpoint | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| `GLM_MODEL` | ❌ No | GLM model to use | `glm-4-flash` |
| `GLM_MAX_TOKENS` | ❌ No | Maximum tokens per request | `2000` |
| `GLM_TEMPERATURE` | ❌ No | LLM temperature (0-1) | `0.7` |
| `GLM_TIMEOUT_MS` | ❌ No | Request timeout in milliseconds | `30000` |
| `GLM_MAX_RETRIES` | ❌ No | Maximum retry attempts | `3` |
| `GLM_BASE_DELAY_MS` | ❌ No | Initial retry delay | `1000` |
| `GLM_MAX_DELAY_MS` | ❌ No | Maximum retry delay | `10000` |
| `GLM_BACKOFF_MULTIPLIER` | ❌ No | Exponential backoff multiplier | `2` |

### Feature Flags (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_CONCURRENT_UPLOADS` | Global upload limit | `5` |
| `UPLOAD_COOLDOWN_MS` | Cooldown between uploads | `60000` |
| `MAX_FILE_SIZE_MB` | Maximum file size | `50` |
| `MAX_WORDS_PER_DOCUMENT` | Words per wordlist | `40` |
| `FILE_RETENTION_HOURS` | File storage duration | `24` |

## Getting API Keys

### Supabase

1. **Local Development:**
   - Run `supabase start`
   - Copy credentials from `supabase status` output

2. **Production:**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### GLM API

1. Visit [GLM Platform](https://open.bigmodel.cn/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again)

## Setting Edge Function Secrets

### Local Development

Use the Supabase CLI:

```bash
# Set a single secret
supabase secrets set GLM_API_KEY=your-key-here

# Set multiple secrets from .env file
supabase secrets set --env-file .env.local

# List all secrets (values are hidden)
supabase secrets list

# Unset a secret
supabase secrets unset GLM_API_KEY
```

### Production

Use the Supabase Dashboard or CLI:

**Dashboard:**
1. Go to Project Settings > Edge Functions
2. Click "Add secret"
3. Enter name and value
4. Save

**CLI:**
```bash
# Link to your project first
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set GLM_API_KEY=your-key-here --project-ref your-project-ref
```

## Verifying Configuration

### Frontend

Check if Supabase is configured correctly:

```typescript
// In browser console or component
import { supabase } from '@/lib/supabase'
console.log('Supabase URL:', supabase.supabaseUrl)
```

### Backend

Test Edge Functions locally:

```bash
# Invoke a function locally
supabase functions serve

# In another terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/process-document' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

## Troubleshooting

### "GLM_API_KEY environment variable is required"

**Problem:** Edge Functions can't find the GLM API key.

**Solution:**
```bash
# For local development
supabase secrets set GLM_API_KEY=your-key-here

# Verify it's set
supabase secrets list
```

### "Failed to connect to Supabase"

**Problem:** Frontend can't connect to Supabase.

**Solutions:**
1. Check `.env.local` exists and has correct values
2. Restart dev server after changing `.env.local`
3. Verify Supabase is running: `supabase status`
4. Check for typos in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Environment variables not updating

**Problem:** Changes to `.env.local` aren't reflected.

**Solution:**
1. Restart the dev server (`pnpm dev`)
2. Clear browser cache
3. Check that variable names start with `VITE_` for frontend variables

### Edge Functions can't access secrets

**Problem:** Secrets set locally aren't available in functions.

**Solution:**
1. Restart Supabase: `supabase stop && supabase start`
2. Re-set secrets: `supabase secrets set GLM_API_KEY=your-key`
3. Check function logs: `supabase functions logs process-document`

## Security Best Practices

1. **Never commit `.env.local` or `.env` files**
   - Already in `.gitignore`
   - Only commit `.env.example` templates

2. **Use different keys for development and production**
   - Separate Supabase projects
   - Separate GLM API keys if possible

3. **Rotate API keys regularly**
   - Especially if exposed or shared

4. **Limit API key permissions**
   - Use minimum required permissions
   - Monitor usage and set quotas

5. **Use environment-specific configurations**
   - Different timeout values for dev/prod
   - Different rate limits for testing

## File Structure

```
.
├── .env.example              # Template with all variables
├── .env.local.example        # Local development template
├── .env.local               # Your local config (gitignored)
├── ENV_SETUP.md             # This file
└── supabase/
    └── setup-local.sh       # Local Supabase setup script
```

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [GLM API Documentation](https://open.bigmodel.cn/dev/api)
