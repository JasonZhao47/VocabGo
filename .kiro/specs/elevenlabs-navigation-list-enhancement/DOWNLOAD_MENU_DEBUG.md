# Download Menu Debug - HTML Generation

## Issue
When clicking the "Practice Questions (HTML)" button in the download menu, nothing is downloaded.

## Investigation

### 1. Verified Components

✅ **usePracticeQuestions composable** - Function exists and looks correct
✅ **PracticeHtmlGenerator** - HTML generation logic is present
✅ **practiceQuestionService** - API call logic is correct
✅ **Download menu UI** - Button click handler is connected

### 2. Added Enhanced Logging

Added detailed console logging to track the entire flow:

```typescript
async function generateAndDownload(wordlist: WordlistRecord) {
  console.log('Starting practice question generation for:', wordlist.filename)
  
  // Step 1: Generate questions from API
  console.log('Calling generatePracticeQuestions with ID:', wordlist.id)
  const practiceQuestions = await generatePracticeQuestions(wordlist.id)
  console.log('Practice questions generated:', practiceQuestions)
  
  // Step 2: Convert to simple format
  const simpleQuestions = { ... }
  console.log('Converted to simple format:', simpleQuestions)
  
  // Step 3: Generate HTML
  console.log('Generating HTML...')
  const { html, filename } = generator.generateHtml(...)
  console.log('HTML generated, filename:', filename, 'size:', html.length)
  
  // Step 4: Download
  console.log('Triggering download...')
  link.click()
  console.log('Download complete!')
}
```

### 3. Added User Feedback

Updated the download handler to show toast notifications:

```typescript
async function handleDownloadPractice(wordlist: WordlistRecord) {
  try {
    showToast('Generating practice questions...', 'info')
    await generateAndDownload(wordlist)
    showToast('Practice questions downloaded successfully!', 'success')
  } catch (error) {
    console.error('Error generating practice questions:', error)
    showToast('Failed to generate practice questions. Please try again.', 'error')
  }
}
```

## How to Debug

### Step 1: Open Browser Console
1. Open the wordlists page
2. Open browser DevTools (F12)
3. Go to Console tab

### Step 2: Click Download Button
1. Click the download icon on any wordlist row
2. Click "Practice Questions (HTML)"
3. Watch the console for logs

### Expected Console Output

```
Starting practice question generation for: my-wordlist.pdf
Calling generatePracticeQuestions with ID: abc123
Practice questions generated: { matching: [...], fillBlank: [...], multipleChoice: [...] }
Converted to simple format: { matching: [...], fillBlank: [...], multipleChoice: [...] }
Generating HTML...
HTML generated, filename: my-wordlist-practice-2025-01-25.html size: 45678
Triggering download...
Download complete!
```

### Common Issues

#### Issue 1: API Error
**Symptom**: Error after "Calling generatePracticeQuestions"
**Cause**: Edge function not running or authentication issue
**Solution**: Check Supabase edge functions are running

#### Issue 2: Data Transformation Error
**Symptom**: Error after "Practice questions generated"
**Cause**: Unexpected data format from API
**Solution**: Check the practice questions structure matches expected format

#### Issue 3: HTML Generation Error
**Symptom**: Error after "Generating HTML..."
**Cause**: Issue in PracticeHtmlGenerator
**Solution**: Check the generator class for errors

#### Issue 4: Download Not Triggering
**Symptom**: Logs complete but no download
**Cause**: Browser blocking download or popup blocker
**Solution**: Check browser settings, allow downloads from localhost

## Testing Steps

### 1. Test with Valid Wordlist (4+ words)
```
1. Upload a document with 4+ words
2. Go to wordlists page
3. Click download icon
4. Click "Practice Questions (HTML)"
5. Check console for logs
6. Verify HTML file downloads
```

### 2. Test with Invalid Wordlist (< 4 words)
```
1. Find wordlist with < 4 words
2. Click download icon
3. Verify "Practice Questions" option is disabled
4. Verify tooltip shows "(Need 4+ words)"
```

### 3. Test Error Handling
```
1. Disconnect from internet
2. Try to download practice questions
3. Verify error toast appears
4. Check console for error details
```

## Files Modified

1. **src/composables/usePracticeQuestions.ts**
   - Added detailed console logging
   - Enhanced error tracking

2. **src/pages/SavedWordlistsPage.vue**
   - Added toast notifications
   - Improved error handling

## Next Steps

1. Test the download functionality
2. Check browser console for any errors
3. Verify the HTML file is generated correctly
4. Test with different wordlists (various word counts)
5. Remove console.log statements once working

## Rollback Plan

If issues persist, can revert to simple download button:
1. Remove dropdown menu
2. Use direct download button
3. Add separate "Generate Practice" button

## Success Criteria

- ✅ Console shows all log messages
- ✅ No errors in console
- ✅ HTML file downloads automatically
- ✅ HTML file opens in browser
- ✅ Practice questions display correctly
- ✅ Toast notifications appear
- ✅ Error handling works
