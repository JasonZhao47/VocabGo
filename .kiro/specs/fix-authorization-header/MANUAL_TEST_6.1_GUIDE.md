# Manual Test 6.1: Fetch Wordlists

## Test Objective
Verify that the SavedWordlistsPage successfully loads wordlists with the Authorization header included in the request.

## Prerequisites

### 1. Ensure Supabase is Running
```bash
# Check if Supabase is running
supabase status

# If not running, start it
supabase start
```

### 2. Verify Environment Variables
Check that `.env.local` contains:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 3. Start the Development Server
```bash
# In a new terminal window
pnpm dev
```

The app should be available at: http://localhost:5173

## Test Steps

### Step 1: Open Browser DevTools
1. Open your browser (Chrome, Firefox, or Edge recommended)
2. Navigate to http://localhost:5173
3. Open DevTools:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
4. Click on the **Network** tab
5. Ensure "Preserve log" is checked (to keep requests visible during navigation)

### Step 2: Navigate to Saved Wordlists Page
1. In the browser, navigate to: http://localhost:5173/saved-wordlists
   - OR click "Saved Wordlists" from the home page navigation

### Step 3: Observe Page Loading
Watch for the following states:

**Loading State:**
- You should see a spinner with "Loading wordlists..." text

**Expected Outcomes:**

**If you have saved wordlists:**
- The page should display a list of saved wordlists
- Each wordlist should show:
  - Filename
  - Word count
  - Creation date
  - View, Export CSV, and Delete buttons

**If you have no saved wordlists:**
- You should see an empty state message: "No saved wordlists"
- A button to "Upload Document"

**If there's an error:**
- You should see a red error banner with the error message

### Step 4: Inspect Network Request
In the DevTools Network tab:

1. **Find the fetch-wordlists request:**
   - Look for a request to: `fetch-wordlists`
   - It should be a GET request
   - Status should be `200 OK` (green)

2. **Click on the request** to view details

3. **Check Request Headers:**
   - Click on the "Headers" tab
   - Scroll to "Request Headers" section
   - **Verify the following headers are present:**
     ```
     X-Session-ID: <some-uuid>
     apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     ```

4. **Check Response:**
   - Click on the "Response" or "Preview" tab
   - You should see JSON with:
     ```json
     {
       "success": true,
       "wordlists": [...]
     }
     ```

### Step 5: Check Console for Errors
1. Click on the **Console** tab in DevTools
2. **Verify:** There should be NO error messages
3. **Look for:**
   - ❌ No "Missing authorization header" errors
   - ❌ No "Failed to fetch wordlists" errors
   - ❌ No network errors
   - ❌ No JavaScript errors

## Success Criteria

✅ **PASS if ALL of the following are true:**

1. ✅ Page loads without errors (no red error banner)
2. ✅ Network request to `fetch-wordlists` returns status 200
3. ✅ Request includes `Authorization: Bearer <anon_key>` header
4. ✅ Request includes `apikey: <anon_key>` header
5. ✅ Request includes `X-Session-ID: <uuid>` header
6. ✅ Response contains `{"success": true, "wordlists": [...]}`
7. ✅ Console shows no errors
8. ✅ Page displays either wordlists or empty state (both are valid)

❌ **FAIL if ANY of the following occur:**

1. ❌ Error banner appears on page
2. ❌ Network request fails (status 4xx or 5xx)
3. ❌ Authorization header is missing from request
4. ❌ Console shows error messages
5. ❌ Page shows loading spinner indefinitely

## Troubleshooting

### Issue: "Missing authorization header" error
**Solution:** 
- Verify the code in `src/services/wordlistService.ts` includes the Authorization header
- Check that `.env.local` has the correct `VITE_SUPABASE_ANON_KEY`
- Restart the dev server: `Ctrl+C` then `pnpm dev`

### Issue: Network request not appearing
**Solution:**
- Ensure "Preserve log" is checked in Network tab
- Refresh the page
- Clear browser cache and reload

### Issue: Supabase not running
**Solution:**
```bash
supabase start
```

### Issue: Dev server not running
**Solution:**
```bash
pnpm dev
```

## Creating Test Data (Optional)

If you want to test with actual wordlists, you can create one:

1. Navigate to http://localhost:5173/upload
2. Upload a test document (use `test-document.txt` from the project root)
3. Wait for processing to complete
4. Click "Save Wordlist" on the results page
5. Navigate back to Saved Wordlists page

## Test Results Template

```
Test Date: _______________
Tester: _______________

[ ] Step 1: DevTools opened and Network tab visible
[ ] Step 2: Navigated to /saved-wordlists
[ ] Step 3: Page loaded successfully
[ ] Step 4: Network request verified
    [ ] Authorization header present
    [ ] apikey header present
    [ ] X-Session-ID header present
    [ ] Status 200 OK
[ ] Step 5: No console errors

Overall Result: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

## Screenshots to Capture

For documentation purposes, capture:
1. Network tab showing the fetch-wordlists request with status 200
2. Request Headers section showing Authorization header
3. Console tab showing no errors
4. Page displaying wordlists (or empty state)

---

**Requirements Verified:** 1.2 - "WHEN the fetch-wordlists request is made with proper headers THEN it SHALL successfully return the user's wordlists"
