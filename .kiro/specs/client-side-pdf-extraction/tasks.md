# Implementation Plan

- [-] 1. Create PDF extraction service
  - Create `src/services/pdfExtractor.ts` with core extraction logic
  - Implement PDF.js lazy loading from CDN with bundled fallback
  - Implement page-by-page text extraction with memory cleanup
  - Add progress callback support with current page and total pages
  - Add AbortSignal support for cancellation
  - Implement comprehensive error handling with user-friendly messages
  - _Requirements: FR2.1, FR2.2, FR2.3, FR4.1, FR4.2, NFR2.1, NFR3.1_

- [ ] 2. Integrate PDF extraction into upload flow
- [ ] 2.1 Add large PDF detection to useUpload composable
  - Add 5MB threshold constant for PDF size detection
  - Implement file size check in `handleFileUpload` function
  - Route large PDFs to client-side extraction flow
  - Maintain existing server-side upload for small PDFs
  - _Requirements: FR1.1, FR1.2, TC1.1, TC1.3_

- [ ] 2.2 Implement client-side extraction workflow
  - Create `handleLargePDFExtraction` function in useUpload
  - Add upload item to queue with "extracting" status
  - Call pdfExtractor with progress callbacks
  - Update queue item progress during extraction
  - Handle extraction completion and errors
  - _Requirements: FR2.1, FR2.2, FR3.1, FR5.1_

- [ ] 2.3 Send extracted text to server
  - Format extracted text with metadata for server
  - Send POST request to process-document edge function
  - Include filename, character count, and extraction time
  - Update queue item status to "processing" after sending
  - Handle server response and update queue with results
  - _Requirements: FR3.1, FR3.2, FR3.3_

- [ ] 3. Enhance ProcessingModal for extraction status
  - Add UI for "extracting" status distinct from "processing"
  - Display extraction progress with page numbers (e.g., "Extracting page 5 of 30...")
  - Show progress bar for extraction phase
  - Add visual indicator for local processing (e.g., FileText icon)
  - Display user-friendly message: "Large PDF detected, processing locally..."
  - _Requirements: FR1.3, FR2.4, FR5.1, FR5.5_

- [ ] 4. Implement error handling and user feedback
  - Map PDF.js errors to user-friendly messages
  - Handle encrypted PDF error with clear message
  - Handle corrupted PDF error with actionable guidance
  - Handle PDF.js loading failures with retry option
  - Add cancellation support with AbortController
  - Display errors in ProcessingModal with dismiss action
  - _Requirements: FR4.1, FR4.2, FR4.3, FR4.4, FR5.4_

- [ ] 5. Add TypeScript types and interfaces
  - Define PDFExtractionOptions interface
  - Define PDFExtractionProgress interface
  - Define PDFExtractionResult interface
  - Define PDFExtractionError class with error codes
  - Add types to useUpload for extraction flow
  - Update UploadItem type to include "extracting" status
  - _Requirements: NFR4.2_

- [ ]* 6. Write unit tests for PDF extraction
  - Test pdfExtractor.extractText with mock PDF
  - Test progress callback invocation
  - Test cancellation via AbortSignal
  - Test error handling for various PDF.js errors
  - Test memory cleanup after extraction
  - Test lazy loading of PDF.js library
  - _Requirements: NFR4.4_

- [ ]* 7. Write integration tests for upload flow
  - Test large PDF detection in useUpload
  - Test extraction workflow from file selection to server call
  - Test progress updates during extraction
  - Test error handling in upload flow
  - Test cancellation during extraction
  - _Requirements: NFR4.4_

- [ ]* 8. Add end-to-end tests for large PDF upload
  - Test complete flow: select large PDF → extract → process → display results
  - Test extraction progress updates in UI
  - Test error scenarios (encrypted, corrupted PDFs)
  - Test cancellation from UI
  - Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
  - _Requirements: NFR2.1, NFR4.4_

- [ ]* 9. Performance optimization and monitoring
  - Verify PDF.js is lazy-loaded and not in main bundle
  - Measure and optimize extraction speed for 30-page PDFs
  - Add extraction metrics tracking (file size, page count, time)
  - Test memory usage during extraction
  - Verify UI remains responsive during extraction
  - Test on mobile browsers
  - _Requirements: NFR1.1, NFR1.2, NFR1.3, NFR2.2, NFR3.1, NFR3.2_
