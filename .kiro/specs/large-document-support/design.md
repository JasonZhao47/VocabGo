# Large Document Support Design

## Overview

This feature moves DOCX text extraction from the Edge Function to the client browser, enabling support for larger DOCX files (up to 5MB) while maintaining backward compatibility with existing PDF/TXT/XLSX processing. The current Edge Function crashes with DOCX files >500KB due to memory constraints when mammoth decompresses the document (~10x expansion).

## Architecture

### Current Flow (Server-Side Extraction)
```
Browser → Base64 Encode File → Edge Function → Parse (mammoth) → AI Pipeline → Response
```

### New Flow (Client-Side DOCX Extraction)
```
Browser → Extract Text (mammoth.js) → Edge Function → AI Pipeline → Response
```

### Hybrid Approach
- **DOCX files**: Client-side extraction using mammoth.js in browser
- **PDF/TXT/XLSX files**: Server-side extraction (unchanged)

This approach:
- Reduces Edge Function memory pressure for DOCX files
- Maintains existing server-side parsing for other formats
- Keeps the API contract stable (Edge Function still receives text and processes it)

## Components and Interfaces

### 1. Client-Side DOCX Extractor

**Location**: `src/services/docxExtractor.ts`

**Purpose**: Extract text from DOCX files in the browser before upload

**Interface**:
```typescript
interface DocxExtractionResult {
  text: string
  metadata: {
    characterCount: number
    extractionTimeMs: number
  }
}

export async function extractDocxText(file: File): Promise<DocxExtractionResult>
```

**Dependencies**:
- `mammoth` npm package (browser-compatible build)
- Browser FileReader API

**Implementation Notes**:
- Use mammoth's `extractRawText()` method for consistency with server-side
- Apply same text processing as server-side parser (trim, normalize whitespace)
- Validate extracted text is not empty
- Track extraction time for monitoring

### 2. Modified Upload Service

**Location**: `src/services/uploadService.ts`

**Changes**:
```typescript
// New interface for pre-extracted text
interface PreExtractedDocument {
  text: string
  filename: string
  documentType: 'docx'
  metadata: {
    characterCount: number
    extractionTimeMs: number
  }
}

// Modified processDocument function
export async function processDocument(file: File): Promise<ProcessResult> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Branch based on file type
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // Client-side extraction for DOCX
    return processDocxWithClientExtraction(file)
  } else {
    // Server-side extraction for other formats (existing logic)
    return processWithServerExtraction(file)
  }
}
```

**New Functions**:
- `processDocxWithClientExtraction(file: File)`: Extract text client-side, send to Edge Function
- `processWithServerExtraction(file: File)`: Existing base64 upload logic (renamed)

### 3. Modified Edge Function

**Location**: `supabase/functions/process-document/index.ts`

**Changes**:
```typescript
// Updated request interface to support both formats
interface ProcessRequest {
  // Option 1: Binary file (existing)
  file?: {
    name: string
    type: string
    data: string // base64 encoded
  }
  // Option 2: Pre-extracted text (new)
  extractedText?: {
    text: string
    filename: string
    documentType: 'docx'
    metadata: {
      characterCount: number
      extractionTimeMs: number
    }
  }
}
```

**Processing Logic**:
```typescript
// Detect request type
if (request.extractedText) {
  // Skip parsing stage, use provided text
  rawText = request.extractedText.text
  documentType = request.extractedText.documentType
  stages.parsing = 0 // Client-side extraction
} else if (request.file) {
  // Existing parsing logic
  rawText = await parseFile(request.file)
  documentType = detectType(request.file.type)
} else {
  throw new Error('Invalid request: must provide file or extractedText')
}

// Continue with AI pipeline (unchanged)
cleanedText = cleanText(rawText)
words = await extract(cleanedText)
translations = await translate(words)
```

**Backward Compatibility**:
- Accept both `file` and `extractedText` in request
- Maintain existing response format
- Keep error codes consistent

### 4. Upload State Management

**Location**: `src/state/uploadState.ts`

