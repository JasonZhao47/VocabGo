# Design Document

## Overview

This design addresses a critical authentication bug where Supabase Edge Function calls from the frontend fail due to missing Authorization headers. Supabase's infrastructure requires both the `apikey` header and the `Authorization: Bearer <token>` header for successful edge function invocation. The current implementation only includes the `apikey` header, causing all requests to fail with "Missing authorization header" errors.

The fix involves adding the Authorization header to all edge function calls in the frontend service layer and updating tests to verify this behavior.

## Architecture

### Current State

**Frontend Services:**
- `src/services/wordlistService.ts` - Handles wordlist CRUD operations
- `src/services/uploadService.ts` - Handles document upload and processing

**Edge Functions:**
- `supabase/functions/fetch-wordlists/` - Retrieves saved wordlists
- `supabase/functions/save-wordlist/` - Saves new wordlists
- `supabase/functions/delete-wordlist/` - Deletes wordlists
- `supabase/functions/process-document/` - Processes uploaded documents

**Current Request Headers:**
```typescript
{
  'Content-Type': 'application/json',  // POST requests only
  'X-Session-ID': sessionId,
  'apikey': VITE_SUPABASE_ANON_KEY
}
```

**Required Request Headers:**
```typescript
{
  'Content-Type': 'application/json',  // POST requests only
  'X-Session-ID': sessionId,
  'apikey': VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`  // MISSING!
}
```

### Proposed Solution

Add the `Authorization: Bearer <anon_key>` header to all edge function calls in both service files. This is a minimal, surgical fix that doesn't require changes to the edge functions themselves or the database schema.

## Components and Interfaces

### 1. Wordlist Service (`src/services/wordlistService.ts`)

**Functions to Update:**

#### `saveWordlist()`
```typescript
// Current headers
headers: {
  'Content-Type': 'application/json',
  'X-Session-ID': sessionId,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
}

// Updated headers
headers: {
  'Content-Type': 'application/json',
  'X-Session-ID': sessionId,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}
```

#### `fetchWordlists()`
```typescript
// Current headers
headers: {
  'X-Session-ID': sessionId,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
}

// Updated headers
headers: {
  'X-Session-ID': sessionId,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}
```

#### `deleteWordlist()`
```typescript
// Current headers
headers: {
  'Content-Type': 'application/json',
  'X-Session-ID': sessionId,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
}

// Updated headers
headers: {
  'Content-Type': 'application/json',
  'X-Session-ID': sessionId,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}
```

### 2. Upload Service (`src/services/uploadService.ts`)

**Function to Update:**

#### `processDocument()`
```typescript
// Current headers
headers: {
  'Content-Type': 'application/json',
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'X-Session-ID': sessionId,
}

// Updated headers
headers: {
  'Content-Type': 'application/json',
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'X-Session-ID': sessionId,
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}
```

### 3. Optional: Helper Function for Consistent Headers

To reduce duplication and ensure consistency, consider creating a helper function:

```typescript
// src/lib/edgeFunctionHeaders.ts
export function getEdgeFunctionHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Session-ID': getSessionId(),
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }
  
  return headers
}
```

**Decision:** This helper function is optional for the MVP fix. It can be added in a future refactoring if desired, but is not required to solve the immediate bug.

## Data Models

No changes to data models are required. This is purely a client-side header configuration fix.

## Error Handling

### Current Error Behavior
- Edge functions return: `{"msg":"Error: Missing authorization header"}`
- Frontend catches this as a generic HTTP error
- User sees: "An unexpected error occurred"

### Expected Error Behavior After Fix
- Edge functions should process requests successfully
- If other errors occur, they will be properly surfaced through the existing error handling
- Existing error handling in services remains unchanged

### Error Scenarios to Test
1. **Missing Authorization header** - Should be fixed by this implementation
2. **Invalid Authorization token** - Should return appropriate error from Supabase
3. **Network errors** - Existing error handling should work
4. **Invalid session ID** - Existing validation should work
5. **Database errors** - Existing error handling should work

## Testing Strategy

### Unit Tests

#### 1. Wordlist Service Tests (`src/services/wordlistService.test.ts`)

**Test Cases:**

```typescript
describe('saveWordlist', () => {
  it('should include Authorization header in request', async () => {
    // Mock fetch and verify headers include Authorization
  })
  
  it('should successfully save wordlist with proper headers', async () => {
    // Test successful save operation
  })
  
  it('should handle authorization errors gracefully', async () => {
    // Test error handling when auth fails
  })
})

