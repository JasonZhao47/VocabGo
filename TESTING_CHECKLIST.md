# VocabGo End-to-End Testing Checklist

This checklist guides you through manual testing of the complete VocabGo application flow.

## Prerequisites

Before starting, ensure:

- [ ] Supabase is running locally (`supabase start`)
- [ ] Environment variables are configured (`.env.local` exists with valid values)
- [ ] GLM API key is set and valid
- [ ] Frontend dev server is running (`pnpm dev`)
- [ ] Browser is open to `http://localhost:5173`

## Test Environment Setup

### 1. Verify Supabase Connection

```bash
# Check Supabase status
supabase status

# Expected output should show:
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323
# - All services running
```

### 2. Verify Environment Variables

```bash
# Check frontend env vars are loaded
cat .env.local

# Should contain:
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_ANON_KEY=...
```

### 3. Verify Edge Functions

```bash
# Check Edge Functions are deployed
supabase functions list

# Expected functions:
# - process-document
# - save-wordlist
# - fetch-wordlists
# - delete-wordlist
```

## Manual Test Flow

### Test 1: Document Upload and Processing

**Objective:** Verify users can upload documents and receive processed wordlists.

#### Steps:

1. **Navigate to Upload Page**
   - [ ] Open browser to `http://localhost:5173`
   - [ ] Click "Upload Document" or navigate to upload page
   - [ ] Verify upload interface is displayed

2. **Upload a TXT File**
   - [ ] Create a test file `test-vocab.txt` with sample English text (at least 50 words)
   - [ ] Drag and drop the file OR click to select it
   - [ ] Verify file is accepted (no error messages)
   - [ ] Click "Process Document" button

3. **Monitor Processing**
   - [ ] Verify processing status is displayed
   - [ ] Check for stage indicators (cleaning, extracting, translating)
   - [ ] Wait for processing to complete (should be < 60 seconds)
   - [ ] Verify no error messages appear

4. **View Results**
   - [ ] Verify redirect to results page
   - [ ] Check wordlist is displayed in a table
   - [ ] Verify English words are in left column
   - [ ] Verify Mandarin translations are in right column
   - [ ] Count words (should be ≤ 40)
   - [ ] Verify word count is displayed
   - [ ] Verify document name is shown

**Expected Results:**
- ✅ File uploads successfully
- ✅ Processing completes within 60 seconds
- ✅ Wordlist contains 1-40 word pairs
- ✅ All words have English and Mandarin translations
- ✅ No duplicate words
- ✅ Translations are accurate and relevant

**Test Data:**
```
Sample test-vocab.txt content:

Learning English Vocabulary

This document contains important English words for language learners.
Understanding these words will help improve your communication skills.

Key vocabulary words:
- Achievement: reaching a goal through effort
- Beneficial: producing good results
- Collaborate: work together on a project
- Demonstrate: show clearly
- Efficient: working well without waste
- Fundamental: basic and essential
- Generate: create or produce
- Hypothesis: an educated guess
- Implement: put into action
- Justify: provide good reasons for

Practice using these words in sentences to remember them better.
```

---

### Test 2: Save Wordlist

**Objective:** Verify users can save wordlists for later access.

#### Steps:

1. **From Results Page**
   - [ ] Locate "Save Wordlist" button
   - [ ] Click the button
   - [ ] Verify success message appears (toast/notification)
   - [ ] Note the wordlist ID or confirmation

2. **Navigate to Saved Wordlists**
   - [ ] Click "Saved Wordlists" in navigation
   - [ ] Verify saved wordlists page loads
   - [ ] Locate the recently saved wordlist in the list

3. **Verify Saved Data**
   - [ ] Check filename is displayed correctly
   - [ ] Verify word count matches original
   - [ ] Check creation date/time is shown
   - [ ] Click on the wordlist to view details

4. **View Full Wordlist**
   - [ ] Verify all word pairs are displayed
   - [ ] Check English and Mandarin columns
   - [ ] Verify data matches original results

**Expected Results:**
- ✅ Save operation completes successfully
- ✅ Success feedback is shown to user
- ✅ Wordlist appears in saved list
- ✅ All metadata is correct (filename, count, date)
- ✅ Full wordlist data is preserved

---

### Test 3: Export Wordlist (CSV)

**Objective:** Verify users can export wordlists as CSV files.

#### Steps:

1. **From Results Page or Saved Wordlists**
   - [ ] Locate "Export as CSV" button
   - [ ] Click the button
   - [ ] Verify download starts

