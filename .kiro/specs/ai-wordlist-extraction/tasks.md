# Implementation Plan

- [x] 1. Set up backend infrastructure and database schema
  - Create Supabase database tables (jobs, wordlists, llm_metrics, upload_cooldowns) with proper indexes and constraints
  - Configure storage buckets for document uploads and exports with TTL policies
  - Set up Row Level Security (RLS) policies for all tables
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2. Implement document parser service
  - [x] 2.1 Create base document parser interface and types
    - Write TypeScript interfaces for ParsedDocument and parser functions
    - Create shared utilities for text extraction and cleaning
    - _Requirements: 1.1, 2.5_
  
  - [x] 2.2 Implement PDF parser
    - Write PDF parsing logic to extract text page-by-page
    - Handle PDF metadata extraction
    - _Requirements: 1.1, 2.5_
  
  - [x] 2.3 Implement TXT, DOCX, and XLSX parsers
    - Write TXT parser for plain text files
    - Write DOCX parser to extract text from Word documents
    - Write XLSX parser to extract text cell-by-cell from spreadsheets
    - _Requirements: 1.1, 2.5_
  
  - [x] 2.4 Write parser unit tests
    - Create unit tests for each parser with sample documents
    - Test edge cases (empty files, corrupted files, large files)
    - _Requirements: 1.1, 2.5_

- [x] 3. Implement LLM service with retry logic
  - [x] 3.1 Create LLM service interface and configuration
    - Write LLM service with GLM-Flash API integration
    - Implement request/response types and error handling
    - Configure API endpoints and authentication
    - _Requirements: 6.2, 9.1, 9.2_
  
  - [x] 3.2 Implement retry logic with exponential backoff
    - Write retry wrapper function with configurable backoff
    - Implement timeout handling and error classification
    - Add metrics logging for each LLM call
    - _Requirements: 6.2, 9.1, 9.2, 9.3_
  
  - [x] 3.3 Write LLM service unit tests
    - Create unit tests with mocked LLM responses
    - Test retry logic with simulated failures
    - Test token counting and metrics logging
    - _Requirements: 6.2, 9.1, 9.2_

- [x] 4. Implement text cleaning and AI agent services
  - [x] 4.1 Implement Text Cleaner Service
    - Write text cleaning service using regex patterns and heuristics
    - Implement noise removal for headers, footers, page numbers, indexes, TOCs
    - Add whitespace normalization and special character filtering
    - Calculate cleanliness score based on removal statistics
    - Return cleaned text with processing metrics
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.2 Implement Extractor Agent
    - Write Extractor agent with prompt engineering for word identification
    - Implement filtering logic for duplicates and stop words
    - Enforce 40-word maximum limit
    - Validate word precision (≥95% valid English words)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 4.3 Implement Translator Agent
    - Write Translator agent with prompt engineering for Mandarin translation
    - Implement context-aware translation for polysemous words
    - Add fallback handling for rare words
    - Ensure ≥95% translation accuracy
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 4.4 Write text cleaner unit tests
    - Create unit tests for text cleaning patterns
    - Test edge cases (empty text, heavily formatted documents, special characters)
    - Validate cleanliness scores and metrics
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.5 Write AI agent unit tests
    - Create unit tests for Extractor and Translator agents with sample inputs
    - Test edge cases (empty text, non-English text, special characters)
    - Validate output formats and constraints
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Implement queue management system
  - [ ] 5.1 Create queue service with PostgreSQL
    - Write queue service using PostgreSQL with SKIP LOCKED for concurrency
    - Implement enqueue, dequeue, and status update functions
    - Add queue position calculation logic
    - Track active job count for global limit enforcement
    - _Requirements: 1.5, 6.4, 8.4_
  
  - [ ] 5.2 Implement job status tracking
    - Write job status update functions with progress tracking
    - Implement stage tracking (cleaning, extracting, translating)
    - Add error tracking and retry count management
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 5.3 Write queue service unit tests
    - Create unit tests for queue operations
    - Test concurrent job handling
    - Test queue position calculations
    - _Requirements: 1.5, 6.4, 8.4_

