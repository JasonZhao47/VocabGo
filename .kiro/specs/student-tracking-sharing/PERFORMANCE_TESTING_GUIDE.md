# Performance Testing Guide

## Overview

This guide explains how to run and interpret the performance tests for the Student Tracking & Sharing System. These tests validate that the system meets the non-functional requirements (NFR1, NFR2) specified in the requirements document.

## Prerequisites

### 1. Start Local Supabase

The performance tests require a running Supabase instance:

```bash
# From the project root
cd supabase
supabase start
```

Wait for Supabase to fully start. You should see output indicating all services are running.

### 2. Verify Environment Variables

Ensure your `.env.local` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Running Performance Tests

### Run All Performance Tests

```bash
pnpm test tests/performance/student-tracking-performance.test.ts
```

### Run Specific Test Suites

```bash
# Test share link generation performance
pnpm test tests/performance/student-tracking-performance.test.ts -t "Share Link Generation"

# Test scalability with 100 students
pnpm test tests/performance/student-tracking-performance.test.ts -t "100 Students"

# Test dashboard load time
pnpm test tests/performance/student-tracking-performance.test.ts -t "Dashboard Load Time"

# Test materialized view performance
pnpm test tests/performance/student-tracking-performance.test.ts -t "Materialized View"
```

## Test Coverage

### NFR1: Performance Requirements

#### 1. Share Link Generation (< 100ms)
**Test:** `should generate share link in < 100ms`

Validates that enabling sharing and generating a secure share token completes within 100ms.

**What it tests:**
- Token generation speed
- Database update performance
- API response time

**Expected result:** Duration < 100ms

#### 2. Dashboard Load Time (< 2s for 100 students)
**Test:** `should load dashboard with 100 students in < 2s`

Validates that the practice dashboard loads all statistics within 2 seconds when there are 100 students.

**What it tests:**
- Aggregate query performance
- Student list retrieval
- Mistake summary generation
- API response time with large datasets

**Expected result:** Duration < 2000ms

#### 3. Real-time Updates (< 500ms latency)
**Test:** `should handle 1000 mistake recordings efficiently`

Validates that mistake recording maintains low latency even under load.

**What it tests:**
- Mistake recording API performance
- Database insert/update speed
- Average latency across 1000 operations

**Expected result:** Average duration < 500ms per request

### NFR2: Scalability Requirements

#### 1. Support 100+ Students Per Wordlist
**Test:** `should register 100 students efficiently`

Validates that the system can handle 100 concurrent student registrations.

**What it tests:**
- Session creation performance
- Unique constraint handling
- Device fingerprinting speed
- Database scalability

**Expected result:** All 100 students registered successfully

#### 2. Handle 1000+ Practice Sessions
**Test:** `should handle 1000 mistake recordings efficiently`

Validates that the system can process 1000 practice sessions (mistakes) efficiently.

**What it tests:**
- High-volume data insertion
- Concurrent request handling
- Database write performance
- Materialized view refresh triggers

**Expected result:** All 1000 mistakes recorded successfully

#### 3. Efficient Querying for Mistake Aggregation
**Test:** `should query materialized view efficiently`

Validates that the materialized view provides fast access to aggregated mistake data.

**What it tests:**
- Materialized view query performance
- Index effectiveness
- Aggregation speed

**Expected result:** Query duration < 100ms

### Additional Performance Tests

#### Concurrent Dashboard Requests
**Test:** `should handle multiple concurrent dashboard requests`

Validates that the system can handle multiple teachers viewing dashboards simultaneously.

**What it tests:**
- Concurrent read performance
- Database connection pooling
- API scalability

**Expected result:** Max duration < 3000ms for 10 concurrent requests

#### Materialized View Refresh
**Test:** `should refresh materialized view efficiently`

Validates that the materialized view refresh trigger doesn't significantly impact performance.

**What it tests:**
- Trigger execution time
- Refresh mechanism efficiency
- Impact on write operations

**Expected result:** Duration < 1000ms

#### Burst Mistake Recording
**Test:** `should handle burst of mistake recordings`

Validates that the system can handle sudden spikes in activity.

**What it tests:**
- Burst handling capacity
- Rate limiting effectiveness
- Throughput under load

**Expected result:** 50 requests in < 5000ms

#### Query Optimization Tests
**Tests:**
- `should efficiently query student sessions with pagination`
- `should efficiently query mistakes by student`
- `should efficiently query mistakes by wordlist`

