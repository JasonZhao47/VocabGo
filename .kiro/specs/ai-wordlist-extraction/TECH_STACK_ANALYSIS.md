# Tech Stack Analysis: Current vs. PRD Requirements

**Date:** January 9, 2025  
**Purpose:** Evaluate if current tech stack aligns with PRD requirements and identify potential changes

---

## Current Tech Stack

### Frontend
- **Framework:** Vue 3.4 with Composition API
- **Language:** TypeScript 5.3
- **Build Tool:** Vite 5.0
- **Styling:** TailwindCSS 3.4
- **Package Manager:** pnpm

### Backend
- **Platform:** Supabase (PostgreSQL + Edge Functions)
- **Runtime:** Deno (Edge Functions)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth (not yet implemented)

### AI/LLM
- **Model:** GLM-4-Flash (single model, hard-coded)
- **Provider:** BigModel (Zhipu AI)

### Infrastructure
- **Database:** PostgreSQL (via Supabase)
- **File Storage:** Supabase Storage with TTL
- **Deployment:** Supabase Cloud

---

## PRD Requirements Analysis

### Requirement: "5 Concurrent Uploads Globally"

**Current Stack:** ❌ **Problematic**

**Issue:**
- Supabase Edge Functions have limited concurrency control
- No built-in queue management
- Current MVP is synchronous (blocks during processing)

**Tech Stack Implications:**

**Option 1: Keep Supabase, Add Queue**
- ✅ Use PostgreSQL with SKIP LOCKED (already designed)
- ✅ Leverage existing infrastructure
- ❌ Edge Functions have 150s timeout limit
- ❌ Complex to implement job workers in Edge Functions

**Option 2: Add Dedicated Queue Service**
- ✅ Better concurrency control
- ✅ No timeout limits
- ✅ Better observability
- ❌ Additional infrastructure complexity
- ❌ Additional costs

**Recommendation:** 
- **Short-term:** Implement PostgreSQL queue (Task 5)
- **Long-term:** Consider BullMQ + Redis if scaling beyond 100 concurrent users

**Potential Stack Change:**
```
Current:  Supabase Edge Functions (synchronous)
Better:   Supabase Edge Functions + PostgreSQL Queue
Best:     Supabase + BullMQ + Redis + Background Workers
```

---

### Requirement: "30-Second Processing for 30-Page PDF"

**Current Stack:** ⚠️ **Marginal**

**Issue:**
- GLM-4-Flash response time: 2-5 seconds per call
- 3 sequential LLM calls: Extractor + Translator = 4-10 seconds
- PDF parsing: 1-3 seconds
- Text cleaning: <1 second
- **Total: 5-14 seconds** (within target, but no margin)

**Risk Factors:**
- Network latency to GLM API (China-based)
- API rate limiting during peak hours
- Large documents (>30 pages)

**Tech Stack Implications:**

**Option 1: Keep GLM-4-Flash, Optimize**
- ✅ Already integrated
- ✅ Cost-effective
- ❌ Limited control over latency
- ❌ Single point of failure

**Option 2: Add LLM Fallback/Load Balancing**
- ✅ Better reliability
- ✅ Can route to faster provider
- ❌ More complex integration
- ❌ Higher costs

**Option 3: Parallel LLM Calls**
- ✅ Could reduce time by 30-40%
- ✅ No new infrastructure
- ❌ Higher token costs (might extract + translate simultaneously)

**Recommendation:**
- **Short-term:** Implement parallel calls where possible
- **Medium-term:** Add OpenAI/Anthropic as fallback for critical requests
- **Long-term:** Multi-provider load balancing

**Potential Stack Change:**
```
Current:  GLM-4-Flash only
Better:   GLM-4-Flash + OpenAI fallback
Best:     LLM Gateway (Portkey/LiteLLM) with multiple providers
```

---

### Requirement: "Auto-Retry LLM Tasks Up to 3 Times"

