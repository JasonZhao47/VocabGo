# PDF Memory Issue - Fix Summary

## Problem
Large PDFs (>5MB) crash with "memory limit reached for the worker" error in Supabase Edge Functions.

## Root Cause
- Supabase Edge Functions have ~150MB memory limit per worker
- `pdf-parse` loads entire PDF into memory (12.5MB file → 150-200MB memory usage)
- Memory exhaustion causes worker termination

## Solution Implemented

### 1. Added PDF Size Limit
```typescript
const MAX_PDF_SIZE = 5 * 1024 * 1024 // 5MB limit for server-side PDF processing
```

### 2. Early Rejection for Large PDFs
```typescript
if (documentType === 'pdf' && fileData.length > MAX_PDF_SIZE) {
  return {
    error: {
      code: 'PDF_TOO_LARGE_FOR_SERVER',
      message: 'PDF files larger than 5MB must use client-side extraction',
      recommendation: 'USE_CLIENT_EXTRACTION'
    }
  }
}
```

## Benefits
✅ Prevents memory crashes
✅ Clear error message guides users
✅ Directs to client-side extraction (already supported)
✅ Small PDFs (<5MB) still work server-side

## Next Steps (Frontend)
1. Handle `PDF_TOO_LARGE_FOR_SERVER` error
2. Implement automatic fallback to client-side extraction
3. Show user-friendly message: "Large PDF detected, processing locally..."
4. Use PDF.js to extract text in browser
5. Send extracted text via `extractedText` parameter

## Testing
```bash
# Test with large PDF (should fail gracefully)
curl -X POST http://localhost:54321/functions/v1/process-document \
  -H "Content-Type: application/json" \
  -d '{"file": {"name": "large.pdf", "type": "application/pdf", "data": "..."}}'

# Expected response:
{
  "success": false,
  "error": {
    "code": "PDF_TOO_LARGE_FOR_SERVER",
    "message": "PDF files larger than 5MB must use client-side extraction...",
    "recommendation": "USE_CLIENT_EXTRACTION"
  }
}
```

## Files Modified
- `supabase/functions/process-document/index.ts` - Added PDF size check

## Documentation Created
- `PDF_MEMORY_ISSUE_DIAGNOSIS.md` - Detailed root cause analysis
- `PDF_FIX_SUMMARY.md` - This file
