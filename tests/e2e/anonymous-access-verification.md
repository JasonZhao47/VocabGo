# Anonymous Access End-to-End Verification Checklist

This document provides a comprehensive manual testing checklist for verifying the anonymous access implementation.

## Prerequisites

1. Start the local Supabase instance:
   ```bash
   supabase start
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open the application in your browser at `http://localhost:5173`

## Test 1: Session ID Generation and Storage

### Steps:
1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage → `http://localhost:5173`
3. Clear all localStorage data
4. Refresh the page
5. Check localStorage again

### Expected Results:
- ✅ A new `vocabgo_session_id` key should appear in localStorage
- ✅ The value should be a valid UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- ✅ No authentication-related errors in the console

### Verification:
```javascript
// Run in browser console
localStorage.getItem('vocabgo_session_id')
// Should return a UUID string
```

---

## Test 2: File Upload Without Authentication

### Steps:
1. Navigate to the Upload page
2. Select a test document (PDF, TXT, DOCX, or XLSX)
3. Upload the file
4. Monitor the console for errors

### Expected Results:
- ✅ File uploads successfully without authentication errors
- ✅ Processing starts immediately
- ✅ No "Authentication required" errors appear
- ✅ Console shows no auth-related errors

### Verification:
- Check Network tab for the upload request
- Verify `X-Session-ID` header is present in the request
- Verify no `Authorization` header with bearer token

---

## Test 3: Save Wordlist

### Steps:
1. After processing completes, view the generated wordlist
2. Click "Save Wordlist" button
3. Check the console and network tab

### Expected Results:
- ✅ Wordlist saves successfully
- ✅ No authentication errors
- ✅ Success message appears
- ✅ Network request includes `X-Session-ID` header

### Verification:
```sql
-- Check database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT id, session_id, filename FROM wordlists;"
```
- Should show the saved wordlist with a session_id matching your localStorage value

---

## Test 4: Fetch Saved Wordlists

### Steps:
1. Navigate to "Saved Wordlists" page
2. Observe the wordlists displayed
3. Check the network tab

### Expected Results:
- ✅ Previously saved wordlists appear
- ✅ No authentication errors
- ✅ Network request includes `X-Session-ID` header
- ✅ Only wordlists for current session are shown

### Verification:
- Compare session_id in localStorage with session_id in database
- Verify only matching wordlists are displayed

---

## Test 5: Delete Wordlist

### Steps:
1. On the Saved Wordlists page, click delete on a wordlist
2. Confirm the deletion
3. Check the console and network tab

### Expected Results:
- ✅ Wordlist deletes successfully
- ✅ No authentication errors
- ✅ Wordlist disappears from the list
- ✅ Network request includes `X-Session-ID` header

### Verification:
```sql
-- Check database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT id, session_id, filename FROM wordlists;"
```
- Deleted wordlist should no longer appear

---

## Test 6: Session Persistence Across Page Reloads

### Steps:
1. Note the current session ID from localStorage
2. Refresh the page (F5)
3. Check localStorage again
4. Navigate to Saved Wordlists

### Expected Results:
- ✅ Session ID remains the same after refresh
- ✅ Saved wordlists still appear
- ✅ No new session is created

### Verification:
```javascript
// Before refresh
const sessionBefore = localStorage.getItem('vocabgo_session_id')

// After refresh
const sessionAfter = localStorage.getItem('vocabgo_session_id')

console.log(sessionBefore === sessionAfter) // Should be true
```

---

## Test 7: Data Isolation - Incognito Window

### Steps:
1. In your main browser window, note the session ID and saved wordlists
2. Open a new incognito/private window
3. Navigate to `http://localhost:5173`
4. Check localStorage in the incognito window
5. Navigate to Saved Wordlists

### Expected Results:
- ✅ Incognito window has a different session ID
- ✅ Incognito window shows NO saved wordlists
- ✅ Main window still shows its wordlists
- ✅ Data is completely isolated between sessions

### Verification:
```javascript
// In main window
const mainSessionId = localStorage.getItem('vocabgo_session_id')

// In incognito window
const incognitoSessionId = localStorage.getItem('vocabgo_session_id')

console.log(mainSessionId !== incognitoSessionId) // Should be true
```

---

## Test 8: Multiple Tabs - Same Session

### Steps:
1. With the app open in one tab, note the session ID
2. Open a new tab (same browser, not incognito)
3. Navigate to `http://localhost:5173` in the new tab
4. Check the session ID in the new tab
5. Save a wordlist in one tab
6. Navigate to Saved Wordlists in the other tab