describe('fetchWordlists', () => {
  it('should include Authorization header in request', async () => {
    // Mock fetch and verify headers include Authorization
  })
  
  it('should successfully fetch wordlists with proper headers', async () => {
    // Test successful fetch operation
  })
  
  it('should return empty array when no wordlists exist', async () => {
    // Test empty state handling
  })
})

describe('deleteWordlist', () => {
  it('should include Authorization header in request', async () => {
    // Mock fetch and verify headers include Authorization
  })
  
  it('should successfully delete wordlist with proper headers', async () => {
    // Test successful delete operation
  })
  
  it('should handle deletion of non-existent wordlist', async () => {
    // Test error handling for invalid ID
  })
})
```

#### 2. Upload Service Tests (`src/services/uploadService.test.ts`)

**Test Cases:**

```typescript
describe('processDocument', () => {
  it('should include Authorization header in request', async () => {
    // Mock fetch and verify headers include Authorization
  })
  
  it('should successfully process document with proper headers', async () => {
    // Test successful processing
  })
  
  it('should handle processing errors gracefully', async () => {
    // Test error handling
  })
})
```

### Integration Tests

#### 3. Edge Function Security Tests (`tests/security/edge-function-security.test.ts`)

**Test Cases:**

```typescript
describe('Edge Function Authorization', () => {
  it('should reject requests without Authorization header', async () => {
    // Test that edge functions require Authorization header
  })
  
  it('should accept requests with valid Authorization header', async () => {
    // Test successful requests with proper auth
  })
  
  it('should reject requests with invalid Authorization token', async () => {
    // Test auth validation
  })
})
```

#### 4. End-to-End Tests (`tests/e2e/end-to-end.test.ts`)

**Test Cases:**

```typescript
describe('Wordlist Operations E2E', () => {
  it('should save, fetch, and delete wordlist successfully', async () => {
    // Test complete wordlist lifecycle
  })
  
  it('should process document and save wordlist', async () => {
    // Test document processing flow
  })
})
```

### Manual Testing Checklist

1. **Fetch Wordlists**
   - [ ] Open SavedWordlistsPage
   - [ ] Verify wordlists load without errors
   - [ ] Check browser network tab for Authorization header
   - [ ] Verify no console errors

2. **Save Wordlist**
   - [ ] Process a document
   - [ ] Click "Save Wordlist"
   - [ ] Verify save succeeds
   - [ ] Check network tab for Authorization header
   - [ ] Verify wordlist appears in saved list

3. **Delete Wordlist**
   - [ ] Open SavedWordlistsPage
   - [ ] Click delete on a wordlist
   - [ ] Verify deletion succeeds
   - [ ] Check network tab for Authorization header
   - [ ] Verify wordlist removed from list

4. **Process Document**
   - [ ] Upload a test document
   - [ ] Verify processing completes
   - [ ] Check network tab for Authorization header
   - [ ] Verify wordlist generated correctly

### Curl Testing Commands

```bash
# Test fetch-wordlists
curl -s http://127.0.0.1:54321/functions/v1/fetch-wordlists \
  -H "X-Session-ID: test" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

# Test save-wordlist
curl -s http://127.0.0.1:54321/functions/v1/save-wordlist \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"test","zh":"测试"}]}'

# Test delete-wordlist
curl -s http://127.0.0.1:54321/functions/v1/delete-wordlist \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -d '{"wordlistId":"<uuid>"}'
```

## Implementation Notes

### Priority
This is a **critical bug fix** that blocks all wordlist functionality. It should be implemented immediately.

### Backward Compatibility
- No breaking changes to API contracts
- No database migrations required
- No changes to edge function implementations
- Purely additive change (adding a header)

### Performance Impact
- Negligible - adding one additional header has no measurable performance impact
- No additional network requests
- No additional database queries

### Security Considerations
- The anon key is already exposed in the frontend (by design for Supabase)
- Adding it to the Authorization header doesn't introduce new security risks
- Session-based access control remains enforced by edge functions
- RLS policies on the database remain unchanged

## Rollout Plan

1. **Update Services** - Add Authorization headers to all edge function calls
2. **Update Tests** - Ensure tests verify Authorization headers are present
3. **Manual Testing** - Verify all wordlist operations work end-to-end
4. **Deploy** - No special deployment considerations needed
5. **Monitor** - Check logs for any authorization-related errors

## Future Improvements

1. **Create Header Helper Function** - Reduce duplication across services
2. **Centralized Edge Function Client** - Create a wrapper around fetch for edge functions
3. **Better Error Messages** - Distinguish between auth errors and other failures
4. **Retry Logic** - Add automatic retry for transient auth failures
