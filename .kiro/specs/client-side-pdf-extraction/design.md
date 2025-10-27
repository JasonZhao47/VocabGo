# Client-Side PDF Extraction - Design

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│             │
│  ┌───────┐  │     ┌──────────────┐
│  │ User  │  │────▶│ Select PDF   │
│  │       │  │     │  (>5MB)      │
│  └───────┘  │     └──────┬───────┘
│             │            │
│             │            ▼
│  ┌──────────────────────────┐
│  │  PDF Size Detection      │
│  │  (in useUpload)          │
│  └──────────┬───────────────┘
│             │
│             ▼
│  ┌──────────────────────────┐
│  │  Load PDF.js (lazy)      │
│  └──────────┬───────────────┘
│             │
│             ▼
│  ┌──────────────────────────┐
│  │  Extract Text            │
│  │  (pdfExtractor.ts)       │
│  │  - Page by page          │
│  │  - Progress updates      │
│  │  - Memory management     │
│  └──────────┬───────────────┘
│             │
│             ▼
│  ┌──────────────────────────┐
│  │  Send extractedText      │
│  │  to Edge Function        │
│  └──────────┬───────────────┘
└─────────────┘            │
                           ▼
              ┌────────────────────────┐
              │  Supabase Edge Fn      │
              │  process-document      │
              │  - Receives text       │
              │  - Chunks if needed    │
              │  - AI processing       │
              └────────────────────────┘
```

## Component Design

### 1. PDF Extractor Service (`src/services/pdfExtractor.ts`)

Core service for client-side PDF text extraction using PDF.js.

```typescript
interface PDFExtractionOptions {
  onProgress?: (progress: PDFExtractionProgress) => void
  signal?: AbortSignal
}

interface PDFExtractionProgress {
  currentPage: number
  totalPages: number
  extractedChars: number
  estimatedTimeMs: number
}

interface PDFExtractionResult {
  text: string
  metadata: {
    pageCount: number
    characterCount: number
    extractionTimeMs: number
  }
}

class PDFExtractor {
  async extractText(
    file: File,
    options?: PDFExtractionOptions
  ): Promise<PDFExtractionResult>
  
  private async loadPDFJS(): Promise<void>
  private async extractPageText(page: any): Promise<string>
  private cleanup(): void
}
```

**Key Features:**
- Lazy-loads PDF.js from CDN
- Extracts text page-by-page to minimize memory
- Provides progress callbacks
- Supports cancellation via AbortSignal
- Cleans up resources after extraction

### 2. Upload Composable Enhancement (`src/composables/useUpload.ts`)

Enhance existing upload logic to detect large PDFs and trigger client-side extraction.

```typescript
// Add to useUpload.ts

const PDF_SIZE_THRESHOLD = 5 * 1024 * 1024 // 5MB

async function handleFileUpload(file: File) {
  // Existing validation...
  
  // NEW: Check if PDF needs client-side extraction
  if (file.type === 'application/pdf' && file.size > PDF_SIZE_THRESHOLD) {
    await handleLargePDFExtraction(file)
    return
  }
  
  // Existing server-side upload logic...
}

async function handleLargePDFExtraction(file: File) {
  const uploadId = generateUploadId()
  
  // Add to queue with "extracting" status
  addToQueue({
    id: uploadId,
    filename: file.name,
    status: 'extracting',
    progress: 0
  })
  
  try {
    // Extract text with progress updates
    const result = await pdfExtractor.extractText(file, {
      onProgress: (progress) => {
        updateProgress(uploadId, {
          status: 'extracting',
          progress: (progress.currentPage / progress.totalPages) * 100,
          message: `Extracting page ${progress.currentPage} of ${progress.totalPages}...`
        })
      }
    })
    
    // Update status to processing
    updateProgress(uploadId, {
      status: 'processing',
      progress: 0,
      message: 'Analyzing text...'
    })
    
    // Send extracted text to server
    await processExtractedText(uploadId, file.name, result)
    
  } catch (error) {
    handleExtractionError(uploadId, error)
  }
}
```

### 3. Processing Modal Enhancement (`src/components/processing/ProcessingModal.vue`)

Update modal to show extraction progress distinctly from processing progress.

```vue
<template>
  <div v-if="item.status === 'extracting'" class="extraction-progress">
    <div class="flex items-center gap-2 mb-2">
      <FileText class="w-4 h-4 text-blue-500" />
      <span class="text-sm text-gray-600">
        Extracting PDF text locally...
      </span>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${item.progress}%` }"
      />
    </div>
    
    <p class="text-xs text-gray-500 mt-1">
      {{ item.message }}
    </p>
  </div>
  
  <!-- Existing processing UI... -->
</template>
```

