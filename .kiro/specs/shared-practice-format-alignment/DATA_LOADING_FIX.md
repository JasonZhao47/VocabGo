# Data Loading Issue Fix

## Problem
Students accessing shared wordlists couldn't see practice questions because the `generate-practice-questions` edge function was rejecting their requests.

## Root Cause
The authorization check in `generate-practice-questions` only allowed wordlist owners to generate questions:

```typescript
// Old code - only checked ownership
if (wordlist.session_id !== sessionId) {
  return unauthorized error
}
```

This failed for students because:
1. Students access shared wordlists via share tokens
2. They have their own session IDs (different from the teacher who created the wordlist)
3. The function rejected their requests as unauthorized

## Solution
Modified the authorization logic to allow both owners AND users accessing shared wordlists:

```typescript
// New code - checks ownership OR shared access
const isOwner = wordlist.session_id === sessionId
const isShared = wordlist.is_shared === true

if (!isOwner && !isShared) {
  return unauthorized error
}
```

## Changes Made
**File:** `supabase/functions/generate-practice-questions/index.ts`

1. Added `is_shared` to the wordlist query
2. Updated authorization logic to allow shared wordlist access
3. Maintained security by still requiring the wordlist to be explicitly shared

## Testing
To verify the fix:

1. Create a wordlist as a teacher
2. Share the wordlist (get share link)
3. Open the share link as a student
4. Enter a nickname
5. Verify that practice questions load correctly

## Security Considerations
- Only wordlists with `is_shared = true` are accessible to non-owners
- Private wordlists remain protected
- No changes to student session authentication