**Current Stack:** ✅ **Good**

**Status:** Already implemented with exponential backoff

**No changes needed.**

---

### Requirement: "Files Auto-Deleted After 24 Hours"

**Current Stack:** ⚠️ **Partially Implemented**

**Issue:**
- Cleanup functions exist
- Cron jobs not configured
- Supabase doesn't have built-in cron (need external service)

**Tech Stack Implications:**

**Option 1: Supabase + External Cron**
- ✅ Simple
- ✅ Low cost
- ❌ Requires external service (GitHub Actions, Vercel Cron, etc.)
- ❌ Not integrated

**Option 2: Supabase + pg_cron Extension**
- ✅ Native PostgreSQL
- ✅ Integrated
- ❌ Requires Supabase Pro plan
- ❌ Limited to database operations

**Option 3: Move to Platform with Built-in Cron**
- ✅ Fully integrated
- ❌ Major migration effort
- ❌ Not justified for this feature alone

**Recommendation:**
- **Short-term:** GitHub Actions cron (free, simple)
- **Long-term:** Upgrade to Supabase Pro for pg_cron if budget allows

**Potential Stack Change:**
```
Current:  Manual cleanup
Better:   GitHub Actions cron → Supabase Function
Best:     Supabase Pro + pg_cron (native)
```

---

### Requirement: "Observability - Log Prompt, Token Count, Latency"

**Current Stack:** ⚠️ **Insufficient**

**Issue:**
- Basic logging to database
- No real-time monitoring
- No alerting
- No cost tracking dashboard

**Tech Stack Implications:**

**Option 1: Keep Current + Add Dashboard**
- ✅ Use existing data
- ✅ Build admin UI in Vue
- ❌ Manual dashboard maintenance
- ❌ No alerting

**Option 2: Add Observability Platform**
- ✅ Professional monitoring
- ✅ Alerting built-in
- ✅ Cost tracking
- ❌ Additional monthly cost ($20-100)
- ❌ Integration effort

**Recommendation:**
- **Short-term:** Build simple admin dashboard in Vue
- **Medium-term:** Add Sentry for error tracking
- **Long-term:** Consider Helicone or LangSmith for LLM observability

**Potential Stack Change:**
```
Current:  PostgreSQL logs only
Better:   PostgreSQL + Vue Admin Dashboard + Sentry
Best:     PostgreSQL + Helicone/LangSmith + Sentry + Grafana
```

---

### Requirement: "Cost Control - Token Limit and Chunked Streaming"

**Current Stack:** ⚠️ **Partially Implemented**

