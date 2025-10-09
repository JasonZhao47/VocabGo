# Manual Testing Guide - Authorization Header Fix

This guide will walk you through manually testing all the Authorization header changes in the browser.

## Prerequisites

Before starting, ensure:
1. ✅ Supabase is running locally: `supabase start`
2. ✅ Dev server is running: `pnpm dev`
3. ✅ Browser DevTools is open (F12 or Cmd+Option+I on Mac)
4. ✅ Network tab is visible in DevTools

## Test Setup

1. **Start Supabase** (if not already running):
   ```bash
   cd supabase
   supabase start
   ```

2. **Start the dev server**:
   ```bash
   pnpm dev
   ```

3. **Open the app** in your browser:
   ```
   http://localhost:5173
   ```

4. **Open DevTools**:
   - Chrome/Edge: Press F12 or Cmd+Option+I (Mac)
   - Navigate to the "Network" tab
   - Enable "Preserve log" to keep requests across page navigations

---

## Task 6.1: Manual Test - Fetch Wordlists

**Objective**: Verify that fetching wordlists includes the Authorization header

### Steps:

1. **Navigate to Saved Wordlists page**:
   - Click "View Saved Wordlists" from the home page
   - OR navigate directly to: `http://localhost:5173/wordlists`

2. **Check Network Tab**:
   - Look for a request to: `fetch-wordlists`
   - Click on the request to view details
   - Go to the "Headers" section

3. **Verify Authorization Header**:
   - ✅ Request Headers should include:
     ```
     Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     X-Session-ID: <some-uuid>
     ```

4. **Check Console**:
   - ✅ No errors should appear in the console
   - ✅ Page should load successfully (even if empty)

5. **Expected Behavior**:
   - If you have saved wordlists, they should display
   - If no wordlists exist, you should see an empty state message
   - No "Missing authorization header" errors

### ✅ Pass Criteria:
- [ ] Authorization header is present in the request
- [ ] No console errors
- [ ] Page loads successfully
- [ ] Wordlists display correctly (or empty state shows)

---

## Task 6.2: Manual Test - Save Wordlist

**Objective**: Verify that saving a wordlist includes the Authorization header

### Steps:

1. **Process a test document first**:
   - Navigate to Upload page: `http://localhost:5173/upload`
   - Upload a test file (create a simple .txt file with some English text if needed)
   - Wait for processing to complete
   - You should see the results page with extracted words

2. **Save the wordlist**:
   - Click the "Save Wordlist" button on the results page
   - Wait for the success message

3. **Check Network Tab**:
   - Look for a request to: `save-wordlist`
   - Click on the request to view details
   - Go to the "Headers" section

4. **Verify Authorization Header**:
   - ✅ Request Headers should include:
     ```
     Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     X-Session-ID: <some-uuid>
     Content-Type: application/json
     ```

5. **Verify Request Payload**:
   - Go to the "Payload" or "Request" tab
   - Should see JSON with: `filename`, `documentType`, `words`

6. **Check Response**:
   - Status should be: `200 OK`
   - Response body should include: `{"success": true, "wordlistId": "<uuid>"}`

7. **Verify UI Feedback**:
   - ✅ Success toast/message should appear
   - ✅ "Save Wordlist" button should be disabled or show "Saved"

8. **Verify in Saved Wordlists**:
   - Navigate to Saved Wordlists page
   - ✅ The newly saved wordlist should appear in the list

### ✅ Pass Criteria:
- [ ] Authorization header is present in the save request
- [ ] Request completes successfully (200 OK)
- [ ] Success message appears
- [ ] Wordlist appears in the saved wordlists page

---

## Task 6.3: Manual Test - Delete Wordlist

**Objective**: Verify that deleting a wordlist includes the Authorization header

### Steps:

1. **Navigate to Saved Wordlists page**:
   - Go to: `http://localhost:5173/wordlists`
   - Ensure you have at least one saved wordlist (use Task 6.2 to create one if needed)

2. **Delete a wordlist**:
   - Find a wordlist in the list
   - Click the "Delete" or trash icon button
   - Confirm deletion if prompted

3. **Check Network Tab**:
   - Look for a request to: `delete-wordlist`
   - Click on the request to view details
   - Go to the "Headers" section

4. **Verify Authorization Header**:
   - ✅ Request Headers should include:
     ```
     Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     X-Session-ID: <some-uuid>
     Content-Type: application/json
     ```

5. **Verify Request Payload**:
   - Go to the "Payload" or "Request" tab
   - Should see JSON with: `{"wordlistId": "<uuid>"}`

