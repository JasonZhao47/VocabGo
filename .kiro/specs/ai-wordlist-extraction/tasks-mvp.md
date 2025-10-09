# MVP Implementation Plan (Pre-Customer)

This is a simplified task list focused on getting a working prototype without production-grade features like queuing, rate limiting, and comprehensive monitoring.

## Completed Foundation ✅

- [x] 1. Set up backend infrastructure and database schema
- [x] 2. Implement document parser service (PDF, TXT, DOCX, XLSX)
- [x] 3. Implement LLM service with retry logic
- [x] 4. Implement text cleaning and AI agent services (Cleaner, Extractor, Translator)

## MVP Tasks (Remaining)

- [ ] 5. Implement simplified Supabase Edge Functions
  - [x] 5.1 Create process-document Edge Function
    - Write single endpoint that handles upload + immediate processing
    - Parse document → Clean text → Extract words → Translate → Return result
    - No queue, no job tracking, just synchronous processing
    - Store result in database for optional saving
    - _Requirements: 1.1, 2.1-2.5, 3.1-3.6, 4.1-4.5_
  
  - [x] 5.2 Create save-wordlist Edge Function
    - Write endpoint to save wordlist to database
    - Simple insert into wordlists table
    - _Requirements: 10.1, 10.2_
  
  - [x] 5.3 Create fetch-wordlists Edge Function
    - Write endpoint to retrieve user's saved wordlists
    - Simple query from wordlists table
    - _Requirements: 10.2, 10.3_
  
  - [x] 5.4 Create delete-wordlist Edge Function
    - Write endpoint to delete a saved wordlist
    - Simple delete from wordlists table
    - _Requirements: 10.4_
  
  - [x] 5.5 Create export-wordlist Edge Function
    - Write endpoint to generate CSV/XLSX from wordlist
    - Return file blob for download
    - _Requirements: 5.3, 5.4, 5.5_

- [x] 6. Implement frontend service layer
  - [x] 6.1 Create uploadService
    - Write processDocument function (upload + process in one call)
    - Handle file validation
    - Return wordlist result directly
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 6.2 Create wordlistService
    - Write saveWordlist function
    - Write fetchWordlists function
    - Write deleteWordlist function
    - Write exportWordlist function
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1-10.5_

- [x] 7. Simplify frontend state management
  - [x] 7.1 Simplify uploadState
    - Track single upload at a time (no queue)
    - States: idle, uploading, processing, completed, error
    - Store current result (wordlist)
    - Remove cooldown and concurrent limit tracking
    - _Requirements: 1.4_
  
  - [x] 7.2 Implement wordlistsState
    - Track saved wordlists array
    - Add loading and error states
    - Implement CRUD operations
    - _Requirements: 10.1-10.5_

- [x] 8. Create frontend composables
  - [x] 8.1 Create useUpload composable
    - Write uploadFile function with validation
    - Track processing state
    - Handle errors
    - No cooldown or queue logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 8.2 Create useWordlist composable
    - Write loadWordlists function
    - Write saveCurrentWordlist function
    - Write removeWordlist function
    - Write downloadWordlist function
    - _Requirements: 5.3, 5.4, 5.5, 10.1-10.5_

- [x] 9. Update UploadPage component
  - [x] 9.1 Implement file upload UI
    - File input with drag-and-drop
    - Show supported formats
    - Display file validation errors
    - Show upload/processing progress
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 9.2 Integrate useUpload composable
    - Call uploadFile on file selection
    - Show processing state
    - Navigate to results on completion
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 10. Update ProcessingPage component
  - [x] 10.1 Show processing status
    - Display current stage (cleaning, extracting, translating)
    - Show simple loading indicator
    - Display errors if processing fails
    - Auto-navigate to results when done
    - _Requirements: 1.4, 6.1_

- [x] 11. Update ResultPage component
  - [x] 11.1 Display wordlist
    - Show word pairs in a table (English | Mandarin)
    - Display word count and document name
    - Add basic styling
    - _Requirements: 3.3, 5.1, 5.2_
  
  - [x] 11.2 Add export functionality
    - Add CSV and XLSX export buttons
    - Trigger download using wordlistService
    - Show success/error feedback
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [x] 11.3 Add save functionality
    - Add "Save Wordlist" button
    - Call useWordlist composable
    - Show save confirmation
    - _Requirements: 10.1, 10.2_

- [x] 12. Update SavedWordlistsPage component
  - [x] 12.1 Display saved wordlists
    - Show list of saved wordlists
    - Display filename, date, word count
    - Show empty state when no wordlists
    - _Requirements: 10.2, 10.3_
  
  - [x] 12.2 Add wordlist actions
    - Click to view full wordlist
    - Export buttons (CSV/XLSX)
    - Delete button with confirmation
    - _Requirements: 10.3, 10.4, 10.5_
  
  - [x] 12.3 Integrate useWordlist composable
    - Load wordlists on mount
    - Handle delete and export actions
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 13. Basic error handling
  - [x] 13.1 Add toast notifications
    - Install/create simple toast component
    - Show success messages (upload, save, export, delete)
    - Show error messages with details
    - _Requirements: 1.2, 6.3_
  
  - [x] 13.2 Add loading states
    - Show loading indicators for all async operations
    - Disable buttons during processing
    - _Requirements: 1.2_

- [ ] 14. Environment setup and deployment
  - [x] 14.1 Configure environment variables
    - Set up .env files for development
    - Document required variables
    - Configure Supabase connection
    - Configure GLM API credentials
    - _Requirements: All_
  
  - [x] 14.2 Test end-to-end flow
    - Upload a document
    - Verify processing works
    - Save wordlist
    - Export wordlist
    - Delete wordlist
    - _Requirements: All_

## Deferred for Later (Post-MVP)

These features are important for production but not needed for initial testing:

- **Queue Management** (Task 5 from original)
  - Add when you have multiple concurrent users
  - Implement job tracking and status polling

- **Rate Limiting & Cooldown** (Task 6 from original)
  - Add when launching publicly
  - Prevent abuse and manage costs

- **Storage Cleanup** (Task 15 from original)
  - Add automated cleanup when storage costs matter
  - Manual cleanup is fine for now

- **Observability & Monitoring** (Task 17 from original)
  - Add metrics dashboard when you have users
  - Console logs are sufficient for now

- **Performance Optimization** (Task 19 from original)
  - Add caching and optimization when you see bottlenecks
  - Current implementation should be fast enough for single users

- **Comprehensive Testing** (All optional test tasks)
  - Core functionality is tested
  - Add more tests as you find bugs in real usage

## Key Simplifications

1. **No Queue System**: Process documents immediately and synchronously
2. **No Rate Limiting**: No cooldown or concurrent upload limits
3. **No Job Tracking**: Direct request/response, no polling
4. **Minimal Monitoring**: Console logs only, no metrics dashboard
5. **Single Upload**: Process one document at a time
6. **No Optimization**: Straightforward implementation, optimize later

## Success Criteria

- ✅ User can upload a document (PDF, TXT, DOCX, XLSX)
- ✅ System extracts up to 40 English words
- ✅ System translates words to Mandarin
- ✅ User can view the wordlist
- ✅ User can export wordlist (CSV, XLSX)
- ✅ User can save wordlist for later
- ✅ User can view, export, and delete saved wordlists
- ✅ Processing completes in reasonable time (<60s for typical documents)
- ✅ Errors are displayed clearly to the user
