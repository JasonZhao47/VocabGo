# VocabGo Deployment Guide: Vercel + Supabase

Complete step-by-step guide to deploy VocabGo to production.

---

## Prerequisites

- GitHub account with VocabGo repository
- Vercel account (free tier works)
- Supabase account with project created
- pnpm installed locally
- Git configured

---

## Part 1: Supabase Production Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: vocabgo-production
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

### Step 2: Configure Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Run your migration files in order:
   ```bash
   # Locally, check your migrations
   ls supabase/migrations/
   ```
3. Copy and execute each migration SQL file in the SQL Editor
4. Verify tables exist: Go to **Table Editor** and check for:
   - `wordlists`
   - `practice_questions`
   - `student_sessions`
   - `practice_mistakes`
   - `practice_stats_by_student`

### Step 3: Deploy Edge Functions

1. Install Supabase CLI if not already:
   ```bash
   brew install supabase/tap/supabase
   # or
   npm install -g supabase
   ```

2. Link to your production project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find project-ref in Supabase Dashboard > Settings > General)

3. Deploy all edge functions:
   ```bash
   supabase functions deploy process-document
   supabase functions deploy save-wordlist
   supabase functions deploy delete-wordlist
   supabase functions deploy fetch-wordlists
   supabase functions deploy generate-practice-questions
   supabase functions deploy generate-questions-from-mistakes
   supabase functions deploy register-student-session
   supabase functions deploy record-practice-mistake
   supabase functions deploy fetch-practice-stats
   supabase functions deploy share-wordlist
   ```

### Step 4: Set Supabase Secrets

Set environment variables for edge functions:

```bash
# Required: GLM API Configuration
supabase secrets set GLM_API_KEY=your-glm-api-key-here
supabase secrets set GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
supabase secrets set GLM_MODEL=glm-4-flash

# Optional: GLM Configuration (defaults shown)
supabase secrets set GLM_MAX_TOKENS=2000
supabase secrets set GLM_TEMPERATURE=0.7
supabase secrets set GLM_TIMEOUT_MS=30000
supabase secrets set GLM_MAX_RETRIES=3

# Optional: Feature Configuration
supabase secrets set ENABLE_CHUNKING=true
supabase secrets set CHUNK_TARGET_SIZE=8000
supabase secrets set MAX_CONCURRENT_CHUNKS=3
```

### Step 5: Get Supabase Credentials

1. Go to **Settings > API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

---

## Part 2: Vercel Deployment Setup

### Step 6: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." > "Project"
3. Import your GitHub repository:
   - Search for "vocabgo" or your repo name
   - Click "Import"

### Step 7: Configure Build Settings

Vercel should auto-detect Vue, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Step 8: Add Environment Variables

In the Vercel project settings, add these environment variables:

**Required Variables:**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
```

**How to add:**
1. In Vercel project settings, go to **Settings > Environment Variables**
2. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL
   - Environment: Select all (Production, Preview, Development)
3. Click "Save"
4. Repeat for `VITE_SUPABASE_ANON_KEY`

### Step 9: Deploy

1. Click "Deploy" button
2. Wait for build to complete (~2-3 minutes)
3. Vercel will show:
   - ✅ Build successful
   - 🚀 Deployment URL

### Step 10: Test Production Deployment

1. Click the deployment URL (e.g., `vocabgo.vercel.app`)
2. Test core functionality:
   - Upload a document
   - Generate wordlist
   - Save wordlist
   - Generate practice questions
   - Test student practice view

---

## Part 3: Custom Domain (Optional)

### Step 11: Add Custom Domain

1. In Vercel project, go to **Settings > Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `vocabgo.com`)
4. Vercel will provide DNS records

### Step 12: Configure DNS

In your domain registrar (GoDaddy, Namecheap, etc.):

**For root domain (vocabgo.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Step 13: Verify Domain

1. Wait for DNS propagation (5-60 minutes)
2. Vercel will automatically verify and provision SSL
3. Your site will be live at your custom domain with HTTPS

---

## Part 4: Configure Automatic Deployments

### Step 14: Enable Git Integration

Vercel automatically sets up:
- **Production deployments**: Pushes to `main` branch
- **Preview deployments**: Pull requests and other branches

To customize:
1. Go to **Settings > Git**
2. Configure:
   - Production Branch: `main` (or your preferred branch)
   - Ignored Build Step: Leave empty for automatic deploys

### Step 15: Set Up Deploy Hooks (Optional)

For manual or external triggers:
1. Go to **Settings > Git > Deploy Hooks**
2. Create a hook:
   - Name: "Manual Deploy"
   - Branch: `main`
3. Copy the webhook URL
4. Trigger deploys via:
   ```bash
   curl -X POST https://api.vercel.com/v1/integrations/deploy/...
   ```

---

## Part 5: Monitoring & Optimization

### Step 16: Enable Analytics

1. In Vercel project, go to **Analytics**
2. Enable Web Analytics (free)
3. Monitor:
   - Page views
   - Web Vitals (LCP, FID, CLS)
   - User geography

### Step 17: Configure Caching

Vercel automatically caches static assets. To optimize:

1. Verify cache headers in **Deployment > Functions**
2. Static assets are cached for 31536000 seconds (1 year)
3. HTML is cached with `s-maxage=0` for instant updates

### Step 18: Set Up Error Monitoring (Optional)

Integrate with error tracking:
1. Add Sentry or similar service
2. In Vercel, go to **Integrations**
3. Install error monitoring integration
4. Configure in your app

---

## Part 6: Supabase Production Configuration

### Step 19: Update Supabase Auth Settings

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Add your Vercel URLs:
   - **Site URL**: `https://vocabgo.vercel.app` (or your custom domain)
   - **Redirect URLs**: Add:
     - `https://vocabgo.vercel.app/**`
     - `https://your-custom-domain.com/**` (if using custom domain)

