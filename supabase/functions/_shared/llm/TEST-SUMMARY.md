# LLM Service Unit Tests - Summary

## Overview

Comprehensive unit tests have been implemented for the LLM service, covering all core functionality including mocked LLM responses, retry logic with simulated failures, and token counting with metrics logging.

## Test Files Created

### 1. service.test.ts
Tests for the core LLM service (`service.ts`)

**Coverage:**
- ✅ Successful API calls with basic prompts
- ✅ System prompt inclusion
- ✅ Custom maxTokens and temperature configuration
- ✅ Rate limit error handling (429 responses)
- ✅ Token limit exceeded errors (400 responses)
- ✅ Server error handling (500 responses)
- ✅ Timeout error handling
- ✅ Network error handling
- ✅ Invalid response handling (no choices, no content)
- ✅ Latency measurement

**Test Count:** 12 tests

**Key Features Tested:**
- Mocked GLM-Flash API responses
- Error classification (retryable vs non-retryable)
- Request timeout with AbortController
- Response validation
- Token usage tracking
- Latency measurement

### 2. retry.test.ts
Tests for retry logic with exponential backoff (`retry.ts`)

**Coverage:**
- ✅ Success on first attempt (no retry needed)
- ✅ Retry on retryable errors and eventual success
- ✅ Retry exhaustion (all retries fail)
- ✅ Non-retryable error handling (no retry)
- ✅ Non-LLMError handling (no retry)
- ✅ Rate limit error retries
- ✅ Network error retries
- ✅ API error retries (when marked retryable)
- ✅ API error non-retry (when not retryable)
- ✅ Exponential backoff timing
- ✅ Maximum delay cap enforcement
- ✅ Default configuration usage
- ✅ Partial configuration merging
- ✅ Mixed error type handling
- ✅ Stop on non-retryable error

**Test Count:** 15 tests

**Key Features Tested:**
- Exponential backoff calculation (base * multiplier^attempt)
- Maximum delay cap (maxDelayMs)
- Retryable error detection
- Retry count enforcement
- Configuration merging
- Timing verification (delays are applied correctly)

### 3. metrics.test.ts
Tests for metrics logging and aggregation (`metrics.ts`)

**Coverage:**
- ✅ Metrics logging to console
- ✅ Optional field handling (jobId, confidence)
- ✅ Cost calculation (prompt + completion tokens)
- ✅ Zero token cost calculation
- ✅ Large token count cost calculation
- ✅ Single metric aggregation
- ✅ Multiple metrics aggregation
- ✅ Aggregation by agent type (cleaner, extractor, translator)
- ✅ Cost calculation by agent
- ✅ Empty metrics array handling
- ✅ Varying token count handling
- ✅ Average latency calculation per agent
- ✅ All three agent types support
- ✅ Token accumulation

**Test Count:** 14 tests

**Key Features Tested:**
- Console logging format
- Cost calculation formula
- Metrics aggregation (totals, averages)
- Per-agent statistics
- Edge cases (empty arrays, zero tokens)

### 4. index.test.ts
Tests for integration functions (`index.ts`)

**Coverage:**
- ✅ callLLMWithRetry - success without retry
- ✅ callLLMWithRetry - retry on timeout and success
- ✅ callLLMWithRetry - retry exhaustion
- ✅ callLLMWithRetry - non-retryable error handling
- ✅ callLLMWithMetrics - metrics logging on success
- ✅ callLLMWithMetrics - metrics logging on failure
- ✅ callLLMWithMetrics - works without jobId
- ✅ callLLMWithMetrics - retry with custom config
- ✅ callLLMWithMetrics - latency measurement
- ✅ callLLMWithMetrics - all agent types support

**Test Count:** 10 tests

**Key Features Tested:**
- Integration of retry logic with LLM calls
- Metrics logging on both success and failure
- Custom retry configuration
- Agent type tracking (cleaner, extractor, translator)
- JobId tracking (optional)
- Latency measurement in metrics

## Total Test Coverage

- **Total Test Files:** 4
- **Total Tests:** 51
- **Lines of Test Code:** ~800+

## Requirements Coverage

### Requirement 6.2: Processing Performance and Reliability
✅ **Covered:**
- Automatic retry up to 3 times with exponential backoff
- Timeout handling
- Error notification with clear messages
- Retry logic thoroughly tested with simulated failures

### Requirement 9.1: System Observability - LLM Call Logging
✅ **Covered:**
- Prompt, token count, latency, and confidence metrics logging
- All metrics fields tested
- Console logging verified

### Requirement 9.2: System Observability - Token Tracking
✅ **Covered:**
- Total tokens used by each agent tracked
- Token counting tested with various scenarios
- Cost calculation based on token usage

## Running the Tests

### Prerequisites
```bash
# Deno must be installed
# Install from: https://deno.land/
```

### Run All LLM Tests
```bash
deno test --allow-env --allow-net supabase/functions/_shared/llm/
```

### Run Specific Test File
```bash
deno test --allow-env --allow-net supabase/functions/_shared/llm/service.test.ts
deno test --allow-env --allow-net supabase/functions/_shared/llm/retry.test.ts
deno test --allow-env --allow-net supabase/functions/_shared/llm/metrics.test.ts
deno test --allow-env --allow-net supabase/functions/_shared/llm/index.test.ts
```

### Run from Functions Directory
```bash
cd supabase/functions
deno task test _shared/llm/
```

## Test Patterns Used

### 1. Mocking with Stubs
```typescript
const fetchStub = stub(
  globalThis,
  'fetch',
  () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
)
```

### 2. Spy for Verification
```typescript
const consoleSpy = spy(console, 'log')
assertSpyCalls(consoleSpy, 1)
assertSpyCall(consoleSpy, 0, { args: [...] })
```

### 3. Error Simulation
```typescript
const fn = async () => {
  callCount++
  if (callCount < 3) {
    throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
  }
  return 'success'
}
```

### 4. Timing Verification
```typescript
const delays: number[] = []
let lastTime = Date.now()
// ... measure delays between retries
assertEquals(delays[0] >= 100, true)
```

## Mock Data Helpers

### createMockSuccessResponse
Creates a valid GLM-Flash API response for testing:
```typescript
function createMockSuccessResponse(content: string, tokens = 100): GLMAPIResponse
```

### createTestMetrics
Creates test metrics with sensible defaults:
```typescript
function createTestMetrics(overrides: Partial<LLMMetrics> = {}): LLMMetrics
```

## Edge Cases Tested

1. **Empty/Zero Values:** Empty metrics arrays, zero tokens
2. **Large Values:** Large token counts, high latency
3. **Missing Optional Fields:** jobId, confidence, systemPrompt
4. **Error Conditions:** All error codes, retryable vs non-retryable
5. **Timing:** Timeout enforcement, exponential backoff, delay caps
6. **Configuration:** Default config, partial config, custom config

## Next Steps

1. **Integration Testing:** Test LLM service with actual agents (cleaner, extractor, translator)
2. **Database Integration:** Test metrics logging to database (currently console only)
3. **Performance Testing:** Load testing with concurrent requests
4. **E2E Testing:** Full pipeline testing with real documents

## Notes

- All tests use mocked fetch to avoid actual API calls
- Tests are isolated and can run in any order
- Environment variables are set in test setup
- Cleanup (stub.restore()) is done in finally blocks
- Tests verify both success and failure paths
