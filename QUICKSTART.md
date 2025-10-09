# VocabGo Quick Start Guide

Get VocabGo running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Docker Desktop installed and running
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] GLM API key ([Sign up here](https://open.bigmodel.cn/))

## Step-by-Step Setup

### 1. Install Dependencies (1 minute)

```bash
# Install project dependencies
pnpm install
```

### 2. Configure Environment (2 minutes)

```bash
# Copy the environment template
cp .env.local.example .env.local

# Open .env.local in your editor
# You'll update it in step 4
```

### 3. Start Supabase (1 minute)

```bash
# Navigate to supabase directory and run setup
cd supabase
./setup-local.sh
```

**Important:** Copy the API URL and anon key from the output!

Example output:
```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Update Environment File (30 seconds)

Edit `.env.local` and update these values:

```env
# Use the values from step 3
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<paste-your-anon-key-here>

# Add your GLM API key
GLM_API_KEY=<paste-your-glm-api-key-here>
```

### 5. Set Edge Function Secrets (30 seconds)

```bash
# From the project root
supabase secrets set GLM_API_KEY=<your-glm-api-key>
```

### 6. Verify Setup (30 seconds)

```bash
# Run the verification script
./scripts/verify-setup.sh
```

You should see all green checkmarks ✓

### 7. Start Development Server (10 seconds)

```bash
# Start the dev server
pnpm dev
```

### 8. Open Browser

Navigate to: **http://localhost:5173**

You should see the VocabGo homepage!

## Quick Test

Let's verify everything works:

1. **Create a test file** (`test.txt`):
   ```
   Learning English vocabulary is important for language development.
   Understanding words like achievement, beneficial, and collaborate
   helps improve communication skills.
   ```

2. **Upload the file**:
   - Click "Upload Document"
   - Select your `test.txt` file
   - Click "Process Document"

3. **Wait for processing** (should take < 10 seconds)

4. **View results**:
   - You should see a wordlist with English words and Mandarin translations
   - Try saving, exporting, and deleting the wordlist

## Troubleshooting

### "Docker is not running"

**Solution:**
1. Open Docker Desktop
2. Wait for it to start
3. Run `./scripts/verify-setup.sh` again

### "Supabase CLI not found"

**Solution:**
```bash
npm install -g supabase
```

### "pnpm not found"

**Solution:**
```bash
npm install -g pnpm
```

### "Failed to connect to Supabase"

**Solution:**
1. Check Supabase is running: `supabase status`
2. Verify `.env.local` has correct URL and key
3. Restart dev server: `pnpm dev`

### "GLM_API_KEY not found"

**Solution:**
```bash
# Set the secret again
supabase secrets set GLM_API_KEY=your-key-here

# Restart Supabase
supabase stop && supabase start
```

## Next Steps

Now that you're set up:

1. ✅ Read the [README.md](./README.md) for full documentation
2. ✅ Check [ENV_SETUP.md](./ENV_SETUP.md) for advanced configuration
3. ✅ Review [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for testing
4. ✅ Explore the code in `src/` and `supabase/functions/`

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run all tests
pnpm test:ui          # Run tests with UI

# Supabase
supabase status       # Check Supabase status
supabase stop         # Stop Supabase
supabase start        # Start Supabase
supabase functions logs process-document  # View function logs

# Verification
./scripts/verify-setup.sh  # Verify environment setup
```

## Getting Help

If you're stuck:

1. Run `./scripts/verify-setup.sh` to diagnose issues
2. Check the [Troubleshooting](#troubleshooting) section above
3. Review [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration
4. Check Supabase logs: `supabase functions logs`

## Success!

If you can upload a document and see a wordlist, you're all set! 🎉

Happy coding! 🚀
