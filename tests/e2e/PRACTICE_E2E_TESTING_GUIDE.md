# Practice Question Generator E2E Testing Guide

## Overview

This document describes the end-to-end testing strategy for the Practice Question Generator feature. The tests validate the complete user workflow from question generation through session management to sharing functionality.

## Prerequisites

Before running the E2E tests, ensure:

1. **Supabase is running locally**:
   ```bash
   supabase start
   ```

2. **Environment variables are configured**:
   - `VITE_SUPABASE_URL` - Local Supabase URL (default: http://localhost:54321)
   - GLM API key is configured in Supabase secrets

3. **Database migrations are applied**:
   ```bash
   supabase db reset
   ```

## Running the Tests

```bash
# Run all E2E tests
pnpm vitest tests/e2e/practice-questions.e2e.test.ts --run

# Run with UI
pnpm vitest tests/e2e/practice-questions.e2e.test.ts --ui

# Run specific test suite
pnpm vitest tests/e2e/practice-questions.e2e.test.ts -t "Question Generation" --run
```

## Test Coverage

### 1. Question Generation Tests

#### Test: Generate all three question types
- **Purpose**: Validates that matching, fill-blank, and multiple-choice questions are generated correctly
- **Validates**:
  - All three question types are returned
  - Question structure matches expected format
  - Practice set ID is generated
  - Each question has required properties (id, type, content)

- **Requirements**: 1.1, 2.1, 2.2, 2.3

#### Test: Enforce minimum word count requirement
- **Purpose**: Ensures wordlists with fewer than 4 words are rejected
- **Validates**:
  - Error returned for wordlists with < 4 words
  - Appropriate error message provided
  - No questions generated for insufficient words
- **Requirements**: 1.2

#### Test: Limit questions to maximum of 10 per type
- **Purpose**: Verifies that no more than 10 questions per type are generated
- **Validates**:
  - Each question type has ≤ 10 questions
  - Works correctly with large wordlists (40 words)
  - Questions are properly distributed
- **Requirements**: 1.3

### 2. Practice Session Management Tests

#### Test: Save and retrieve practice session
- **Purpose**: Tests session persistence to database
- **Validates**:
  - Session data is saved correctly
  - Session can be retrieved by session ID
  - Score and completion status are preserved
  - Answer data is stored accurately
- **Requirements**: 6.1, 6.2

#### Test: Handle timer-based sessions
- **Purpose**: Validates timer duration tracking and auto-submit
- **Validates**:
  - Timer duration is recorded
  - Start and end times are accurate
  - Session completes when timer expires
- **Requirements**: 6.3

### 3. Sharing Functionality Tests

#### Test: Generate shareable URL for practice set
- **Purpose**: Tests creation of unique, secure sharing URLs
- **Validates**:
  - Share URL is generated
  - URL is unique and valid
  - Share ID is created in database
- **Requirements**: 7.1

#### Test: Retrieve shared practice set via URL
- **Purpose**: Validates that shared practice sets can be accessed
- **Validates**:
  - Shared practice set can be retrieved by share ID
  - Questions are returned correctly
  - Wordlist name is included
  - No authentication required for access
- **Requirements**: 7.1, 7.2

#### Test: Generate static HTML for offline access
- **Purpose**: Verifies offline-capable HTML export
- **Validates**:
  - HTML document is generated
  - Contains valid HTML structure
  - Includes all practice questions
  - Self-contained (no external dependencies)
- **Requirements**: 7.3

### 4. Performance Tests

#### Test: Generate questions within performance target
- **Purpose**: Validates questions are generated within acceptable time
- **Validates**:
  - Generation completes in < 15 seconds for 10-word wordlist
  - Target: < 10 seconds for 40-word wordlist
  - Performance is consistent
- **Requirements**: 8.1

#### Test: Handle concurrent question generation
- **Purpose**: Tests system behavior under multiple simultaneous requests
- **Validates**:
  - Multiple concurrent requests succeed
  - No race conditions or conflicts
  - Each request returns valid results
- **Requirements**: 8.1

### 5. Error Handling Tests

#### Test: Handle invalid wordlist ID gracefully
- **Purpose**: Tests error handling for non-existent wordlists
- **Validates**:
  - Appropriate error returned
  - Error message is descriptive
  - No server crash or undefined behavior
- **Requirements**: 8.2

#### Test: Handle missing question types
- **Purpose**: Validates default behavior when no types specified
- **Validates**:
  - Either returns error or defaults to all types
  - Behavior is consistent and documented
- **Requirements**: 8.2

#### Test: Handle network timeout gracefully
- **Purpose**: Ensures graceful handling of slow/failed requests
- **Validates**:
  - Request completes within timeout (20 seconds)
  - Timeout errors are handled properly
  - No hanging requests
- **Requirements**: 8.2

### 6. Complete Practice Flow Test

#### Test: Complete full practice workflow
- **Purpose**: Validates entire user journey end-to-end
- **Steps**:
  1. Generate practice questions
  2. Simulate practice session (1 second)
  3. Save session with answers and score
  4. Retrieve session history
  5. Share practice set
- **Validates**:
  - All steps complete successfully
  - Data flows correctly between steps
  - No data loss or corruption
- **Requirements**: All (1.1-8.2)

## Test Data

### Test Wordlist
The tests use a predefined wordlist with 10 English-Chinese word pairs:
- achievement / 成就
- beneficial / 有益的
- collaborate / 合作
- demonstrate / 证明
- efficient / 高效的
- fundamental / 基本的
- generate / 产生
- hypothesis / 假设
- implement / 实施
- justify / 证明合理

### Session Data Format
```typescript
{
  practiceSetId: string
  sessionId: string
  startTime: ISO8601 string
  endTime: ISO8601 string
  timerDuration: number (minutes)
  answers: Record<string, { answer: string, correct: boolean }>
  score: number (0-100)
  completed: boolean
}
```

## Expected Results

### Success Criteria
- All tests pass without errors
- Performance targets are met
- Error handling works as expected
- Data integrity is maintained throughout workflow

### Performance Targets
- Question generation: < 15 seconds for 10-word wordlist
- Session save: < 2 seconds
- History retrieval: < 1 second
- Share URL generation: < 1 second

## Troubleshooting

### Common Issues

#### 1. Supabase not running
**Error**: `Failed to create test wordlist: Connection refused`
**Solution**: Start Supabase with `supabase start`

#### 2. Missing environment variables
**Error**: `VITE_SUPABASE_URL is not defined`
**Solution**: Ensure `.env.local` has correct Supabase URL

#### 3. Database schema mismatch
**Error**: `relation "practice_questions" does not exist`
**Solution**: Run `supabase db reset` to apply migrations

#### 4. GLM API key not configured
**Error**: `GLM API request failed`
**Solution**: Configure GLM API key in Supabase secrets

#### 5. Test timeout
**Error**: `Test timed out after 120000ms`
**Solution**: 
- Check network connectivity
- Verify GLM API is responding
- Increase TEST_TIMEOUT if needed

## Maintenance

### Adding New Tests
1. Follow existing test structure
2. Use descriptive test names
3. Include console.log statements for debugging
4. Clean up test data in afterAll hook
5. Document requirements being tested

### Updating Test Data
- Modify `createTestWordlist()` function
- Ensure minimum 4 words for question generation
- Keep word pairs realistic for better testing

### Performance Benchmarks
Review and update performance targets quarterly based on:
- Average generation times
- User feedback
- Infrastructure changes