2. **Check Downloaded File**
   - [ ] Open the downloaded CSV file
   - [ ] Verify it opens in spreadsheet software (Excel, Google Sheets)
   - [ ] Check column headers (English, Mandarin)
   - [ ] Verify all word pairs are present
   - [ ] Check for proper UTF-8 encoding (Mandarin characters display correctly)

3. **Verify Data Integrity**
   - [ ] Count rows (should match word count)
   - [ ] Check for any missing or corrupted data
   - [ ] Verify no extra blank rows
   - [ ] Confirm CSV format is valid

**Expected Results:**
- ✅ CSV file downloads successfully
- ✅ File opens without errors
- ✅ All word pairs are present
- ✅ Mandarin characters display correctly
- ✅ Format is clean and usable

---

### Test 4: Export Wordlist (XLSX)

**Objective:** Verify users can export wordlists as Excel files.

#### Steps:

1. **From Results Page or Saved Wordlists**
   - [ ] Locate "Export as XLSX" button
   - [ ] Click the button
   - [ ] Verify download starts

2. **Check Downloaded File**
   - [ ] Open the downloaded XLSX file in Excel or compatible software
   - [ ] Verify it opens without errors
   - [ ] Check column headers are formatted properly
   - [ ] Verify all word pairs are present
   - [ ] Check Mandarin characters display correctly

3. **Verify Formatting**
   - [ ] Check if columns are properly sized
   - [ ] Verify headers are bold or styled
   - [ ] Confirm data is in correct cells
   - [ ] Check for any formatting issues

**Expected Results:**
- ✅ XLSX file downloads successfully
- ✅ File opens in Excel/compatible software
- ✅ All word pairs are present
- ✅ Mandarin characters display correctly
- ✅ Formatting is professional and readable

---

### Test 5: Delete Wordlist

**Objective:** Verify users can delete saved wordlists.

#### Steps:

1. **Navigate to Saved Wordlists**
   - [ ] Go to saved wordlists page
   - [ ] Locate a wordlist to delete
   - [ ] Note the total count of wordlists

2. **Delete Wordlist**
   - [ ] Click "Delete" button for the wordlist
   - [ ] Verify confirmation dialog appears (if implemented)
   - [ ] Confirm deletion
   - [ ] Verify success message appears

3. **Verify Deletion**
   - [ ] Check wordlist is removed from the list
   - [ ] Verify total count decreased by 1
   - [ ] Refresh the page
   - [ ] Confirm wordlist is still gone (not just hidden)

4. **Attempt to Access Deleted Wordlist**
   - [ ] Try to navigate to the deleted wordlist directly (if URL-based)
   - [ ] Verify appropriate error or redirect occurs

**Expected Results:**
- ✅ Delete operation completes successfully
- ✅ Confirmation is requested (if implemented)
- ✅ Success feedback is shown
- ✅ Wordlist is removed from list
- ✅ Deletion persists after page refresh
- ✅ Deleted wordlist is not accessible

---

## Additional Test Cases

### Test 6: Multiple File Formats

**Objective:** Verify all supported file formats work correctly.

#### Test Files to Create:

1. **PDF File** (`test-vocab.pdf`)
   - [ ] Upload and process
   - [ ] Verify extraction works
   - [ ] Check word quality

2. **DOCX File** (`test-vocab.docx`)
   - [ ] Upload and process
   - [ ] Verify extraction works
   - [ ] Check formatting is handled

3. **XLSX File** (`test-vocab.xlsx`)
   - [ ] Create spreadsheet with text in cells
   - [ ] Upload and process
   - [ ] Verify cell content is extracted

**Expected Results:**
- ✅ All file formats are accepted
- ✅ Processing succeeds for each format
- ✅ Word extraction quality is consistent
- ✅ No format-specific errors

---

### Test 7: Error Handling

**Objective:** Verify the application handles errors gracefully.

#### Test Cases:

1. **Invalid File Type**
   - [ ] Try to upload `.exe`, `.zip`, or other unsupported format
   - [ ] Verify error message is clear
   - [ ] Check upload is rejected

2. **Empty File**
   - [ ] Upload an empty `.txt` file
   - [ ] Verify appropriate error message
   - [ ] Check processing doesn't crash

3. **Very Large File**
   - [ ] Upload a file > 50MB (if limit exists)
   - [ ] Verify size limit error
   - [ ] Check file is rejected before upload

4. **File with No English Words**
   - [ ] Upload a file with only numbers or symbols
   - [ ] Verify appropriate handling
   - [ ] Check error message is helpful