**Issue:**
- Token limits enforced in code
- No streaming (GLM-4-Flash doesn't support it well)
- No real-time cost tracking
- No budget alerts

**Tech Stack Implications:**

**Option 1: Keep Current + Add Budget Tracking**
- ✅ Simple
- ✅ Use existing metrics
- ❌ Reactive, not proactive

**Option 2: Add LLM Gateway with Budget Controls**
- ✅ Proactive budget enforcement
- ✅ Multi-provider support
- ✅ Better cost visibility
- ❌ Additional service ($50-200/month)
- ❌ Integration complexity

**Recommendation:**
- **Short-term:** Add budget alerts based on database metrics
- **Long-term:** Consider LLM gateway (Portkey, LiteLLM) if costs become significant

**Potential Stack Change:**
```
Current:  Direct GLM API calls
Better:   Direct calls + budget alerts
Best:     LLM Gateway (Portkey) with budget controls
```

---

## Scalability Concerns

### Current Bottlenecks

1. **Supabase Edge Functions Timeout (150s)**
   - Blocks long-running processing
   - No way to extend timeout
   - **Impact:** Can't process very large documents

2. **Synchronous Processing**
   - Blocks user during processing
   - Can't handle concurrent users
   - **Impact:** Poor UX, limited scalability

3. **Single LLM Provider**
   - No fallback if GLM API is down
   - Subject to rate limits
   - **Impact:** Service reliability risk

4. **No Caching**
   - Re-processes identical documents
   - Re-translates common words
   - **Impact:** Unnecessary costs

### Recommended Stack Changes for Scale

**If scaling to 100+ concurrent users:**

```
Frontend:     Vue 3 (keep) + CDN (add Cloudflare)
Backend:      Supabase (keep) + Background Workers (add)
Queue:        PostgreSQL (current) → Redis + BullMQ
LLM:          GLM-4-Flash (keep) + OpenAI fallback (add)
Monitoring:   Database logs → Helicone + Sentry
Caching:      None → Redis (document hashes, translations)
Storage:      Supabase Storage (keep) + CDN (add)
```

**If scaling to 1000+ concurrent users:**

```
Frontend:     Vue 3 + Cloudflare CDN
Backend:      Supabase + Dedicated Node.js workers
Queue:        Redis + BullMQ with multiple workers
LLM:          LLM Gateway (Portkey) with 3+ providers
Monitoring:   Helicone + Datadog + PagerDuty
Caching:      Redis cluster (documents + translations)
Storage:      S3 + CloudFront CDN
Database:     PostgreSQL (dedicated instance)
```

---

## Tech Stack Recommendations by Priority

### Priority 1: Critical for Production Launch

1. **Add Queue System**
   - **Change:** Implement PostgreSQL queue (Task 5)
   - **Why:** Required for concurrent users
   - **Effort:** Medium (2-3 days)
   - **Cost:** $0 (use existing PostgreSQL)

2. **Add Cron for Cleanup**
   - **Change:** GitHub Actions cron job
   - **Why:** Prevent storage cost accumulation
   - **Effort:** Low (2-4 hours)
   - **Cost:** $0 (GitHub Actions free tier)

3. **Add Error Monitoring**
   - **Change:** Integrate Sentry
   - **Why:** Track production errors
   - **Effort:** Low (2-4 hours)
   - **Cost:** $0 (free tier for <5k events/month)

### Priority 2: Important for Reliability

4. **Add LLM Fallback**
   - **Change:** OpenAI as backup for GLM failures
   - **Why:** Improve reliability
   - **Effort:** Medium (1-2 days)
   - **Cost:** Variable (only on fallback)

5. **Add Basic Monitoring Dashboard**
   - **Change:** Vue admin page for metrics
   - **Why:** Track costs and performance
   - **Effort:** Medium (2-3 days)
   - **Cost:** $0

6. **Add Translation Caching**
   - **Change:** Cache common word translations
   - **Why:** Reduce LLM costs
   - **Effort:** Low (1 day)
   - **Cost:** $0 (use PostgreSQL)

### Priority 3: Nice-to-Have for Scale

7. **Add Redis for Queue**
   - **Change:** Replace PostgreSQL queue with Redis + BullMQ
   - **Why:** Better performance at scale
   - **Effort:** High (3-5 days)
   - **Cost:** $10-30/month (Redis Cloud)

8. **Add LLM Gateway**
   - **Change:** Use Portkey or LiteLLM
   - **Why:** Multi-provider, better observability
   - **Effort:** Medium (2-3 days)
   - **Cost:** $50-200/month

9. **Add CDN**
   - **Change:** Cloudflare for static assets
   - **Why:** Faster global access
   - **Effort:** Low (1 day)
   - **Cost:** $0 (free tier)

---

## Stack Changes NOT Recommended

### 1. Replace Vue with React/Next.js

**Reason to Change:** React has larger ecosystem

**Why NOT to Change:**
- ✅ Vue 3 + Composition API is excellent for this use case
- ✅ TypeScript support is first-class
- ✅ Team is already productive with Vue
- ✅ No PRD requirement that Vue can't handle
- ❌ Migration would take 2-3 weeks with no user benefit

**Verdict:** Keep Vue 3

### 2. Replace Supabase with Custom Backend

**Reason to Change:** More control, no vendor lock-in

**Why NOT to Change:**
- ✅ Supabase provides auth, database, storage, functions in one
- ✅ PostgreSQL is production-grade
- ✅ Edge Functions work well for current scale
- ✅ Cost-effective ($25/month for Pro)
- ❌ Custom backend would require DevOps expertise
- ❌ Would need to implement auth, storage, etc.

**Verdict:** Keep Supabase (at least until 10k+ users)

### 3. Replace GLM-4-Flash with GPT-4

**Reason to Change:** Better quality, more reliable

**Why NOT to Change:**
- ✅ GLM-4-Flash is cost-effective (~10x cheaper)
- ✅ Quality is sufficient for vocabulary extraction
- ✅ Mandarin translation quality is good (Chinese model)
- ❌ GPT-4 would increase costs significantly
- ❌ No PRD requirement for higher quality

**Verdict:** Keep GLM-4-Flash as primary, add GPT-3.5-turbo as fallback

### 4. Replace PostgreSQL with MongoDB

**Reason to Change:** More flexible schema

**Why NOT to Change:**
- ✅ PostgreSQL handles JSON (JSONB) perfectly
- ✅ ACID transactions are valuable
- ✅ Supabase is built on PostgreSQL
- ✅ Relational model fits the data well
- ❌ MongoDB would require migration
- ❌ No PRD requirement for NoSQL

**Verdict:** Keep PostgreSQL

---

## Summary: Recommended Tech Stack Changes

### Immediate (Before Launch)
1. ✅ **Add:** PostgreSQL queue system
2. ✅ **Add:** GitHub Actions cron for cleanup
3. ✅ **Add:** Sentry for error monitoring

### Short-Term (Next 3 Months)
4. ✅ **Add:** OpenAI as LLM fallback
5. ✅ **Add:** Vue admin dashboard for metrics
6. ✅ **Add:** PostgreSQL caching for translations

### Long-Term (6+ Months, if scaling)
7. ⚠️ **Consider:** Redis + BullMQ for queue
8. ⚠️ **Consider:** LLM Gateway (Portkey/LiteLLM)
9. ⚠️ **Consider:** Dedicated PostgreSQL instance

### NOT Recommended
- ❌ Replace Vue with React
- ❌ Replace Supabase with custom backend
- ❌ Replace GLM-4-Flash entirely
- ❌ Replace PostgreSQL with MongoDB

---

## Cost Impact Analysis

### Current Monthly Cost (Estimated)
- Supabase: $0 (free tier) or $25 (Pro)
- GLM API: ~$10-50 (depends on usage)
- **Total: $10-75/month**

### With Recommended Changes
- Supabase Pro: $25 (for pg_cron)
- GLM API: ~$10-50
- Sentry: $0 (free tier)
- GitHub Actions: $0 (free tier)
- OpenAI fallback: ~$5-10 (only on failures)
- **Total: $40-90/month**

### At Scale (1000+ users)
- Supabase Pro: $25
- Redis Cloud: $30
- GLM API: ~$200-500
- OpenAI fallback: ~$50-100
- Helicone: $50
- Sentry: $26
- **Total: $381-731/month**

---

## Conclusion

**The current tech stack is fundamentally sound** and aligns well with PRD requirements. No major replacements are needed.

**Key Changes Recommended:**
1. Add queue system (PostgreSQL-based)
2. Add cron for cleanup (GitHub Actions)
3. Add error monitoring (Sentry)
4. Add LLM fallback (OpenAI)
5. Add basic observability dashboard

**Stack to Keep:**
- Vue 3 + TypeScript (excellent choice)
- Supabase (cost-effective, feature-rich)
- GLM-4-Flash (good quality/cost ratio)
- PostgreSQL (reliable, flexible)

**The main gap is operational tooling (queue, monitoring, cron), not the core stack.**

---

**Analysis Date:** January 9, 2025  
**Next Review:** After reaching 100 active users