### Expected Results:
- ✅ Both tabs have the same session ID
- ✅ Wordlists saved in one tab appear in the other tab
- ✅ Data is shared between tabs in the same browser

### Verification:
```javascript
// In both tabs, run:
localStorage.getItem('vocabgo_session_id')
// Should return the same value
```

---

## Test 9: Clear Session and Create New

### Steps:
1. Note current session ID and saved wordlists
2. Open DevTools → Application → Local Storage
3. Delete the `vocabgo_session_id` key
4. Refresh the page
5. Check localStorage again
6. Navigate to Saved Wordlists

### Expected Results:
- ✅ A new session ID is generated (different from the old one)
- ✅ Saved Wordlists page shows no wordlists (fresh session)
- ✅ Old wordlists are still in database but not accessible

### Verification:
```sql
-- Check database - old wordlists should still exist
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT id, session_id, filename FROM wordlists;"
```
- Should show wordlists with the old session_id
- New session cannot access them

---

## Test 10: Console Error Check

### Steps:
1. Open DevTools Console
2. Clear the console
3. Perform a complete workflow:
   - Upload a file
   - Save the wordlist
   - View saved wordlists
   - Delete a wordlist
4. Review all console messages

### Expected Results:
- ✅ No "Authentication required" errors
- ✅ No "UNAUTHORIZED" errors
- ✅ No `auth.getSession()` errors
- ✅ No `auth.getUser()` errors
- ✅ Only normal application logs appear

---

## Test 11: Network Request Verification

### Steps:
1. Open DevTools → Network tab
2. Filter for "Fetch/XHR" requests
3. Perform these actions:
   - Upload a file
   - Save a wordlist
   - Fetch wordlists
   - Delete a wordlist
4. Inspect each request

### Expected Results for ALL requests:
- ✅ `X-Session-ID` header is present with valid UUID
- ✅ `apikey` header is present with Supabase anon key
- ✅ NO `Authorization` header with bearer token
- ✅ All requests return 200 or appropriate success status
- ✅ No 401 UNAUTHORIZED responses

---

## Test 12: Cross-Session Security

### Steps:
1. In main browser, save a wordlist and note its ID
2. In incognito window with different session:
3. Try to access the wordlist directly via database query (if possible)
4. Verify Edge Functions enforce session filtering

### Expected Results:
- ✅ Incognito session cannot see main session's wordlists
- ✅ Edge Functions filter by session_id in WHERE clauses
- ✅ RLS policies allow operations but Edge Functions enforce isolation

### Verification:
```sql
-- Simulate cross-session access attempt
-- This should return empty result for different session_id
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
  SELECT * FROM wordlists WHERE session_id = 'different-session-id';
"
```

---

## Summary Checklist

After completing all tests, verify:

- [ ] Session ID generation works correctly
- [ ] Session ID persists across page reloads
- [ ] File upload works without authentication
- [ ] Wordlist save works without authentication
- [ ] Wordlist fetch works without authentication
- [ ] Wordlist delete works without authentication
- [ ] Data isolation between different sessions (incognito)
- [ ] Data sharing between tabs in same session
- [ ] New session creation after clearing localStorage
- [ ] No authentication errors in console
- [ ] All network requests include X-Session-ID header
- [ ] No Authorization headers with bearer tokens
- [ ] Cross-session data access is prevented

---

## Troubleshooting

### If session ID is not generated:
- Check `src/lib/session.ts` is properly implemented
- Verify services are calling `getSessionId()`
- Check browser console for errors

### If authentication errors still appear:
- Verify all Edge Functions have been updated
- Check that services don't call `auth.getSession()`
- Ensure database migration has been applied

### If data isolation fails:
- Verify Edge Functions filter by `session_id`
- Check RLS policies are correctly configured
- Ensure `X-Session-ID` header is being sent

### If wordlists don't persist:
- Check localStorage is not being cleared
- Verify session ID remains constant
- Check database has `session_id` column (not `user_id`)

---

## Requirements Coverage

This verification covers the following requirements:

- **1.1**: Anonymous file upload
- **1.4**: Results returned without authentication
- **2.1**: Save wordlist without authentication
- **2.2**: Fetch wordlists without authentication
- **2.3**: Delete wordlist without authentication
- **5.1**: Data isolation enforcement
- **5.2**: Cross-session data access prevention
- **5.3**: Appropriate access controls
- **5.4**: Security audit confirmation
