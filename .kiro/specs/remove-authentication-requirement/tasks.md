# Implementation Plan

- [x] 1. Create session management utility
  - Create `src/lib/session.ts` with `getSessionId()` and `clearSession()` functions
  - Implement UUID generation using `crypto.randomUUID()`
  - Store session ID in localStorage with key `vocabgo_session_id`
  - Return existing session ID if already stored, generate new one if not
  - _Requirements: 1.2, 2.2, 3.3_

- [x] 2. Create database migration for anonymous access
  - Create new migration file `supabase/migrations/[timestamp]_enable_anonymous_access.sql`
  - Rename `user_id` column to `session_id` in wordlists table
  - Change column type from `UUID REFERENCES auth.users(id)` to `TEXT NOT NULL`
  - Drop existing RLS policies that check `auth.uid()`
  - Create new RLS policies that allow anonymous access with session-based filtering
  - Update indexes to use `session_id` instead of `user_id`
  - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2_

- [x] 3. Update frontend upload service
  - Remove `supabase.auth.getSession()` call from `processFile()` function
  - Remove session validation check and "Authentication required" error
  - Import `getSessionId()` from session utility
  - Add `X-Session-ID` header to fetch request with session ID value
  - Add `apikey` header with Supabase anon key
  - Remove `Authorization` header with bearer token
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4_

- [x] 4. Update frontend wordlist service
- [x] 4.1 Update saveWordlist function
  - Remove `supabase.auth.getSession()` call
  - Remove session validation and error throw
  - Import `getSessionId()` from session utility
  - Add `X-Session-ID` header to fetch request
  - Add `apikey` header, remove `Authorization` header
  - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4_

- [x] 4.2 Update fetchWordlists function
  - Remove `supabase.auth.getSession()` call
  - Remove session validation and error throw
  - Import `getSessionId()` from session utility
  - Add `X-Session-ID` header to fetch request
  - Add `apikey` header, remove `Authorization` header
  - _Requirements: 2.2, 4.1, 4.2, 4.3, 4.4_

- [x] 4.3 Update deleteWordlist function
  - Remove `supabase.auth.getSession()` call
  - Remove session validation and error throw
  - Import `getSessionId()` from session utility
  - Add `X-Session-ID` header to fetch request
  - Add `apikey` header, remove `Authorization` header
  - _Requirements: 2.3, 4.1, 4.2, 4.3, 4.4_

- [x] 5. Update save-wordlist Edge Function
  - Remove `supabaseClient.auth.getUser()` call and validation
  - Remove UNAUTHORIZED error response for missing auth
  - Extract `X-Session-ID` from request headers
  - Add validation for missing session ID (return 400 BAD_REQUEST)
  - Replace `user_id: user.id` with `session_id: sessionId` in database insert
  - Update console.log to reference session ID instead of user ID
  - _Requirements: 2.1, 3.1, 3.3, 4.1, 4.2, 4.3_

- [x] 6. Update fetch-wordlists Edge Function
  - Remove `supabaseClient.auth.getUser()` call and validation
  - Remove UNAUTHORIZED error response for missing auth
  - Extract `X-Session-ID` from request headers
  - Add validation for missing session ID (return 400 BAD_REQUEST)
  - Replace `.eq('user_id', user.id)` with `.eq('session_id', sessionId)` in database query
  - Update console.log to reference session ID instead of user ID
  - _Requirements: 2.2, 3.1, 3.3, 4.1, 4.2, 4.3_

- [x] 7. Update delete-wordlist Edge Function
  - Remove `supabaseClient.auth.getUser()` call and validation
  - Remove UNAUTHORIZED error response for missing auth
  - Extract `X-Session-ID` from request headers
  - Add validation for missing session ID (return 400 BAD_REQUEST)
  - Replace `.eq('user_id', user.id)` with `.eq('session_id', sessionId)` in database query
  - Update console.log to reference session ID instead of user ID
  - _Requirements: 2.3, 3.1, 3.3, 4.1, 4.2, 4.3_

- [x] 8. Apply database migration locally
  - Run `supabase db reset` to apply all migrations including the new one
  - Verify wordlists table has `session_id` column instead of `user_id`
  - Verify RLS policies allow anonymous access
  - Check that indexes are updated correctly
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 9. Create unit tests for session management
  - Create test file `src/lib/session.test.ts`
  - Test `getSessionId()` generates UUID on first call
  - Test `getSessionId()` returns same ID on subsequent calls
  - Test `clearSession()` removes session from localStorage
  - Test session ID format is valid UUID
  - Mock localStorage for isolated testing
  - _Requirements: 1.2, 2.2, 3.3_

- [x] 10. Create integration tests for Edge Functions
  - Create test file `supabase/functions/save-wordlist/index.test.ts`
  - Test save-wordlist with valid session ID succeeds
  - Test save-wordlist without session ID returns 400
  - Create test file `supabase/functions/fetch-wordlists/index.test.ts`
  - Test fetch-wordlists returns only session's wordlists
  - Test fetch-wordlists with different session ID returns empty array
  - Create test file `supabase/functions/delete-wordlist/index.test.ts`
  - Test delete-wordlist removes only session's wordlist
  - Test delete-wordlist with wrong session ID fails
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2_

- [x] 11. Create service layer tests
  - Create test file `src/services/uploadService.test.ts`
  - Test processFile includes X-Session-ID header
  - Test processFile does not include Authorization header
  - Test processFile does not throw authentication errors
  - Create test file `src/services/wordlistService.test.ts`
  - Test saveWordlist includes X-Session-ID header
  - Test fetchWordlists includes X-Session-ID header
  - Test deleteWordlist includes X-Session-ID header
  - Verify no auth.getSession() calls in any service
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4_

- [x] 12. Manual end-to-end verification
  - Clear browser localStorage to start fresh
  - Verify new session ID is generated and stored
  - Upload a test document and verify no authentication errors
  - Save the generated wordlist and verify it's stored with session_id
  - Refresh page and fetch wordlists to verify persistence
  - Delete a wordlist and verify it's removed
  - Open in incognito window with different session
  - Verify data isolation (incognito session sees no wordlists)
  - Open multiple tabs in same browser (same session)
  - Verify tabs share the same wordlists
  - Clear localStorage and verify new session is created
  - Verify console shows no authentication-related errors
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4_

- [x] 13. Security verification tests
  - Test session ID collision handling (generate multiple IDs, verify uniqueness)
  - Test cross-session data access prevention (attempt to fetch with wrong session ID)
  - Test RLS policies prevent direct table access without session filtering
  - Test Edge Functions always include session_id in WHERE clauses
  - Verify no sensitive data in session IDs
  - Test session persistence across page reloads
  - Test session isolation in different browsers
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