- [ ] 6. Implement upload rate limiting and cooldown
  - [ ] 6.1 Create cooldown tracking service
    - Write cooldown service using upload_cooldowns table
    - Implement cooldown period enforcement (configurable duration)
    - Add cooldown remaining time calculation
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 6.2 Implement global concurrent upload limit
    - Write logic to check active upload count against global limit (5)
    - Implement queue notification when limit is reached
    - Add queue position display for waiting uploads
    - _Requirements: 1.5, 8.4, 8.5_
  
  - [ ]* 6.3 Write rate limiting unit tests
    - Create unit tests for cooldown enforcement
    - Test global limit enforcement
    - Test queue position calculations
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Implement Supabase Edge Functions
  - [ ] 7.1 Create upload-document Edge Function
    - Write file upload handler with validation (type, size)
    - Implement storage upload to Supabase Storage
    - Add cooldown and global limit checks
    - Create job record and enqueue for processing
    - Return job ID and queue position
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 7.1, 8.1, 8.2, 8.4_
  
  - [ ] 7.2 Create process-document Edge Function
    - Write document processing orchestrator
    - Implement three-stage pipeline (Text Cleaner → Extractor → Translator)
    - Add progress updates at each stage
    - Store final wordlist in database
    - Handle errors and retries
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3_
  
  - [ ] 7.3 Create job-status Edge Function
    - Write job status query handler
    - Return current status, progress, and stage
    - Return wordlist when job is completed
    - Handle error states
    - _Requirements: 6.1, 6.3_
  
  - [ ] 7.4 Create wordlist-export Edge Function
    - Write export handler for CSV and XLSX formats
    - Implement proper UTF-8 encoding with BOM
    - Generate downloadable blob
    - Store in exports bucket with 1-hour TTL
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ]* 7.5 Write Edge Function integration tests
    - Create integration tests for each Edge Function
    - Test end-to-end upload and processing flow
    - Test error scenarios and retries
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 7.1, 8.1, 8.2, 8.4_

- [ ] 8. Implement frontend service layer
  - [ ] 8.1 Create uploadService
    - Write uploadDocument function to call upload-document Edge Function
    - Implement pollJobStatus function with 2-second interval
    - Add cancelJob function for user cancellation
    - Handle API errors and retries
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.3_
  
  - [ ] 8.2 Create wordlistService
    - Write saveWordlist function to persist wordlists
    - Implement fetchWordlists function to load user's saved wordlists
    - Add deleteWordlist function for removal
    - Write exportWordlist function to download CSV/XLSX
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 8.3 Write service layer unit tests
    - Create unit tests for uploadService with mocked API
    - Create unit tests for wordlistService with mocked API
    - Test error handling and retry logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.3, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9. Enhance frontend state management
  - [ ] 9.1 Enhance uploadState
    - Update UploadItem interface with new fields (jobId, progress, processingStage, error)
    - Add status polling logic with 2-second interval
    - Implement cooldown tracking and remaining time calculation
    - Add global concurrent limit tracking
    - Update queueFiles function to call uploadService
    - _Requirements: 1.4, 1.5, 6.1, 6.3, 8.1, 8.2, 8.4, 8.5_
  
  - [ ] 9.2 Enhance wordlistsState
    - Update WordlistRecord interface with new fields (documentType, wordCount)
    - Add loading and error state tracking
    - Implement saveCurrent function to call wordlistService
    - Add fetchAll function to load wordlists on mount
    - Update remove function to call wordlistService
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 9.3 Write state management unit tests
    - Create unit tests for uploadState logic
    - Create unit tests for wordlistsState logic
    - Test computed properties and reactive updates
    - _Requirements: 1.4, 1.5, 6.1, 6.3, 8.1, 8.2, 8.4, 8.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Create frontend composables
  - [ ] 10.1 Create useUpload composable
    - Write canUpload computed property (checks cooldown and global limit)
    - Implement queuePosition computed property
    - Add cooldownRemaining computed property with countdown
    - Write uploadFiles function with file validation
    - Add validateFile function for client-side validation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.4, 8.5_
  
  - [ ] 10.2 Create useWordlist composable
    - Write loadWordlists function to fetch on mount
    - Implement saveCurrentWordlist function
    - Add removeWordlist function with confirmation
    - Write downloadWordlist function for CSV/XLSX export
    - _Requirements: 5.3, 5.4, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 10.3 Write composable unit tests
    - Create unit tests for useUpload composable
    - Create unit tests for useWordlist composable
    - Test computed properties and function calls
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.3, 5.4, 5.5, 8.1, 8.2, 8.4, 8.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Update UploadPage component
  - [ ] 11.1 Enhance file upload UI
    - Update file input to show supported formats clearly
    - Add file validation with error messages
    - Display cooldown timer when active
    - Show global upload limit status
    - Disable upload button when limit reached or cooldown active
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 8.1, 8.2_
  
  - [ ] 11.2 Integrate useUpload composable
    - Replace direct state access with useUpload composable
    - Use canUpload, queuePosition, and cooldownRemaining
    - Call uploadFiles function on upload button click
    - Display validation errors from validateFile
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.4, 8.5_

- [ ] 12. Update ProcessingPage component
  - [ ] 12.1 Enhance processing status display
    - Show detailed progress for each upload (0-100%)
    - Display current processing stage (cleaning, extracting, translating)
    - Add progress bar visualization
    - Show queue position for queued uploads
    - Display error messages for failed uploads
    - _Requirements: 1.5, 6.1, 6.3, 6.4_
  
  - [ ] 12.2 Implement status polling
    - Add automatic status polling every 2 seconds
    - Update upload items with latest status and progress
    - Stop polling when all uploads complete or fail
    - Handle navigation away and cleanup
    - _Requirements: 6.1, 6.3_