**Changes**:
- Add new processing stage: `'extracting-client'` for client-side DOCX extraction
- Update stage progression to include client-side extraction before server processing

**Stage Flow**:
```
DOCX: idle → extracting-client → cleaning → extracting → translating → completed
Other: idle → cleaning → extracting → translating → completed
```

### 5. Processing Modal Updates

**Location**: `src/components/processing/ProcessingModal.vue`

**Changes**:
- Add UI messaging for client-side extraction stage
- Display "Extracting text from document..." for `extracting-client` stage
- Maintain existing stage indicators for server-side processing

## Data Models

### Request Payload (Edge Function)

**Option 1: Binary File (Existing)**
```typescript
{
  file: {
    name: string        // "document.docx"
    type: string        // "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    data: string        // base64 encoded binary
  }
}
```

**Option 2: Pre-Extracted Text (New)**
```typescript
{
  extractedText: {
    text: string        // Extracted plain text
    filename: string    // "document.docx"
    documentType: 'docx'
    metadata: {
      characterCount: number
      extractionTimeMs: number
    }
  }
}
```

### Response Payload (Unchanged)
```typescript
{
  success: boolean
  wordlist?: {
    words: Array<{ en: string; zh: string }>
    filename: string
    documentType: string
    wordCount: number
  }
  error?: {
    code: string
    message: string
  }
  metadata?: {
    processingTimeMs: number
    stages: {
      parsing: number      // 0 for client-side extraction
      cleaning: number
      extraction: number
      translation: number
    }
  }
}
```

## Error Handling

### Client-Side Errors

**File Validation Errors**:
- File size > 5MB: "DOCX files larger than 5MB are not supported"
- Invalid file type: "Unsupported file type. Supported formats: PDF, TXT, DOCX, XLSX"
- No file selected: "No file selected"

**Extraction Errors**:
- Mammoth extraction fails: "Failed to extract text from DOCX file. The file may be corrupted."
- Empty text extracted: "No text content found in document"
- Browser compatibility: "Your browser does not support DOCX processing. Please try a different browser."

### Server-Side Errors (Unchanged)

**Processing Errors**:
- `INVALID_REQUEST`: Missing required fields
- `INVALID_FILE_TYPE`: Unsupported file type
- `FILE_TOO_LARGE`: File exceeds size limit
- `PARSE_FAILED`: Document parsing failed
- `CLEANING_FAILED`: Text cleaning failed
- `EXTRACTION_FAILED`: Word extraction failed
- `TRANSLATION_FAILED`: Translation failed
- `INTERNAL_ERROR`: Unexpected error

### Error Recovery

**Client-Side**:
- Display user-friendly error messages in toast notifications
- Allow user to retry with a different file
- Clear error state when new file is selected

**Server-Side**:
- Return consistent error format with code and message
- Log detailed errors for debugging
- Maintain error state in upload state management

## Testing Strategy

### Unit Tests

**Client-Side Extraction** (`src/services/docxExtractor.test.ts`):
- ✓ Successfully extracts text from valid DOCX
- ✓ Handles corrupted DOCX files gracefully
- ✓ Validates extracted text is not empty
- ✓ Returns correct metadata (character count, timing)
- ✓ Handles browser API errors

**Upload Service** (`src/services/uploadService.test.ts`):
- ✓ Routes DOCX files to client-side extraction
- ✓ Routes other files to server-side extraction
- ✓ Validates file size limits (5MB for DOCX)
- ✓ Handles extraction errors
- ✓ Sends correct payload format to Edge Function

**Edge Function** (`supabase/functions/process-document/index.test.ts`):
- ✓ Accepts pre-extracted text payload
- ✓ Accepts binary file payload (backward compatibility)
- ✓ Rejects invalid payloads
- ✓ Processes pre-extracted text through AI pipeline
- ✓ Returns consistent response format

### Integration Tests

