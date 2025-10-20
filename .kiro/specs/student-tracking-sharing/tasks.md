---
name: Student Tracking & Sharing System
description: Enable teachers to share wordlists with students, track individual mistakes, and generate targeted practice questions
requirements: #[[file:requirements.md]]
design: #[[file:design.md]]
---

# Implementation Plan

## Phase 1: Database Foundation

- [x] 1. Create database migration for student tracking
  - Create `supabase/migrations/20250117000001_student_tracking.sql`
  - Add `student_sessions` table (id, wordlist_id, nickname, session_token, device_info, timestamps)
  - Add `practice_mistakes` table (id, student_session_id, wordlist_id, word, translation, question_type, mistake_count, timestamps)
  - Add sharing columns to `wordlists` table (share_token, is_shared, share_settings, shared_at)
  - Create indexes for performance (wordlist_sessions, session_token, wordlist_mistakes)
  - Add unique constraint on (wordlist_id, nickname, session_token)
  - Test migration runs successfully
  - _Requirements: FR1, FR2, FR3, NFR2_

- [x] 2. Create materialized view for mistake aggregation
  - Create `wordlist_mistake_summary` materialized view
  - Aggregate by wordlist_id, word, translation
  - Include student_count, total_mistakes, avg_mistakes_per_student
  - Add refresh trigger on practice_mistakes insert/update
  - Create index on wordlist_id
  - Benchmark query performance (target: <100ms for 1000 records)
  - _Requirements: FR4, NFR1, NFR2_

## Phase 2: Backend - Shared Utilities

- [x] 3. Implement share token generation utility
  - Create `supabase/functions/_shared/utils/shareToken.ts`
  - Implement `generateShareToken()` using crypto.getRandomValues (48 hex chars)
  - Implement `validateShareToken()` for format validation
  - Write unit tests for token generation and validation
  - Test token uniqueness
  - _Requirements: FR1, NFR3_

- [x] 4. Implement device fingerprinting utility
  - Create `supabase/functions/_shared/utils/deviceFingerprint.ts`
  - Generate session token from userAgent, screen resolution, timezone
  - Use crypto hash for consistent token generation
  - Write unit tests
  - _Requirements: FR2, NFR5_

## Phase 3: Backend - Edge Functions

- [x] 5. Create share-wordlist edge function
  - Create `supabase/functions/share-wordlist/index.ts`
  - Implement enable sharing (generate token, update DB, return URL)
  - Implement disable sharing (set is_shared=false)
  - Add authorization check (only owner can share)
  - Support share_settings (anonymous_mode)
  - Create `index.test.ts` with enable/disable/auth tests
  - _Requirements: FR1, NFR3_

- [x] 6. Create register-student-session edge function
  - Create `supabase/functions/register-student-session/index.ts`
  - Validate share token and check is_shared=true
  - Validate nickname (2-20 chars, Unicode support)
  - Generate session token from device info
  - Check for existing session or create new
  - Update last_active_at for existing sessions
  - Return session data and wordlist
  - Create `index.test.ts` with validation and session tests
  - _Requirements: FR2, NFR3, NFR4_

- [x] 7. Create record-practice-mistake edge function
  - Create `supabase/functions/record-practice-mistake/index.ts`
  - Validate session token
  - Insert new mistake or increment existing count
  - Update last_mistake_at timestamp
  - Update student_session.last_active_at
  - Implement rate limiting (10 req/min per session)
  - Create `index.test.ts` with recording and rate limit tests
  - _Requirements: FR3, NFR1, NFR3_

- [x] 8. Create fetch-practice-stats edge function
  - Create `supabase/functions/fetch-practice-stats/index.ts`
  - Validate wordlist ownership
  - Query aggregate mistakes from materialized view
  - Query per-student breakdown with top mistakes
  - Apply anonymous mode if enabled (show "Student N")
  - Support date range filtering
  - Optimize queries for <2s with 100 students
  - Create `index.test.ts` with aggregate, anonymous, and filter tests
  - _Requirements: FR4, FR5, NFR1, NFR2_