- [ ] 13. Update ResultPage component
  - [ ] 13.1 Enhance wordlist display
    - Display wordlist in a styled table with English and Mandarin columns
    - Show word count (≤40) and document name
    - Add sorting and filtering options
    - Display processing metadata (document type, creation date)
    - _Requirements: 3.3, 5.1, 5.2_
  
  - [ ] 13.2 Add export functionality
    - Add export buttons for CSV and XLSX formats
    - Implement download using wordlistService
    - Show download progress and success feedback
    - Handle export errors gracefully
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 13.3 Integrate save functionality
    - Update save button to use useWordlist composable
    - Show save confirmation feedback
    - Navigate to saved wordlists after save
    - _Requirements: 10.1, 10.2_

- [ ] 14. Update SavedWordlistsPage component
  - [ ] 14.1 Enhance wordlist list display
    - Display saved wordlists with filename, date, and word count
    - Add sorting options (date, name, word count)
    - Implement search/filter functionality
    - Show empty state when no wordlists saved
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [ ] 14.2 Add wordlist detail view
    - Show full wordlist when user clicks on a saved item
    - Display all word pairs in a table
    - Add export buttons for CSV and XLSX
    - Implement delete functionality with confirmation
    - _Requirements: 10.3, 10.4, 10.5_
  
  - [ ] 14.3 Integrate useWordlist composable
    - Load wordlists on component mount
    - Use loadWordlists, removeWordlist, and downloadWordlist functions
    - Handle loading and error states
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [ ] 15. Implement file storage cleanup
  - [ ] 15.1 Create storage cleanup Edge Function
    - Write scheduled function to run every hour
    - Query files older than 24 hours
    - Delete files from uploads bucket
    - Log cleanup metrics
    - _Requirements: 7.2, 7.5_
  
  - [ ] 15.2 Implement export file cleanup
    - Add cleanup logic for exports bucket (1-hour TTL)
    - Delete temporary export files
    - _Requirements: 7.2_

- [ ] 16. Add error handling and user feedback
  - [ ] 16.1 Implement global error handling
    - Create error boundary component for Vue
    - Add toast/notification system for user feedback
    - Implement error logging to backend
    - _Requirements: 1.2, 6.3, 8.3_
  
  - [ ] 16.2 Add user feedback for all operations
    - Show success messages for uploads, saves, exports, deletes
    - Display error messages with actionable guidance
    - Add loading states for all async operations
    - Implement retry buttons for failed operations
    - _Requirements: 1.2, 6.3, 8.3_

- [ ] 17. Implement observability and monitoring
  - [ ] 17.1 Add metrics logging
    - Log all LLM calls to llm_metrics table (Extractor and Translator only)
    - Log text cleaning operations to cleaning_metrics table
    - Track token usage, latency, and confidence per agent
    - Track cleaning effectiveness (patterns removed, cleanliness scores)
    - Implement cost calculation based on token usage
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 17.2 Create metrics dashboard Edge Function
    - Write function to query and aggregate metrics
    - Calculate total costs, average latency, success rates
    - Return metrics for admin dashboard
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 18. Add configuration and environment setup
  - [ ] 18.1 Create environment configuration
    - Add environment variables for all configurable values
    - Document required environment variables
    - Set up development and production configurations
    - _Requirements: All_
  
  - [ ] 18.2 Create deployment scripts
    - Write script to deploy Edge Functions
    - Create script to run database migrations
    - Add script to seed test data
    - _Requirements: All_

- [ ] 19. Performance optimization
  - [ ] 19.1 Optimize LLM calls
    - Implement prompt caching for repeated patterns
    - Add parallel processing where possible
    - Optimize token usage in prompts
    - _Requirements: 6.1, 6.5, 9.3_
  
  - [ ] 19.2 Optimize frontend performance
    - Add lazy loading for pages
    - Implement virtual scrolling for large wordlists
    - Optimize status polling (exponential backoff when idle)
    - Add request debouncing and caching
    - _Requirements: 6.1_

- [ ] 20. Documentation and final integration
  - [ ] 20.1 Write API documentation
    - Document all Edge Function endpoints
    - Add request/response examples
    - Document error codes and handling
    - _Requirements: All_
  
  - [ ] 20.2 Write user documentation
    - Create user guide for uploading documents
    - Document supported file formats and limitations
    - Add FAQ for common issues
    - _Requirements: All_
  
  - [ ] 20.3 Final integration testing
    - Test complete user flow end-to-end
    - Verify all requirements are met
    - Test edge cases and error scenarios
    - Validate performance targets (30-second processing)
    - _Requirements: All_
