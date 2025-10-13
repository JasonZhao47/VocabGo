# Manual Testing Guide - Wordlist Disappearing Fix

## Overview
This guide provides step-by-step instructions for manually testing the practice session initialization fix.

## Prerequisites
- Development server running (`pnpm dev`)
- At least one wordlist with 10+ words saved
- At least one wordlist with < 4 words saved (for error testing)

## Test Cases

### Test Case 1: Valid Wordlist (10+ words)
**Objective**: Verify that practice sessions initialize correctly with sufficient words

**Steps**:
1. Navigate to Saved Wordlists page (`/wordlists`)
2. Select a wordlist with 10+ words
3. Click "Practice" button
4. Observe loading state with progress messages
5. Verify practice session loads successfully
6. Answer a few questions
7. Navigate between questions using the question navigator
8. Verify answers are recorded correctly
9. Complete the session
10. Verify results are displayed correctly

**Expected Results**:
- ✅ Loading spinner appears with message "Generating practice questions..."
- ✅ Practice session loads without errors
- ✅ First question is displayed
- ✅ Question navigation works correctly
- ✅ Answers are recorded and persist when navigating
- ✅ Timer counts down (if enabled)
- ✅ Session completes successfully
- ✅ Results page shows correct score and statistics

**Requirements Verified**: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5

---

### Test Case 2: Small Wordlist (< 4 words)
**Objective**: Verify proper error handling for insufficient words

**Steps**:
1. Navigate to Saved Wordlists page
2. Select a wordlist with < 4 words (or create one)
3. Click "Practice" button
4. Observe error message

**Expected Results**:
- ✅ Error message displays: "Insufficient words in wordlist"
- ✅ Error details explain minimum requirement
- ✅ Retry button is NOT shown (isRetryable = false)
- ✅ "Back to Wordlists" button is shown
- ✅ Clicking back button returns to wordlists page

**Requirements Verified**: 1.5, 3.1, 3.5

---

### Test Case 3: Error Recovery with Retry
**Objective**: Verify retry functionality works correctly

**Steps**:
1. Simulate a retryable error (network timeout, generation failure)
   - Option A: Disconnect network temporarily
   - Option B: Use browser DevTools to throttle network to "Offline"
2. Navigate to practice page with a valid wordlist
3. Observe error state
4. Reconnect network / restore connection
5. Click "Retry" button
6. Verify practice session initializes successfully

**Expected Results**:
- ✅ Error message displays with appropriate message
- ✅ Retry button is shown (isRetryable = true)
- ✅ Error details provide helpful context
- ✅ Clicking retry resets state and attempts regeneration
- ✅ After retry, practice session loads successfully
- ✅ No residual error state remains

**Requirements Verified**: 1.5, 3.1, 3.2, 3.3, 3.4

---

### Test Case 4: Complete Practice Flow End-to-End
**Objective**: Verify entire practice flow works seamlessly

**Steps**:
1. Start from homepage
2. Navigate to Saved Wordlists
3. Select a wordlist
4. Configure practice settings (question types, timer)
5. Start practice session
6. Answer all questions (mix of correct and incorrect)
7. Use pause/resume functionality
8. Navigate between questions
9. Submit session
10. Review results
11. Try "Retry" from results page
12. Try "New Questions" from results page
13. Try "Share" functionality

**Expected Results**:
- ✅ Smooth navigation throughout the flow
- ✅ Practice session initializes correctly
- ✅ All question types render properly
- ✅ Pause/resume works correctly
- ✅ Timer functions as expected
- ✅ Question navigation maintains state
- ✅ Results accurately reflect performance
- ✅ Retry resets session with same questions
- ✅ New Questions generates fresh questions
- ✅ Share modal opens and functions correctly

**Requirements Verified**: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5

---

### Test Case 5: Session State Persistence
**Objective**: Verify session state is properly managed and persisted

**Steps**:
1. Start a practice session
2. Answer several questions (don't complete)
3. Check browser DevTools > Application > Local Storage
4. Verify session data is stored
5. Refresh the page (or close and reopen tab)
6. Verify session state is restored
7. Continue answering questions
8. Complete session
9. Verify completed session is removed from storage

**Expected Results**:
- ✅ Session data is stored in localStorage
- ✅ Session includes: sessionId, answers, currentIndex, timeRemaining
- ✅ Page refresh restores session state
- ✅ User can continue from where they left off
- ✅ Completed sessions are cleaned up
- ✅ No orphaned session data remains

**Requirements Verified**: 2.1, 2.2, 2.3, 2.4, 2.5

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Development server is running
- [ ] Browser DevTools are open (Console + Network tabs)
- [ ] At least 2 wordlists available (one with 10+ words, one with < 4 words)

### Test Execution
- [ ] Test Case 1: Valid Wordlist - PASSED
- [ ] Test Case 2: Small Wordlist - PASSED
- [ ] Test Case 3: Error Recovery - PASSED
- [ ] Test Case 4: Complete Flow - PASSED
- [ ] Test Case 5: State Persistence - PASSED

### Post-Testing Verification
- [ ] No console errors during any test
- [ ] No network errors (except intentional ones)
- [ ] All UI elements render correctly
- [ ] All interactions feel smooth and responsive
- [ ] Error messages are clear and helpful

---

## Common Issues and Troubleshooting

### Issue: "Failed to Load Practice Session" error
**Cause**: Old implementation still running
**Solution**: Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Questions not loading
**Cause**: API endpoint not responding
**Solution**: Check Supabase Edge Functions are deployed and running

### Issue: Session state not persisting
**Cause**: localStorage disabled or full
**Solution**: Check browser settings, clear storage if needed

### Issue: Timer not working
**Cause**: Timer duration not passed correctly
**Solution**: Verify URL params include timerDuration

---

## Success Criteria

All test cases must pass with the following outcomes:
1. ✅ Practice sessions initialize correctly with valid wordlists
2. ✅ Appropriate errors shown for invalid wordlists
3. ✅ Retry functionality works for retryable errors
4. ✅ Complete practice flow works end-to-end
5. ✅ Session state persists across page refreshes
6. ✅ No console errors or warnings
7. ✅ User experience is smooth and intuitive

---

## Test Results

### Test Date: _____________
### Tester: _____________

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Valid Wordlist | ⬜ PASS / ⬜ FAIL | |
| TC2: Small Wordlist | ⬜ PASS / ⬜ FAIL | |
| TC3: Error Recovery | ⬜ PASS / ⬜ FAIL | |
| TC4: Complete Flow | ⬜ PASS / ⬜ FAIL | |
| TC5: State Persistence | ⬜ PASS / ⬜ FAIL | |

### Overall Result: ⬜ PASS / ⬜ FAIL

### Additional Notes:
_____________________________________________
_____________________________________________
_____________________________________________