- [x] 9. Create generate-questions-from-mistakes edge function
  - Create `supabase/functions/generate-questions-from-mistakes/index.ts`
  - Fetch top N most-missed words from wordlist
  - Call existing practice question agent
  - Support filtering by specific students (optional)
  - Support question type selection
  - Return generated questions with metadata
  - Write tests for question generation
  - _Requirements: FR4_

## Phase 4: Frontend - Composables & Services

- [x] 10. Create useStudentSession composable
  - Create `src/composables/useStudentSession.ts`
  - Manage sessionToken, nickname, sessionId in reactive state
  - Load from localStorage on mount
  - Implement `registerSession(shareToken, nickname)` method
  - Implement `recordMistake(wordlistId, word, translation, questionType)` method
  - Handle errors gracefully with user-friendly messages
  - Create `useStudentSession.test.ts` with localStorage and API tests
  - _Requirements: FR2, FR3, NFR5_

- [x] 11. Create usePracticeStats composable
  - Create `src/composables/usePracticeStats.ts`
  - Implement `fetchStats(wordlistId, dateRange)` method
  - Implement `generateFromMistakes(wordlistId, topN)` method
  - Manage loading, error, and data states
  - Add 30-second cache for stats data
  - Create `usePracticeStats.test.ts` with fetch and cache tests
  - _Requirements: FR4, NFR1_

- [x] 12. Create sharing service
  - Create `src/services/sharingService.ts`
  - Implement `enableSharing(wordlistId, settings)` method
  - Implement `disableSharing(wordlistId)` method
  - Implement `copyShareUrl(shareToken)` with clipboard API
  - Handle errors and return user-friendly messages
  - Create `sharingService.test.ts` with enable/disable/copy tests
  - _Requirements: FR1_

## Phase 5: Frontend - Teacher Components

- [x] 13. Create ShareWordlistButton component
  - Create `src/components/sharing/ShareWordlistButton.vue`
  - Show "Enable Sharing" button when not shared
  - Show share URL input with copy button when shared
  - Add "View Stats" and "Disable" buttons for shared wordlists
  - Implement copy animation with success feedback
  - Style with ElevenLabs aesthetic (gradient border on active)
  - Handle loading and error states
  - Create `ShareWordlistButton.test.ts`
  - _Requirements: FR1, FR4_

- [x] 14. Create PracticeDashboard page
  - Create `src/pages/PracticeDashboard.vue`
  - Add header with wordlist title and action buttons
  - Display stats overview cards (total students, practices, avg mistakes)
  - Show "Most Challenging Words" table with difficulty bars
  - Show expandable student list with individual mistakes
  - Add "Generate Questions" button (calls generateFromMistakes)
  - Add "Export CSV" functionality
  - Style with ElevenLabs aesthetic (gradient cards, smooth animations)
  - Create `PracticeDashboard.test.ts`
  - _Requirements: FR4, FR5_

- [x] 15. Integrate ShareWordlistButton into SavedWordlistsPage
  - Update `src/pages/SavedWordlistsPage.vue`
  - Add ShareWordlistButton to each wordlist card
  - Add "View Dashboard" link for shared wordlists
  - Show share status indicator
  - Test integration with existing wordlist management
  - _Requirements: FR1, FR4_

## Phase 6: Frontend - Student Components

- [x] 16. Create StudentNicknameEntry component
  - Create `src/components/practice/StudentNicknameEntry.vue`
  - Show modal with friendly welcome message
  - Add large input field for nickname (2-20 chars, Unicode)
  - Show validation errors inline
  - Add privacy reassurance message
  - Style with ElevenLabs aesthetic (centered modal, gradient border)
  - Handle loading state during registration
  - Create `StudentNicknameEntry.test.ts`
  - _Requirements: FR2, FR6, NFR4_

- [x] 17. Create StudentPracticeView page
  - Create `src/pages/StudentPracticeView.vue`
  - Show StudentNicknameEntry modal on first visit
  - Display friendly greeting with student nickname
  - Show wordlist title and progress indicator
  - Integrate existing practice question components
  - Add collapsible "Your Mistakes" section
  - Style with ElevenLabs aesthetic (clean, mobile-first)
  - Create `StudentPracticeView.test.ts`
  - _Requirements: FR2, FR6, NFR4_