**End-to-End DOCX Upload** (`tests/e2e/large-document-upload.test.ts`):
- ✓ Upload small DOCX (<500KB) - client-side extraction
- ✓ Upload large DOCX (1-5MB) - client-side extraction
- ✓ Upload DOCX >5MB - rejected with error
- ✓ Verify wordlist generated correctly
- ✓ Verify processing stages displayed correctly

**Backward Compatibility** (`tests/e2e/backward-compatibility.test.ts`):
- ✓ PDF upload still works (server-side)
- ✓ TXT upload still works (server-side)
- ✓ XLSX upload still works (server-side)
- ✓ Response format unchanged
- ✓ Error codes unchanged

### Manual Testing

**Browser Compatibility**:
- Test in Chrome, Firefox, Safari, Edge
- Verify mammoth.js works in all browsers
- Test with various DOCX file sizes

**Performance Testing**:
- Measure client-side extraction time for various file sizes
- Compare total processing time vs. server-side approach
- Monitor browser memory usage during extraction

**User Experience**:
- Verify loading indicators display correctly
- Test error messages are clear and actionable
- Ensure smooth transition between processing stages

## Implementation Notes

### Mammoth.js Integration

**Browser Build**:
- Use mammoth's browser-compatible build from npm
- Import via ES modules: `import mammoth from 'mammoth'`
- Bundle with Vite (no special configuration needed)

**API Usage**:
```typescript
// Read file as ArrayBuffer
const arrayBuffer = await file.arrayBuffer()

// Extract text
const result = await mammoth.extractRawText({ arrayBuffer })
const text = result.value
```

### File Size Limits

**DOCX Files**:
- Client-side limit: 5MB (configurable)
- Rationale: Browser memory is more abundant than Edge Function memory
- User-friendly error message if exceeded

**Other Files**:
- Server-side limit: 50MB (unchanged)
- DOCX-specific limit removed from Edge Function

### Performance Considerations

**Client-Side Extraction**:
- Extraction happens in main thread (mammoth.js is synchronous)
- Show loading indicator during extraction
- Typical extraction time: 100-500ms for 1-5MB files

**Network Transfer**:
- Text payload is smaller than binary payload for most documents
- Example: 5MB DOCX → ~500KB text (10x reduction)
- Faster upload, less bandwidth usage

### Migration Path

**Phase 1: Add Client-Side Extraction**
- Implement client-side DOCX extractor
- Update upload service to use client-side extraction for DOCX
- Update Edge Function to accept pre-extracted text
- Deploy both frontend and backend together

**Phase 2: Monitor and Optimize**
- Monitor extraction success rates
- Track processing times
- Gather user feedback
- Optimize extraction performance if needed

**Phase 3: Consider Expanding**
- Evaluate client-side extraction for other formats (PDF, XLSX)
- Consider Web Workers for background extraction
- Explore streaming extraction for very large files

## Security Considerations

**Client-Side Extraction**:
- Extraction happens in browser sandbox (safe)
- No server-side code execution risk
- Mammoth.js is a trusted, well-maintained library

**Input Validation**:
- Validate file type before extraction
- Validate file size before extraction
- Validate extracted text is not empty
- Sanitize text before sending to server (Edge Function handles this)

**Server-Side Validation**:
- Edge Function still validates all inputs
- Reject requests with both `file` and `extractedText`
- Validate text length to prevent abuse
- Maintain existing security measures

## Accessibility

**Processing Feedback**:
- Screen reader announcements for processing stages
- Clear error messages for assistive technologies
- Keyboard-accessible error recovery

**Visual Indicators**:
- Loading spinners with ARIA labels
- Progress indicators for each stage
- High-contrast error messages

## Performance Metrics

**Client-Side**:
- Extraction time (target: <500ms for 5MB files)
- Browser memory usage (monitor for leaks)
- Success rate (target: >99%)

**Server-Side**:
- Processing time (should be similar to current)
- Memory usage (should decrease for DOCX)
- Error rate (should remain low)

**End-to-End**:
- Total time from upload to wordlist (target: <30s for 30-page docs)
- User satisfaction (gather feedback)
- Support ticket volume (should decrease)
