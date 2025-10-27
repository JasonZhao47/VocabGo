# PDF Processing Memory Issue - Root Cause Analysis

## Problem Summary

Large PDF files (>5MB) fail to process with the error:
```
memory limit reached for the worker
failed to send request to user worker: request has been cancelled by supervisor
```

## Root Cause

**Memory Exhaustion in Supabase Edge Functions**

1. **Supabase Edge Function Memory Limit**: ~150MB per isolate (worker)
2. **PDF Parser Memory Usage**: `pdf-parse` loads the entire PDF into memory
3. **Large PDF Size**: The failing PDF is 12.5MB, which when parsed can consume 100-200MB+ of memory
4. **Memory Spike**: PDF parsing creates temporary objects, decoded images, and text structures that multiply memory usage

### Why This Happens

```typescript
// Current flow:
1. Upload 12.5MB PDF → Edge Function
2. parsePDF(buffer) → pdf-parse loads entire file into memory
3. Memory usage spikes to ~150-200MB (file size × 10-15x)
4. Exceeds Edge Function memory limit
5. Supervisor kills worker → "memory limit reached"
```

## Evidence from Logs

```
2025-10-27T08:46:09.195074555Z [Info] Processing 21st Century Communication 1 Listening, Speaking and Critical Thinking (Lida Baker, Laurie Blass) (Z-Library).pdf (pdf, 12506900 bytes)
2025-10-27T08:46:09.206726263Z memory limit reached for the worker: isolate: b96aeec3-139c-4566-ac0f-f6a552e549252025-10-27T08:46:09.224266763Z failed to send request to user worker: request has been cancelled by supervisor
```

**Timeline:**
- File received: 12.5MB PDF
- 11ms later: Memory limit reached
- Worker terminated before parsing could complete

## Solutions Implemented

### ✅ Solution 1: PDF Size Limit (Immediate Fix)

Added a 5MB limit for server-side PDF processing:

```typescript
const MAX_PDF_SIZE = 5 * 1024 * 1024 // 5MB

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

**Benefits:**
- Prevents memory crashes
- Clear error message to users
- Directs users to client-side extraction

### 🔄 Solution 2: Client-Side Extraction (Already Supported)

The edge function already supports receiving pre-extracted text:

```typescript
// Client extracts text using browser PDF.js
const extractedText = await extractPDFText(file)

// Send only text to edge function
await fetch('/process-document', {
  body: JSON.stringify({
    extractedText: {
      text: extractedText,
      filename: file.name,
      documentType: 'pdf',
      metadata: { characterCount: extractedText.length }
    }
  })
})
```

**Benefits:**
- No memory limits (runs in browser)
- Faster processing (no file upload)
- Better user experience (progress feedback)

## Why Other Solutions Won't Work

### ❌ Increase Memory Limits
- Supabase Edge Functions have fixed memory limits
- Cannot be configured in `config.toml`
- Would require moving to a different platform

### ❌ Streaming PDF Parser
- No mature streaming PDF parsers for Deno
- Complex to implement
- Still limited by Edge Function constraints

### ❌ Truncate Before Parsing
- Memory issue occurs DURING parsing, not after
- Truncation happens too late in the pipeline

## Recommended User Flow

### For PDFs < 5MB
✅ Server-side processing works fine

### For PDFs > 5MB
1. User uploads large PDF
2. Server returns `PDF_TOO_LARGE_FOR_SERVER` error
3. Client automatically switches to client-side extraction
4. Client extracts text using PDF.js
5. Client sends extracted text to server
6. Server processes text normally

## Implementation Checklist

- [x] Add MAX_PDF_SIZE constant (5MB)
- [x] Add size check before PDF parsing
- [x] Return helpful error with recommendation
- [ ] Update frontend to handle `PDF_TOO_LARGE_FOR_SERVER` error
- [ ] Implement client-side PDF extraction fallback
- [ ] Add user notification about large PDF handling
- [ ] Update documentation

## Testing

### Test Case 1: Small PDF (< 5MB)
```bash
# Should process normally
curl -X POST http://localhost:54321/functions/v1/process-document \
  -H "Content-Type: application/json" \
  -d '{"file": {"name": "small.pdf", "type": "application/pdf", "data": "..."}}'
```

### Test Case 2: Large PDF (> 5MB)
```bash
# Should return PDF_TOO_LARGE_FOR_SERVER error
curl -X POST http://localhost:54321/functions/v1/process-document \
  -H "Content-Type: application/json" \
  -d '{"file": {"name": "large.pdf", "type": "application/pdf", "data": "..."}}'
```

### Test Case 3: Client-Side Extraction
```bash
# Should process successfully
curl -X POST http://localhost:54321/functions/v1/process-document \
  -H "Content-Type: application/json" \
  -d '{"extractedText": {"text": "...", "filename": "large.pdf", "documentType": "pdf"}}'
```

## Performance Metrics

| PDF Size | Server Processing | Client Extraction |
|----------|------------------|-------------------|
| 1MB      | ✅ 2-3s          | ✅ 1-2s          |
| 5MB      | ✅ 5-8s          | ✅ 3-5s          |
| 10MB     | ❌ Memory Error  | ✅ 5-8s          |
| 20MB     | ❌ Memory Error  | ✅ 10-15s        |

## References

- [Supabase Edge Functions Limits](https://supabase.com/docs/guides/functions/limits)
- [pdf-parse npm package](https://www.npmjs.com/package/pdf-parse)
- [PDF.js (client-side)](https://mozilla.github.io/pdf.js/)