- [x] 18. Integrate mistake recording into practice flow
  - Update `src/services/practiceQuestionService.ts`
  - Call `useStudentSession().recordMistake()` on wrong answers
  - Work with all question types (multiple_choice, fill_blank, matching)
  - Don't block UI (fire and forget with error logging)
  - Handle offline gracefully (queue for later)
  - Test with all question types
  - _Requirements: FR3, NFR1_

## Phase 7: Routing & Navigation

- [x] 19. Add new routes for student and teacher views
  - Update `src/router/index.ts`
  - Add `/practice/:shareToken` route for StudentPracticeView
  - Add `/dashboard/:wordlistId` route for PracticeDashboard
  - Add route guards for dashboard (requires session)
  - Test route navigation and parameter passing
  - _Requirements: FR1, FR2, FR4_

## Phase 8: Design Tokens & Styling

- [x] 20. Create sharing design tokens
  - Create `src/config/sharingDesignTokens.ts`
  - Define gradient colors for share states, mistake levels
  - Define animation timings (copy success, stat updates, accordion)
  - Define spacing and sizing constants
  - Export tokens for use in components
  - _Requirements: Design aesthetic_

- [x] 21. Add sharing-specific CSS utilities
  - Update `src/assets/main.css` with sharing utilities
  - Add gradient border classes
  - Add difficulty bar styles
  - Add stat card animations
  - Ensure mobile-responsive styles
  - _Requirements: Design aesthetic, NFR4_

## Phase 9: Testing & Quality Assurance

- [x] 22. Write integration tests
  - Create `tests/integration/student-tracking.test.ts`
  - Test complete teacher sharing workflow
  - Test complete student practice workflow
  - Test mistake recording accuracy
  - Test dashboard data accuracy
  - Test anonymous mode functionality
  - _Requirements: All functional requirements_

- [x] 23. Write E2E tests
  - Create `tests/e2e/sharing-workflow.test.ts`
  - Test teacher enables sharing and copies URL
  - Test student accesses via share link
  - Test student enters nickname and practices
  - Test student makes mistakes
  - Test teacher views dashboard with correct data
  - _Requirements: All functional requirements_

- [x] 24. Performance testing
  - Test with 100 students per wordlist
  - Test with 1000 practice sessions
  - Measure dashboard load time (<2s target)
  - Measure mistake recording throughput
  - Test materialized view refresh performance
  - Optimize slow queries
  - _Requirements: NFR1, NFR2_

- [x] 25. Security audit
  - Verify share tokens are cryptographically secure
  - Test rate limiting on all endpoints
  - Verify no PII leakage in responses
  - Test CORS configuration
  - Test SQL injection prevention
  - Test authorization checks
  - _Requirements: NFR3, FR5_

- [x] 26. Accessibility testing
  - Test keyboard navigation on all components
  - Test screen reader compatibility
  - Verify ARIA labels and roles
  - Test with reduced motion preference
  - Ensure WCAG AA compliance
  - _Requirements: NFR4_

## Phase 10: Documentation & Launch

- [x] 27. Write user documentation
  - Create `.kiro/specs/student-tracking-sharing/USER_GUIDE.md`
  - Document teacher workflow (how to share, view stats)
  - Document student workflow (how to practice)
  - Include privacy information
  - Add troubleshooting section
  - _Requirements: All_

- [x] 28. Write developer documentation
  - Create `.kiro/specs/student-tracking-sharing/DEVELOPER_GUIDE.md`
  - Document architecture overview
  - Document API endpoints and schemas
  - Document database schema and indexes
  - Include testing guide
  - Add deployment notes
  - _Requirements: All_

- [x] 29. Create migration guide
  - Create `.kiro/specs/student-tracking-sharing/MIGRATION_GUIDE.md`
  - Document database migration steps
  - Document rollback procedure
  - Document data retention policy (90 days)
  - Include backup recommendations
  - _Requirements: FR3, FR5_

- [ ] 30. Final validation and launch
  - Run full test suite
  - Perform manual testing on staging
  - Review all documentation
  - Deploy database migration
  - Deploy edge functions
  - Deploy frontend changes
  - Monitor for errors
  - _Requirements: All_