5. **Network Error Simulation**
   - [ ] Disconnect internet during processing
   - [ ] Verify error is caught and displayed
   - [ ] Check retry option is available (if implemented)

**Expected Results:**
- ✅ All errors are caught and handled
- ✅ Error messages are clear and helpful
- ✅ Application doesn't crash
- ✅ User can recover from errors

---

### Test 8: Performance Testing

**Objective:** Verify processing meets performance targets.

#### Test Cases:

1. **Small Document (1 page)**
   - [ ] Upload 1-page document
   - [ ] Time the processing
   - [ ] Should complete in < 10 seconds

2. **Medium Document (10 pages)**
   - [ ] Upload 10-page document
   - [ ] Time the processing
   - [ ] Should complete in < 20 seconds

3. **Large Document (30 pages)**
   - [ ] Upload 30-page document
   - [ ] Time the processing
   - [ ] Should complete in < 60 seconds

**Expected Results:**
- ✅ Small documents: < 10 seconds
- ✅ Medium documents: < 20 seconds
- ✅ Large documents: < 60 seconds
- ✅ No timeouts or crashes

---

### Test 9: Word Quality Validation

**Objective:** Verify extracted words are high quality and relevant.

#### Validation Checks:

1. **Word Validity**
   - [ ] All extracted words are real English words
   - [ ] No gibberish or random characters
   - [ ] No numbers or symbols (unless part of valid terms)

2. **Translation Accuracy**
   - [ ] Mandarin translations are correct
   - [ ] Translations match word context
   - [ ] No untranslated words

3. **Relevance**
   - [ ] Words are meaningful vocabulary
   - [ ] Common stop words are filtered out (the, a, is, etc.)
   - [ ] Words are appropriate for language learning

4. **Diversity**
   - [ ] No duplicate words
   - [ ] Good variety of word types (nouns, verbs, adjectives)
   - [ ] Words represent document content well

**Expected Results:**
- ✅ ≥95% of words are valid English vocabulary
- ✅ ≥95% of translations are accurate
- ✅ No stop words or common words
- ✅ No duplicates
- ✅ Words are relevant to document content

---

## Automated Test Execution

### Run E2E Tests

```bash
# Run the automated end-to-end test suite
pnpm test tests/e2e/end-to-end.test.ts

# Expected output:
# ✓ should complete the full user flow
# ✓ should handle invalid file uploads gracefully
# ✓ should enforce 40-word limit
```

### Run All Tests

```bash
# Run all tests (unit + e2e)
pnpm test

# Run with UI
pnpm test:ui
```

---

## Test Results Summary

### Date: _______________
### Tester: _______________

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Document Upload & Processing | ⬜ Pass ⬜ Fail | |
| 2. Save Wordlist | ⬜ Pass ⬜ Fail | |
| 3. Export CSV | ⬜ Pass ⬜ Fail | |
| 4. Export XLSX | ⬜ Pass ⬜ Fail | |
| 5. Delete Wordlist | ⬜ Pass ⬜ Fail | |
| 6. Multiple File Formats | ⬜ Pass ⬜ Fail | |
| 7. Error Handling | ⬜ Pass ⬜ Fail | |
| 8. Performance | ⬜ Pass ⬜ Fail | |
| 9. Word Quality | ⬜ Pass ⬜ Fail | |

### Issues Found:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Assessment:

⬜ Ready for deployment
⬜ Minor issues to fix
⬜ Major issues - needs work

---

## Troubleshooting

### Common Issues

**Issue: "Failed to connect to Supabase"**
- Check Supabase is running: `supabase status`
- Verify `.env.local` has correct URL and key
- Restart dev server: `pnpm dev`

**Issue: "GLM_API_KEY not found"**
- Set the secret: `supabase secrets set GLM_API_KEY=your-key`
- Restart Supabase: `supabase stop && supabase start`

**Issue: "Processing takes too long"**
- Check GLM API quota/rate limits
- Verify network connection
- Check Supabase logs: `supabase functions logs process-document`

**Issue: "Mandarin characters show as boxes"**
- Verify UTF-8 encoding in export
- Check browser/system font support
- Try different spreadsheet software

---

## Next Steps

After completing all tests:

1. ✅ Document any issues found
2. ✅ Fix critical bugs
3. ✅ Re-test failed cases
4. ✅ Update documentation if needed
5. ✅ Prepare for deployment

## Resources

- [ENV_SETUP.md](./ENV_SETUP.md) - Environment configuration guide
- [Supabase Docs](https://supabase.com/docs)
- [GLM API Docs](https://open.bigmodel.cn/dev/api)
