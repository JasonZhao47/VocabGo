# Practice Question Generation Timeout Issue

## Problem
Practice question generation is failing with timeout errors:
```
Error: Failed to generate multiple choice questions: Request timeout after 30000ms
```

## Root Cause
The GLM API (`open.bigmodel.cn`) is taking longer than 30 seconds to respond when generating multiple choice questions for 20 words.

## Why This Happens
1. **API Latency**: The GLM API server may be experiencing high load or slow response times
2. **Network Distance**: Connection from your location to `open.bigmodel.cn` (China) may have high latency
3. **Request Complexity**: Generating contextual multiple choice questions requires more AI processing than simple translations

## Solutions Implemented

### 1. Increased Timeout (Quick Fix)
Changed timeout from 30 seconds to 60 seconds:
```typescript
timeoutMs: 60000 // Was 30000
```

This gives the API more time to respond.

### 2. Recommendations

**Short-term:**
- Try again - API performance varies
- Generate fewer questions (reduce `maxQuestionsPerType` from 10 to 5)
- Skip multiple choice questions temporarily (only use matching and fill-blank)

**Long-term:**
- Consider using a different LLM API with better latency (OpenAI, Anthropic, etc.)
- Implement question generation in smaller batches
- Add caching for generated questions (already implemented)
- Use a CDN or proxy closer to your location

## Testing
Try generating practice questions again. With the 60-second timeout, it should work unless the API is extremely slow.

If it still times out:
1. Check your internet connection
2. Try with fewer words (< 10)
3. Try during off-peak hours for China timezone
4. Consider switching to a different LLM provider

## Alternative: Skip Multiple Choice
If timeouts persist, you can temporarily disable multiple choice questions by modifying the default question types in `generate-practice-questions/index.ts`:

```typescript
const DEFAULT_QUESTION_TYPES = [
  'matching',
  'fill-blank',
  // 'multiple-choice', // Temporarily disabled due to timeout issues
]
```

Matching and fill-blank questions are generated locally without API calls, so they won't timeout.