Validates that all database queries are properly optimized with indexes.

**What they test:**
- Index usage
- Query plan efficiency
- Pagination performance

**Expected results:** All queries < 200ms

#### Index Performance Tests
**Tests:**
- `should use indexes for session token lookup`
- `should use indexes for wordlist sessions lookup`

Validates that database indexes are being used effectively.

**What they test:**
- Index effectiveness
- Lookup speed
- Query optimization

**Expected results:** All lookups < 50ms

## Interpreting Results

### Performance Metrics

The tests output detailed timing information:

```
Share link generation took: 45.23ms
Average registration time: 234.56ms
Max registration time: 456.78ms
Successfully registered: 100 students
Total mistakes recorded: 1000
Average mistake recording time: 123.45ms
Dashboard load time: 1234.56ms
```

### Success Criteria

✅ **All tests pass** - System meets all performance requirements

⚠️ **Some tests fail** - Performance optimization needed:
- Check database indexes
- Review query plans
- Optimize materialized view refresh
- Consider caching strategies

❌ **Many tests fail** - Significant performance issues:
- Review database schema
- Check for N+1 queries
- Verify proper indexing
- Consider architectural changes

## Performance Optimization Tips

### If Share Link Generation is Slow (> 100ms)
1. Check token generation algorithm
2. Verify database connection latency
3. Review share_wordlist edge function code

### If Dashboard Load is Slow (> 2s)
1. Verify materialized view is being used
2. Check for missing indexes
3. Review aggregate query complexity
4. Consider adding caching layer

### If Mistake Recording is Slow (> 500ms)
1. Check database write performance
2. Review materialized view refresh trigger
3. Consider batching updates
4. Verify rate limiting isn't too aggressive

### If Queries are Slow
1. Run `EXPLAIN ANALYZE` on slow queries
2. Verify indexes exist and are being used
3. Check for table bloat
4. Consider query optimization

## Database Performance Analysis

### Check Index Usage

```sql
-- Check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM student_sessions
WHERE session_token = 'example-token';

-- Should show "Index Scan" not "Seq Scan"
```

### Check Materialized View Performance

```sql
-- Check materialized view size
SELECT pg_size_pretty(pg_total_relation_size('wordlist_mistake_summary'));

-- Refresh materialized view manually
REFRESH MATERIALIZED VIEW CONCURRENTLY wordlist_mistake_summary;
```

### Check Table Statistics

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Continuous Performance Monitoring

### Run Tests Regularly

Add performance tests to your CI/CD pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Tests
on: [push, pull_request]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Supabase
        run: |
          cd supabase
          supabase start
      - name: Run Performance Tests
        run: pnpm test tests/performance/
```

### Set Up Alerts

Monitor performance metrics in production:
- Dashboard load times
- API response times
- Database query durations
- Error rates

### Performance Benchmarks

Keep a record of performance test results over time to track trends:

```
Date       | Share Gen | Dashboard | Mistake Rec | Notes
-----------|-----------|-----------|-------------|-------
2025-01-17 | 45ms      | 1234ms    | 123ms       | Baseline
2025-01-20 | 42ms      | 1100ms    | 115ms       | Added indexes
2025-01-25 | 40ms      | 950ms     | 110ms       | Optimized queries
```

## Troubleshooting

### Tests are Skipped

If you see "14 skipped (14)", Supabase is not running:

```bash
cd supabase
supabase start
```

### Tests Fail with "Connection Refused"

Check that Supabase is running on the correct port:

```bash
supabase status
```

### Tests Fail with "Unauthorized"

Verify your environment variables are set correctly:

```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Tests are Slow

If tests are consistently slow:
1. Check your machine's resources (CPU, memory)
2. Verify no other heavy processes are running
3. Consider running tests on a dedicated test environment

## Next Steps

After running performance tests:

1. ✅ Review all test results
2. ✅ Document any performance issues
3. ✅ Optimize slow queries
4. ✅ Re-run tests to verify improvements
5. ✅ Update performance benchmarks
6. ✅ Consider load testing in staging environment

## Related Documentation

- [Requirements Document](./requirements.md) - NFR1, NFR2 specifications
- [Design Document](./design.md) - Architecture and optimization strategies
- [Database Schema](../../../supabase/migrations/20250117000001_student_tracking.sql) - Index definitions
