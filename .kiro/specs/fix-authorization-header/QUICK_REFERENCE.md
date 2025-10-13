# Quick Reference - Authorization Header Fix

## What Changed

Created `supabase/functions/_shared/auth.ts` with utilities for:
- ✅ Graceful session ID extraction
- ✅ Health check detection
- ✅ Standardized error responses

Updated all 12 edge functions to use these utilities.

## Key Functions

### `getSessionId(req: Request): AuthResult`
Extracts and validates session ID from request headers.

**Returns:**
```typescript
{
  sessionId: string | null,
  isValid: boolean,
  error?: string
}
```

### `isHealthCheck(req: Request): boolean`
Detects monitoring/health check requests.

### `createUnauthorizedResponse(message?: string): Response`
Returns standardized 401 response.

### `createHealthCheckResponse(): Response`
Returns 200 OK with health status.

## Usage Pattern

```typescript
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle health checks
  if (isHealthCheck(req)) {
    return createHealthCheckResponse()
  }

  try {
    // Validate session
    const auth = getSessionId(req)
    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error)
    }

    const sessionId = auth.sessionId
    
    // ... rest of function logic
  } catch (error) {
    // ... error handling
  }
})
```

## Before vs After

### Before
```typescript
const sessionId = req.headers.get('X-Session-ID')
if (!sessionId) {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Session ID required' }
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  )
}
```

### After
```typescript
const auth = getSessionId(req)
if (!auth.isValid || !auth.sessionId) {
  return createUnauthorizedResponse(auth.error)
}
const sessionId = auth.sessionId
```

## Benefits

1. **Cleaner Code** - Less boilerplate
2. **Consistent Errors** - Same format everywhere
3. **Health Checks** - Platform monitoring works
4. **Better Logging** - Clear error messages
5. **Maintainable** - Single source of truth

## Testing

### Health Check
```bash
curl https://your-project.supabase.co/functions/v1/save-wordlist
# → {"status": "healthy", "timestamp": "..."}
```

### Missing Auth
```bash
curl -X POST https://your-project.supabase.co/functions/v1/save-wordlist \
  -H "Content-Type: application/json"
# → {"success": false, "error": {"code": "UNAUTHORIZED", ...}}
```

### Valid Request
```bash
curl -X POST https://your-project.supabase.co/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: abc123" \
  -d '{"filename": "test.pdf", "documentType": "pdf", "words": [...]}'
# → {"success": true, "wordlistId": "..."}
```

## Deployment

```bash
cd supabase
supabase functions deploy
```

## Monitoring

Watch for these in logs:
- ✅ No "Missing authorization header" errors
- ✅ Health checks returning 200
- ✅ Clear 401 responses for invalid auth

---

**Quick Deploy:** `cd supabase && supabase functions deploy`
**Quick Test:** `curl https://your-project.supabase.co/functions/v1/save-wordlist`
**Quick Logs:** `supabase functions logs --follow`
