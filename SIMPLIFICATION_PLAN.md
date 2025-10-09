# VocabGo Simplification Plan

**Goal:** Remove over-engineered components to create a lean, maintainable MVP

**Date:** January 9, 2025

---

## Phase 1: Database Simplification ✅

### Remove Unused Tables

**Tables to Remove:**
- ❌ `jobs` - Not used (MVP is synchronous)
- ❌ `llm_metrics` - Not populated or used
- ❌ `upload_cooldowns` - Rate limiting not implemented

**Tables to Keep:**
- ✅ `wordlists` - Core feature, actively used

### Actions:
1. Create new migration to drop unused tables
2. Remove associated indexes
3. Remove RLS policies
4. Remove helper functions (queue management, cooldown cleanup)
5. Update wordlists table to remove job_id foreign key

---

## Phase 2: Remove XLSX Export (Keep CSV Only)

### Files to Modify:
- `src/services/wordlistService.ts` - Remove XLSX export function
- `supabase/functions/_shared/exporters/` - Remove XLSX exporter (if exists)
- `src/pages/ResultPage.vue` - Remove XLSX button
- `src/pages/SavedWordlistsPage.vue` - Remove XLSX button
- Tests - Remove XLSX test cases

### Benefits:
- Remove `xlsx` dependency (~500KB)
- Reduce code by ~200 lines
- Simplify testing
- Faster builds

---

## Phase 3: Simplify Error Handling

### Current State:
- Complex error code enum with 15+ codes
- Detailed error types for every scenario

### Simplified Approach:
```typescript
type ErrorCategory = 'upload' | 'processing' | 'export' | 'system'

interface AppError {
  category: ErrorCategory
  message: string  // User-friendly message
  details?: string // Technical details for logging
}
```

### Benefits:
- Simpler error handling logic
- Easier to maintain
- Still provides good UX

---

## Phase 4: Remove Unused Metrics Code

### Files to Clean:
- `supabase/functions/_shared/llm/metrics.ts` - Simplify to console.log only
- Remove database insertion code
- Keep basic logging for debugging

---

## Phase 5: Update Documentation

### Files to Update:
- `design.md` - Remove queue system, metrics tables
- `ARCHITECTURE_DECISION.md` - Add simplification rationale
- `README.md` - Update architecture diagram
- `SCHEMA.md` - Update to reflect simplified schema

---

## Execution Order

1. ✅ Create database migration (drop tables)
2. ✅ Remove XLSX export code
3. ✅ Simplify error handling
4. ✅ Clean up metrics code
5. ✅ Update documentation
6. ✅ Run tests to ensure nothing breaks
7. ✅ Update environment setup guides

---

## Estimated Impact

**Code Reduction:**
- Database schema: -150 lines
- Frontend code: -200 lines (XLSX export)
- Backend code: -100 lines (metrics, queue)
- **Total: ~450 lines removed**

**Dependency Reduction:**
- Remove `xlsx` package
- Simpler database schema
- Fewer RLS policies to maintain

**Maintenance Reduction:**
- 3 fewer tables to manage
- 1 fewer export format to test
- Simpler error handling logic

**Performance Impact:**
- Smaller bundle size (~500KB reduction)
- Faster database queries (fewer indexes)
- Simpler deployment

---

## Rollback Plan

If simplification causes issues:
1. Git revert to current state
2. Re-run original migrations
3. Restore XLSX export code

All changes will be in separate commits for easy rollback.

---

## Success Criteria

- ✅ All tests pass
- ✅ Core features work (upload, process, save, export CSV, delete)
- ✅ No unused tables in database
- ✅ Documentation reflects actual implementation
- ✅ Codebase is easier to understand

---

## Next Steps After Simplification

1. Get 10 users to test the MVP
2. Collect feedback on what features they actually need
3. Add complexity only when users request it:
   - XLSX export (if 3+ users request)
   - Queue system (if concurrent users > 50)
   - Metrics dashboard (if costs > $100/month)
   - Rate limiting (if abuse occurs)

---

**Status:** Ready to execute
**Estimated Time:** 2-3 hours
**Risk Level:** Low (all changes are removals, not modifications)