6. **Check Response**:
   - Status should be: `200 OK`
   - Response body should include: `{"success": true}`

7. **Verify UI Update**:
   - ✅ The wordlist should be removed from the list immediately
   - ✅ Success message should appear (if implemented)
   - ✅ No console errors

### ✅ Pass Criteria:
- [ ] Authorization header is present in the delete request
- [ ] Request completes successfully (200 OK)
- [ ] Wordlist is removed from the UI
- [ ] No console errors

---

## Task 6.4: Manual Test - Process Document

**Objective**: Verify that processing a document includes the Authorization header

### Steps:

1. **Prepare a test document**:
   - Create a simple text file with English content, e.g., `test.txt`:
     ```
     The quick brown fox jumps over the lazy dog.
     Learning English vocabulary is important for language acquisition.
     Technology has transformed modern education systems.
     ```
   - OR use any PDF, DOCX, or XLSX file you have

2. **Navigate to Upload page**:
   - Go to: `http://localhost:5173/upload`

3. **Upload the document**:
   - Click "Choose File" or drag-and-drop your test file
   - Click "Upload" or the file should start processing automatically

4. **Check Network Tab**:
   - Look for a request to: `process-document`
   - Click on the request to view details
   - Go to the "Headers" section

5. **Verify Authorization Header**:
   - ✅ Request Headers should include:
     ```
     Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
     X-Session-ID: <some-uuid>
     Content-Type: application/json
     ```

6. **Verify Request Payload**:
   - Go to the "Payload" or "Request" tab
   - Should see JSON with: `{"file": {"name": "...", "type": "...", "data": "..."}}`
   - The `data` field should contain base64-encoded file content

7. **Wait for Processing**:
   - Processing may take 10-30 seconds depending on document size
   - You should see a processing/loading indicator

8. **Check Response**:
   - Status should be: `200 OK`
   - Response body should include:
     ```json
     {
       "success": true,
       "wordlist": {
         "words": [...],
         "filename": "test.txt",
         "documentType": "txt",
         "wordCount": <number>
       }
     }
     ```

9. **Verify Results Page**:
   - ✅ Should navigate to results page automatically
   - ✅ Should display extracted English words with Mandarin translations
   - ✅ Word count should be displayed (max 40 words)
   - ✅ No console errors

### ✅ Pass Criteria:
- [ ] Authorization header is present in the process request
- [ ] Request completes successfully (200 OK)
- [ ] Processing completes without errors
- [ ] Results page displays wordlist correctly
- [ ] No console errors

---

## Common Issues & Troubleshooting

### Issue: "Missing authorization header" error
**Solution**: 
- Verify `.env.local` has the correct `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after changing environment variables
- Clear browser cache and reload

### Issue: Network request not showing in DevTools
**Solution**:
- Ensure "Preserve log" is enabled in Network tab
- Try clearing the network log and repeating the action
- Check if the request is being filtered (show "All" requests)

### Issue: CORS errors
**Solution**:
- Ensure Supabase is running: `supabase status`
- Check that `VITE_SUPABASE_URL` is set to `http://localhost:54321`
- Restart both Supabase and the dev server

### Issue: Processing takes too long or times out
**Solution**:
- Check that GLM API key is configured in Supabase secrets
- Use a smaller test document (< 5 pages)
- Check Supabase logs: `supabase functions logs process-document`

### Issue: Empty wordlists page
**Solution**:
- This is expected if you haven't saved any wordlists yet
- Complete Task 6.2 first to create a saved wordlist
- Check browser console for any errors

---

## Verification Checklist

After completing all tests, verify:

- [ ] ✅ All 4 edge function calls include Authorization header
- [ ] ✅ Fetch wordlists works without errors
- [ ] ✅ Save wordlist works and persists data
- [ ] ✅ Delete wordlist works and removes data
- [ ] ✅ Process document works and generates wordlist
- [ ] ✅ No console errors during any operation
- [ ] ✅ All network requests return 200 OK status
- [ ] ✅ UI feedback is appropriate for all actions

---

## Next Steps

Once all tests pass:
1. Mark tasks 6.1, 6.2, 6.3, and 6.4 as complete in `tasks.md`
2. Document any issues found in a bug report
3. If all tests pass, the Authorization header fix is complete! 🎉

## Notes

- All tests should be performed with DevTools Network tab open
- Take screenshots of successful requests if needed for documentation
- If any test fails, note the specific error message and request details
- The Authorization header should be identical to the apikey value
