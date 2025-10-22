# Quick Test Setup for Practice View

## Problem
The share token you're using doesn't exist in the database, causing the "Cannot coerce the result to a single JSON object" error.

## Solution: Create a Test Wordlist

### Step 1: Upload a Document
1. Go to http://localhost:5173
2. Click "Upload" or navigate to the upload page
3. Upload any text file (or create a simple .txt file with some English words)
4. Wait for processing to complete

### Step 2: Save the Wordlist
1. After processing, you'll see the extracted words
2. Click "Save Wordlist" button
3. Give it a name (e.g., "Test Wordlist")

### Step 3: Share the Wordlist
1. Go to "Saved Wordlists" page
2. Find your saved wordlist
3. Click the "Share" button (should be visible on each wordlist card)
4. Copy the share link that's generated

### Step 4: Test Practice View
1. Open the share link in a new tab/window
2. Enter a student nickname when prompted
3. You should now see the practice questions!

## Alternative: Use Browser Console to Create Test Data

If you want to quickly create test data, open browser console on http://localhost:5173 and run:

```javascript
// This will create a test wordlist and share it
const testWords = [
  { english: 'hello', mandarin: '你好' },
  { english: 'world', mandarin: '世界' },
  { english: 'test', mandarin: '测试' }
];

// Save wordlist (you'll need to be on the app page)
// Then use the UI to share it
```

## Verify Supabase is Running

Make sure Supabase is running:
```bash
supabase status
```

You should see services running on:
- API URL: http://localhost:54321
- Studio URL: http://localhost:54323

## Check Database Directly

You can also check the database directly in Supabase Studio:
1. Go to http://localhost:54323
2. Navigate to Table Editor
3. Check the `wordlists` and `shared_wordlists` tables
4. Verify there are entries with valid share tokens