### 4. Error Handling

```typescript
// src/services/pdfExtractor.ts

class PDFExtractionError extends Error {
  constructor(
    message: string,
    public code: PDFErrorCode,
    public userMessage: string
  ) {
    super(message)
    this.name = 'PDFExtractionError'
  }
}

enum PDFErrorCode {
  LOAD_FAILED = 'LOAD_FAILED',
  PARSE_FAILED = 'PARSE_FAILED',
  ENCRYPTED = 'ENCRYPTED',
  CORRUPTED = 'CORRUPTED',
  CANCELLED = 'CANCELLED',
  MEMORY_ERROR = 'MEMORY_ERROR'
}

const ERROR_MESSAGES: Record<PDFErrorCode, string> = {
  LOAD_FAILED: 'Unable to load PDF library. Please check your connection.',
  PARSE_FAILED: 'Unable to read PDF file. The file may be corrupted.',
  ENCRYPTED: 'Password-protected PDFs are not supported.',
  CORRUPTED: 'PDF file appears to be corrupted. Please try a different file.',
  CANCELLED: 'PDF extraction was cancelled.',
  MEMORY_ERROR: 'PDF is too large to process. Please try a smaller file.'
}
```

## Data Flow

### Happy Path: Large PDF Upload

```
1. User selects 10MB PDF
   ↓
2. useUpload detects size > 5MB
   ↓
3. Add to queue with status="extracting"
   ↓
4. Load PDF.js from CDN (if not loaded)
   ↓
5. Open PDF document
   ↓
6. For each page (1 to N):
   - Extract text from page
   - Append to accumulated text
   - Update progress: "Extracting page X of N..."
   - Check for cancellation
   ↓
7. Cleanup PDF.js resources
   ↓
8. Update status to "processing"
   ↓
9. Send POST to /process-document with:
   {
     extractedText: {
       text: "...",
       filename: "document.pdf",
       documentType: "pdf",
       metadata: {
         characterCount: 50000,
         extractionTimeMs: 3500
       }
     }
   }
   ↓
10. Server processes text (existing logic)
    ↓
11. Return wordlist to client
    ↓
12. Update queue item with results
```

### Error Path: Encrypted PDF

```
1. User selects encrypted PDF
   ↓
2. useUpload detects size > 5MB
   ↓
3. Add to queue with status="extracting"
   ↓
4. Load PDF.js
   ↓
5. Attempt to open PDF
   ↓
6. PDF.js throws "password required" error
   ↓
7. Catch error, identify as ENCRYPTED
   ↓
8. Update queue item:
   status="failed"
   error="Password-protected PDFs are not supported."
   ↓
9. Show error in ProcessingModal
   ↓
10. User can dismiss and try another file
```

## Implementation Strategy

### Phase 1: Core Extraction (Priority: High)
- [ ] Create `pdfExtractor.ts` service
- [ ] Implement PDF.js lazy loading
- [ ] Implement page-by-page extraction
- [ ] Add progress callbacks
- [ ] Add error handling

### Phase 2: Integration (Priority: High)
- [ ] Update `useUpload.ts` to detect large PDFs
- [ ] Add extraction flow to upload queue
- [ ] Send extracted text to server
- [ ] Handle extraction errors

