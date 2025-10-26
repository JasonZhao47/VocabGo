# Implementation Plan

- [x] 1. Install mammoth dependency
  - Add mammoth package to project dependencies
  - Verify mammoth works in browser environment
  - _Requirements: 1.1_

- [x] 2. Create client-side DOCX extractor service
- [x] 2.1 Implement extractDocxText function
  - Create `src/services/docxExtractor.ts` with text extraction logic
  - Use mammoth.extractRawText() for consistency with server-side
  - Apply text processing (trim, normalize whitespace)
  - Return extraction result with metadata (character count, timing)
  - _Requirements: 1.1, 1.2_

- [x] 2.2 Add error handling for extraction failures
  - Handle corrupted DOCX files gracefully
  - Validate extracted text is not empty
  - Handle browser API errors
  - _Requirements: 1.4_

- [x] 3. Update upload service for hybrid processing
- [x] 3.1 Modify processDocument to route by file type
  - Branch DOCX files to client-side extraction
  - Keep other formats using server-side extraction
  - Update file size validation (5MB for DOCX)
  - _Requirements: 1.1, 1.3_

- [x] 3.2 Implement processDocxWithClientExtraction function
  - Extract text using docxExtractor service
  - Send extracted text payload to Edge Function
  - Handle extraction errors with user-friendly messages
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 3.3 Refactor existing logic into processWithServerExtraction
  - Rename and isolate server-side extraction logic
  - Maintain backward compatibility for PDF/TXT/XLSX
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 4. Update Edge Function to accept pre-extracted text
- [x] 4.1 Modify request interface
  - Add extractedText option to ProcessRequest interface
  - Keep existing file option for backward compatibility
  - Validate that only one option is provided
  - _Requirements: 3.1, 3.2_

- [x] 4.2 Update processing logic
  - Detect request type (file vs extractedText)
  - Skip parsing stage for pre-extracted text
  - Continue with AI pipeline (cleaning, extraction, translation)
  - Set parsing time to 0 for client-side extraction
  - _Requirements: 3.1, 3.2_

- [x] 4.3 Remove DOCX-specific size limit from Edge Function
  - Remove 500KB limit for DOCX files
  - Keep general 50MB limit for other formats
  - Update error messages
  - _Requirements: 1.1_

- [x] 5. Update upload state management
- [x] 5.1 Add client-side extraction stage
  - Add 'extracting-client' to processing stages
  - Update stage progression logic
  - _Requirements: 1.1_

- [x] 5.2 Update ProcessingModal for new stage
  - Add UI messaging for 'extracting-client' stage
  - Display "Extracting text from document..." message
  - Maintain existing stage indicators
  - _Requirements: 1.1_

- [x] 6. End-to-end testing
- [x] 6.1 Test DOCX upload flow
  - Upload small DOCX (<500KB) with client-side extraction
  - Upload large DOCX (1-5MB) with client-side extraction
  - Verify DOCX >5MB is rejected with clear error
  - Verify wordlist generated correctly
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 6.2 Test backward compatibility
  - Verify PDF upload still works (server-side)
  - Verify TXT upload still works (server-side)
  - Verify XLSX upload still works (server-side)
  - Verify response format unchanged
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 6.3 Test error scenarios
  - Test corrupted DOCX file handling
  - Test empty DOCX file handling
  - Test extraction timeout scenarios
  - Verify error messages are user-friendly
  - _Requirements: 1.4_
