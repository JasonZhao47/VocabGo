# Client-Side PDF Extraction - Requirements

## Problem Statement

Large PDF files (>5MB) cause memory exhaustion in Supabase Edge Functions, resulting in worker termination. The current server-side PDF parser (`pdf-parse`) loads entire PDFs into memory, which exceeds the ~150MB isolate limit for large documents.

## Root Cause

- Supabase Edge Functions have fixed memory limits (~150MB per worker)
- `pdf-parse` loads entire PDF into memory during parsing
- A 12.5MB PDF can consume 150-200MB of memory when parsed
- Memory spike occurs during parsing, before text truncation can help

## Solution: Client-Side PDF Extraction

Extract PDF text in the browser using PDF.js, then send only the extracted text to the server. This approach:

- Eliminates server memory constraints (browser has GBs available)
- Reduces network transfer (text is smaller than binary PDF)
- Provides better UX with progress feedback
- Follows industry standard (used by Google Docs, Dropbox, etc.)

## Requirements

### Functional Requirements

#### FR1: Automatic Detection
- System MUST detect when a PDF file exceeds 5MB
- System MUST automatically switch to client-side extraction for large PDFs
- User SHOULD see a clear message: "Large PDF detected, processing locally..."

#### FR2: Client-Side Extraction
- System MUST use PDF.js library to extract text in browser
- System MUST extract text from all pages
- System MUST handle extraction errors gracefully
- System MUST show progress during extraction (e.g., "Extracting page 5 of 30...")

#### FR3: Server Integration
- System MUST send extracted text via existing `extractedText` parameter
- System MUST include metadata: filename, character count, extraction time
- Server MUST process extracted text identically to server-extracted text
- System MUST maintain existing chunk-based processing for large texts

#### FR4: Error Handling
- System MUST handle PDF.js loading failures
- System MUST handle corrupted/encrypted PDFs
- System MUST provide fallback error messages
- System MUST allow user to retry or cancel

#### FR5: User Experience
- System MUST show extraction progress (page X of Y)
- System MUST show estimated time remaining
- System MUST allow cancellation during extraction
- System MUST maintain existing upload UI patterns

### Non-Functional Requirements

#### NFR1: Performance
- Extraction SHOULD complete within 30 seconds for 30-page PDFs
- UI MUST remain responsive during extraction
- Progress updates MUST occur at least every 500ms

#### NFR2: Compatibility
- Solution MUST work in Chrome, Firefox, Safari, Edge
- Solution MUST work on desktop and mobile browsers
- Solution MUST handle PDFs up to 50MB

#### NFR3: Bundle Size
- PDF.js SHOULD be lazy-loaded (not in main bundle)
- Total bundle size increase SHOULD be < 500KB

#### NFR4: Maintainability
- Code MUST follow existing patterns in `src/services/`
- Code MUST include TypeScript types
- Code MUST include unit tests

## User Stories

### US1: Large PDF Upload
**As a** user  
**I want to** upload a large PDF (>5MB)  
**So that** I can generate wordlists from textbooks and long documents

**Acceptance Criteria:**
- User selects a 10MB PDF file
- System detects file size and shows "Large PDF detected, processing locally..."
- System extracts text in browser with progress indicator
- System sends extracted text to server
- Wordlist is generated successfully

### US2: Extraction Progress
**As a** user  
**I want to** see extraction progress  
**So that** I know the system is working and how long it will take

**Acceptance Criteria:**
- Progress shows "Extracting page 5 of 30..."
- Progress bar updates smoothly
- Estimated time remaining is displayed
- User can cancel extraction

### US3: Extraction Error
**As a** user  
**I want to** receive clear error messages  
**So that** I understand what went wrong and what to do next

**Acceptance Criteria:**
- Corrupted PDF shows: "Unable to read PDF file. Please try a different file."
- Encrypted PDF shows: "Password-protected PDFs are not supported."
- Network error shows: "Connection lost. Please try again."
- User can dismiss error and try another file

## Technical Constraints

### TC1: Existing Infrastructure
- MUST use existing `extractedText` parameter in `process-document` edge function
- MUST maintain compatibility with server-side PDF extraction for small files
- MUST not break existing DOCX client-side extraction

### TC2: Library Choice
- MUST use Mozilla PDF.js (industry standard, well-maintained)
- SHOULD use CDN version for lazy loading
- MUST use worker mode for better performance

### TC3: Memory Management
- MUST release PDF.js resources after extraction
- MUST handle browser memory limits gracefully
- SHOULD process pages incrementally to minimize memory usage

## Success Criteria

1. ✅ PDFs up to 50MB can be processed successfully
2. ✅ No server memory errors for large PDFs
3. ✅ Extraction completes in < 30s for 30-page PDFs
4. ✅ User sees clear progress feedback
5. ✅ Error messages are helpful and actionable
6. ✅ Works across all major browsers
7. ✅ Bundle size increase < 500KB
8. ✅ Code coverage > 80%

## Out of Scope

- OCR for scanned PDFs (text-based PDFs only)
- Password-protected PDF support
- PDF form field extraction
- Image extraction from PDFs
- Server-side streaming PDF parsing (not feasible)

## Dependencies

- PDF.js library (Mozilla)
- Existing `extractedText` parameter support (already implemented)
- Existing chunk-based processing (already implemented)

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| PDF.js CDN unavailable | High | Low | Bundle fallback version |
| Browser memory limits | Medium | Low | Incremental page processing |
| Encrypted PDFs | Low | Medium | Clear error message |
| Slow extraction on mobile | Medium | Medium | Show progress, allow cancel |

## References

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Existing DOCX Extraction](src/services/docxExtractor.ts)
- [Process Document Edge Function](supabase/functions/process-document/index.ts)
- [PDF Memory Issue Diagnosis](.kiro/specs/chunk-based-wordlist-generation/PDF_MEMORY_ISSUE_DIAGNOSIS.md)