### Phase 3: UI Enhancement (Priority: Medium)
- [ ] Update ProcessingModal for extraction status
- [ ] Add extraction progress indicator
- [ ] Add cancellation support
- [ ] Improve error messages

### Phase 4: Testing & Polish (Priority: Medium)
- [ ] Unit tests for pdfExtractor
- [ ] Integration tests for upload flow
- [ ] E2E tests for large PDF upload
- [ ] Cross-browser testing
- [ ] Performance optimization

## Technical Decisions

### Decision 1: PDF.js vs Alternatives

**Chosen:** PDF.js (Mozilla)

**Rationale:**
- Industry standard (used by Firefox, Chrome PDF viewer)
- Well-maintained and actively developed
- Excellent browser compatibility
- Comprehensive documentation
- MIT license

**Alternatives Considered:**
- pdf-lib: Focused on PDF creation, not text extraction
- pdfmake: PDF generation only
- Native browser APIs: Limited text extraction capabilities

### Decision 2: CDN vs Bundled

**Chosen:** CDN with bundled fallback

**Rationale:**
- Reduces main bundle size
- Faster initial page load
- Only loaded when needed
- Fallback ensures reliability

```typescript
async loadPDFJS() {
  try {
    // Try CDN first
    await loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')
  } catch {
    // Fallback to bundled version
    await import('pdfjs-dist/build/pdf')
  }
}
```

### Decision 3: Worker vs Main Thread

**Chosen:** Worker mode

**Rationale:**
- Prevents UI blocking
- Better performance for large PDFs
- Recommended by PDF.js docs

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
```

### Decision 4: Memory Management

**Chosen:** Incremental page processing with cleanup

**Rationale:**
- Minimizes memory footprint
- Prevents browser crashes
- Allows progress feedback

```typescript
for (let i = 1; i <= numPages; i++) {
  const page = await pdf.getPage(i)
  const text = await extractPageText(page)
  accumulatedText += text
  
  // Release page resources
  page.cleanup()
  
  // Update progress
  onProgress?.({ currentPage: i, totalPages: numPages })
}

// Release document resources
pdf.cleanup()
pdf.destroy()
```

## Performance Considerations

### Bundle Size
- PDF.js core: ~400KB (gzipped)
- PDF.js worker: ~1.5MB (loaded separately)
- Our code: ~5KB
- **Total impact on main bundle: ~5KB** (PDF.js lazy-loaded)

### Extraction Speed
- Typical: 100-200ms per page
- 30-page PDF: 3-6 seconds
- 100-page PDF: 10-20 seconds

### Memory Usage
- Peak: ~50MB for 10MB PDF
- Incremental processing keeps it manageable
- Cleanup after each page reduces footprint

## Security Considerations

1. **File Validation:** Verify file type before extraction
2. **Size Limits:** Enforce 50MB maximum
3. **Timeout:** 60-second extraction timeout
4. **Sanitization:** Server still validates extracted text
5. **CSP:** Allow PDF.js CDN in Content Security Policy

## Monitoring & Metrics

Track these metrics for analysis:

```typescript
interface ExtractionMetrics {
  fileSize: number
  pageCount: number
  extractionTimeMs: number
  characterCount: number
  errorCode?: string
  browser: string
  cancelled: boolean
}
```

## Rollout Plan

1. **Development:** Implement and test locally
2. **Staging:** Deploy to staging, test with real PDFs
3. **Beta:** Enable for 10% of users, monitor metrics
4. **Full Release:** Enable for all users if metrics are good
5. **Fallback:** Keep server-side extraction for small PDFs

## Success Metrics

- ✅ 0 server memory errors for large PDFs
- ✅ < 30s extraction time for 30-page PDFs
- ✅ > 95% extraction success rate
- ✅ < 5% user cancellation rate
- ✅ Works in Chrome, Firefox, Safari, Edge