### Step 20: Configure CORS (if needed)

1. Go to **Settings > API**
2. Under **CORS**, add allowed origins:
   - `https://vocabgo.vercel.app`
   - `https://your-custom-domain.com`

### Step 21: Set Up Database Backups

1. Go to **Database > Backups**
2. Verify automatic daily backups are enabled
3. Consider upgrading plan for more frequent backups

---

## Part 7: Testing & Verification

### Step 22: Run Production Tests

Test all features in production:

**Upload & Processing:**
- [ ] Upload PDF document
- [ ] Upload DOCX document
- [ ] Upload TXT document
- [ ] Verify wordlist generation
- [ ] Check translation quality

**Wordlist Management:**
- [ ] Save wordlist
- [ ] View saved wordlists
- [ ] Delete wordlist
- [ ] Export to CSV
- [ ] Export to XLSX

**Practice Questions:**
- [ ] Generate practice questions
- [ ] Test multiple choice questions
- [ ] Test fill-in-the-blank questions
- [ ] Test matching questions
- [ ] Share wordlist for practice

**Student Features:**
- [ ] Access shared practice via URL
- [ ] Enter student nickname
- [ ] Complete practice questions
- [ ] View results
- [ ] Generate questions from mistakes

### Step 23: Performance Audit

Run Lighthouse audit:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90

### Step 24: Load Testing (Optional)

Test with concurrent users:
```bash
# Install k6 or similar
brew install k6

# Run load test
k6 run load-test.js
```

---

## Part 8: Rollback & Recovery

### Step 25: Understand Rollback Process

If issues occur:
1. Go to **Deployments** in Vercel
2. Find the last working deployment
3. Click "..." menu > "Promote to Production"
4. Instant rollback (no rebuild needed)

### Step 26: Set Up Monitoring Alerts

1. In Vercel, go to **Settings > Notifications**
2. Enable:
   - Deployment failed
   - Deployment succeeded
   - Performance degradation
3. Add email or Slack integration

---

## Part 9: Maintenance & Updates

### Step 27: Update Workflow

For future updates:
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Push branch: `git push origin feature/new-feature`
4. Vercel creates preview deployment automatically
5. Test preview deployment
6. Create pull request on GitHub
7. Review and merge to `main`
8. Vercel deploys to production automatically

### Step 28: Environment Variable Updates

To update environment variables:
1. Go to **Settings > Environment Variables**
2. Edit the variable
3. Redeploy for changes to take effect:
   - Go to **Deployments**
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## Troubleshooting

### Build Fails

**Issue**: Build fails with TypeScript errors
**Solution**: 
```bash
# Run locally first
pnpm type-check
pnpm build
```

**Issue**: Missing environment variables
**Solution**: Verify all `VITE_*` variables are set in Vercel

### Runtime Errors

**Issue**: Supabase connection fails
**Solution**: 
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify Supabase project is active
- Check browser console for CORS errors

**Issue**: Edge functions return 500 errors
**Solution**:
- Check Supabase function logs: Dashboard > Edge Functions > Logs
- Verify secrets are set: `supabase secrets list`
- Redeploy functions if needed

### Performance Issues

**Issue**: Slow page loads
**Solution**:
- Check bundle size in build output
- Verify code splitting is working
- Enable Vercel Analytics to identify bottlenecks

**Issue**: High API latency
**Solution**:
- Check Supabase region matches Vercel region
- Consider upgrading Supabase plan
- Implement caching strategies

---

## Quick Reference

### Essential Commands

```bash
# Local development
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy Supabase functions
supabase functions deploy <function-name>

# Set Supabase secret
supabase secrets set KEY=value

# List Supabase secrets
supabase secrets list
```

### Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

### Support Resources

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- VocabGo Issues: [Your GitHub repo]/issues

---

## Checklist

Use this checklist to track your deployment progress:

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Deploy edge functions
- [ ] Set environment secrets
- [ ] Configure auth URLs
- [ ] Test edge functions

### Vercel Setup
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy to production
- [ ] Test deployment
- [ ] Configure custom domain (optional)

### Post-Deployment
- [ ] Run production tests
- [ ] Performance audit
- [ ] Enable analytics
- [ ] Set up monitoring alerts
- [ ] Document rollback process
- [ ] Train team on deployment workflow

---

## Next Steps

After successful deployment:

1. **Monitor**: Check Vercel Analytics and Supabase logs regularly
2. **Optimize**: Use performance data to improve load times
3. **Scale**: Upgrade Supabase/Vercel plans as usage grows
4. **Secure**: Implement rate limiting and additional security measures
5. **Document**: Keep this guide updated with your specific configurations

---

**Deployment Complete! 🚀**

Your VocabGo application is now live and ready for users.
