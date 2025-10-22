# Verify Data Loading Fix

## Quick Test Steps

### 1. Start Local Environment
```bash
# Terminal 1: Start Supabase
pnpm supabase:start

# Terminal 2: Start dev server
pnpm dev
```

### 2. Create and Share a Wordlist (as Teacher)
1. Go to http://localhost:5173
2. Upload a document or create a wordlist with at least 4 words
3. Once processed, go to "Saved Wordlists"
4. Click the share button on a wordlist
5. Copy the share link

### 3. Access as Student
1. Open the share link in a new incognito/private window
2. Enter a nickname (e.g., "Test Student")
3. Click "Start Practicing"

### 4. Verify Questions Load
**Expected behavior:**
- ✅ Loading spinner appears briefly
- ✅ Practice questions display correctly
- ✅ You can see matching, fill-blank, and multiple-choice questions
- ✅ No "No Questions Available" error

**If questions don't load:**
- Check browser console for errors
- Check Supabase logs: `pnpm supabase:logs`
- Verify the wordlist has at least 4 words
- Verify the wordlist is marked as shared in the database

### 5. Test Question Interaction
1. Answer a few questions
2. Verify mistakes are recorded (check console for API calls)
3. Complete the practice session
4. Verify completion screen shows

### 6. Verify Teacher Dashboard
1. Go back to the teacher view
2. Navigate to the practice dashboard for that wordlist
3. Verify student appears in the list
4. Verify mistakes are recorded

## Common Issues

### "Wordlist not found or sharing is disabled"
- The wordlist's `is_shared` flag is false
- Check database: `select id, filename, is_shared from wordlists;`

### "You do not have access to this wordlist"
- The authorization fix wasn't applied
- Verify the changes in `generate-practice-questions/index.ts`

### Questions array is empty
- The LLM might have failed to generate questions
- Check Supabase function logs for errors
- Verify GLM_API_KEY is set in environment

### Network errors
- Supabase might not be running
- Check: `pnpm supabase:status`
- Verify CORS headers are correct

## Database Queries for Debugging

```sql
-- Check wordlist sharing status
SELECT id, filename, is_shared, share_token 
FROM wordlists 
WHERE id = 'YOUR_WORDLIST_ID';

-- Check student sessions
SELECT id, nickname, wordlist_id, created_at 
FROM student_sessions 
WHERE wordlist_id = 'YOUR_WORDLIST_ID';

-- Check practice sets (cached questions)
SELECT id, wordlist_id, created_at, 
       jsonb_array_length(questions->'matching') as matching_count,
       jsonb_array_length(questions->'fillBlank') as fillblank_count,
       jsonb_array_length(questions->'multipleChoice') as mc_count
FROM practice_sets 
WHERE wordlist_id = 'YOUR_WORDLIST_ID';
```

## Success Criteria
- [x] Students can access shared wordlists
- [x] Practice questions generate successfully
- [x] Questions display in the UI
- [x] Students can answer questions
- [x] Mistakes are recorded
- [x] Teacher can view student statistics
