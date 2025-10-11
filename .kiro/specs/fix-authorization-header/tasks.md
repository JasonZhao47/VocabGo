# Implementation Plan

- [x] 1. Update wordlist service with Authorization headers
  - Add `Authorization: Bearer <anon_key>` header to all three edge function calls
  - Ensure consistent header ordering for readability
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 1.1 Add Authorization header to fetchWordlists()
  - Modify the headers object in the fetch call to include Authorization header
  - Verify the header format matches `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Add Authorization header to saveWordlist()
  - Modify the headers object in the fetch call to include Authorization header
  - Verify the header format matches `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  - _Requirements: 2.1, 2.2_

- [x] 1.3 Add Authorization header to deleteWordlist()
  - Modify the headers object in the fetch call to include Authorization header
  - Verify the header format matches `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  - _Requirements: 3.1, 3.2_

- [x] 2. Update upload service with Authorization header
  - Add `Authorization: Bearer <anon_key>` header to processDocument edge function call
  - Ensure header ordering matches wordlist service for consistency
  - _Requirements: 4.1, 4.2_

- [x] 2.1 Add Authorization header to processDocument()
  - Modify the headers object in the fetch call to include Authorization header
  - Verify the header format matches `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  - _Requirements: 4.1, 4.2_

- [x] 3. Update wordlist service unit tests
  - Update test mocks to expect Authorization header in requests
  - Add specific test cases to verify Authorization header is present
  - Ensure all existing tests pass with the updated implementation
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3.1 Update saveWordlist() tests
  - Mock fetch to capture request headers
  - Assert that Authorization header is present and correctly formatted
  - Test successful save with proper headers
  - _Requirements: 5.1, 5.2_

- [x] 3.2 Update fetchWordlists() tests
  - Mock fetch to capture request headers
  - Assert that Authorization header is present and correctly formatted
  - Test successful fetch with proper headers
  - _Requirements: 5.1, 5.2_

- [x] 3.3 Update deleteWordlist() tests
  - Mock fetch to capture request headers
  - Assert that Authorization header is present and correctly formatted
  - Test successful delete with proper headers
  - _Requirements: 5.1, 5.2_

- [x] 4. Update upload service unit tests
  - Update test mocks to expect Authorization header in requests
  - Add specific test cases to verify Authorization header is present
  - Ensure all existing tests pass with the updated implementation
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 4.1 Update processDocument() tests
  - Mock fetch to capture request headers
  - Assert that Authorization header is present and correctly formatted
  - Test successful processing with proper headers
  - _Requirements: 5.1, 5.2_

- [x] 5. Verify edge function security tests
  - Review existing edge function security tests
  - Ensure tests verify Authorization header requirement
  - Add tests for missing Authorization header scenario if not present
  - _Requirements: 5.2, 5.3_

- [x] 6. Run end-to-end verification
  - Execute manual testing checklist from design document
  - Test all wordlist operations (fetch, save, delete) in browser
  - Test document processing flow
  - Verify network requests include Authorization headers
  - _Requirements: 1.2, 2.2, 3.2, 4.2_

- [ ] 6.1 Manual test: Fetch wordlists
  - Open SavedWordlistsPage in browser
  - Verify wordlists load without errors
  - Check browser DevTools Network tab for Authorization header
  - Confirm no console errors
  - _Requirements: 1.2_

- [ ] 6.2 Manual test: Save wordlist
  - Process a test document
  - Click "Save Wordlist" button
  - Verify save succeeds and wordlist appears in saved list
  - Check Network tab for Authorization header in save request
  - _Requirements: 2.2, 2.3_

- [ ] 6.3 Manual test: Delete wordlist
  - Open SavedWordlistsPage
  - Delete a saved wordlist
  - Verify deletion succeeds and wordlist is removed
  - Check Network tab for Authorization header in delete request
  - _Requirements: 3.2, 3.3_

- [ ] 6.4 Manual test: Process document
  - Upload a test document (PDF, TXT, DOCX, or XLSX)
  - Verify processing completes successfully
  - Check Network tab for Authorization header in process request
  - Verify wordlist is generated correctly
  - _Requirements: 4.2_

- [ ] 7. Run curl verification tests
  - Execute curl commands from design document to verify edge functions work with Authorization headers
  - Test fetch-wordlists endpoint
  - Test save-wordlist endpoint
  - Test delete-wordlist endpoint
  - _Requirements: 1.2, 2.2, 3.2_
