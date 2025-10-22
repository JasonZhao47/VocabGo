# Manual Testing Guide: Shared Practice Format Alignment

## Overview
This guide provides step-by-step instructions for manually testing the shared practice format alignment feature. The goal is to verify that shared practice sessions display in the same format as downloaded HTML files.

## Prerequisites
- Development server running (`pnpm dev`)
- Supabase local instance running
- At least one wordlist with a share link created
- Access to both the web app and a downloaded practice HTML file

## Test Environment Setup

### 1. Create Test Data
```bash
# Start the dev server
pnpm dev

# In another terminal, ensure Supabase is running
cd supabase
supabase start
```

### 2. Generate a Share Link
1. Navigate to http://localhost:5173
2. Upload a document or use an existing wordlist
3. Click "Share" button on a wordlist
4. Copy the generated share link (e.g., `/practice/abc123`)
5. Download the practice HTML file for comparison

## Testing Checklist

### ✅ Test 1: Question Rendering

#### 1.1 Matching Questions
**Steps:**
1. Open the share link in a browser
2. Enter a student nickname
3. Locate the matching question(s)

**Verify:**
- [ ] English words appear in the left column
- [ ] Mandarin translations appear in the right column (shuffled)
- [ ] All pairs are visible simultaneously
- [ ] Layout matches the HTML template (two-column grid)
- [ ] Font sizes and spacing match the template
- [ ] Border radius and colors match (gray borders, white background)

**Expected Result:**
```
┌─────────────────┐  ┌─────────────────┐
│   welcome       │  │   话题          │
├─────────────────┤  ├─────────────────┤
│   topic         │  │   欢迎          │
├─────────────────┤  ├─────────────────┤
│   reason        │  │   原因          │
└─────────────────┘  └─────────────────┘
```

#### 1.2 Fill-in-the-Blank Questions
**Steps:**
1. Scroll to a fill-blank question

**Verify:**
- [ ] Sentence displays correctly with `___` replaced by hint
- [ ] Hint shows first letter + spaced underscores (e.g., "w _ _ _ _ _ _")
- [ ] Hint section has yellow background (#fef3c7)
- [ ] Input field is full-width with proper styling
- [ ] Input field has placeholder text "Type your answer..."
- [ ] Border color changes to black on focus

**Expected Result:**
```
Fill in the blank

The ___ at the party was lively and enjoyable.

┌─────────────────────────────────┐
│ Hint: w _ _ _ _ _ _             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Type your answer...             │
└─────────────────────────────────┘
```

#### 1.3 Multiple-Choice Questions
**Steps:**
1. Scroll to a multiple-choice question

**Verify:**
- [ ] Question sentence displays above options
- [ ] Four options are displayed vertically
- [ ] Options have white background with gray borders
- [ ] Options have proper padding (12px 16px)
- [ ] Border radius is 8px
- [ ] Hover effect changes border color to #d1d5db

**Expected Result:**
```
Choose the correct answer

Please join us for the opening ceremony.

┌─────────────────────────────────┐
│ 欢迎                            │
├─────────────────────────────────┤
│ 邀请                            │
├─────────────────────────────────┤
│ 拒绝                            │
├─────────────────────────────────┤
│ 感谢                            │
└─────────────────────────────────┘
```

### ✅ Test 2: Interactive Behaviors

#### 2.1 Matching Question Interactions
**Steps:**
1. Click on an English word
2. Click on a Mandarin translation

**Test Case A: Correct Match**
- [ ] English item shows black border when selected
- [ ] Mandarin item shows black border when selected
- [ ] Both items turn green when matched correctly
- [ ] Both items become semi-transparent (opacity: 0.7)
- [ ] Both items are no longer clickable
- [ ] No shake animation occurs

**Test Case B: Incorrect Match**
- [ ] Both items briefly show red border
- [ ] Both items shake horizontally (4px left/right)
- [ ] Animation lasts ~300ms
- [ ] Items return to unselected state after animation
- [ ] Items remain clickable

**Test Case C: Selection Toggle**
- [ ] Clicking a selected item deselects it
- [ ] Black border is removed
- [ ] Background returns to white

#### 2.2 Multiple-Choice Interactions
**Steps:**
1. Click on an option

**Verify:**
- [ ] Selected option shows black border
- [ ] Selected option has gray background (#f3f4f6)
- [ ] Selected option has box shadow (0 0 0 3px rgba(0, 0, 0, 0.1))
- [ ] Clicking another option deselects the first
- [ ] Only one option can be selected at a time

#### 2.3 Fill-Blank Interactions
**Steps:**
1. Click in the input field
2. Type some text

**Verify:**
- [ ] Input field accepts text input
- [ ] Border changes to black on focus
- [ ] Box shadow appears on focus (0 0 0 3px rgba(0, 0, 0, 0.1))
- [ ] Text is visible and properly styled
- [ ] No immediate validation occurs

### ✅ Test 3: Submission and Scoring

#### 3.1 Submit Button
**Steps:**
1. Scroll to the bottom of the page

**Verify:**
- [ ] "Submit Answers" button is visible
- [ ] Button has black background (#000000)
- [ ] Button has white text
- [ ] Button has proper padding (16px 48px)
- [ ] Hover effect darkens background to #1f2937
- [ ] Hover effect adds slight lift (translateY(-1px))

#### 3.2 Score Calculation
**Steps:**
1. Answer some questions (mix of correct and incorrect)
2. Click "Submit Answers"

**Verify:**
- [ ] Results modal appears immediately
- [ ] Modal has semi-transparent black overlay
- [ ] Modal content is centered on screen
- [ ] Score percentage is displayed (e.g., "75%")
- [ ] Correct count is shown (e.g., "15 out of 20 correct")
- [ ] Celebration emoji (🎉) is displayed
- [ ] "Try Again" button is visible

**Scoring Logic to Verify:**
- [ ] Matching: Correct only if ALL pairs are matched
- [ ] Fill-blank: Case-insensitive comparison
- [ ] Multiple-choice: Correct if selected option matches correct answer

#### 3.3 Try Again Functionality
**Steps:**
1. Click "Try Again" button

**Verify:**
- [ ] Page reloads completely
- [ ] All answers are cleared
- [ ] Questions are re-rendered
- [ ] User can start fresh practice session

### ✅ Test 4: Mistake Recording

#### 4.1 Matching Mistakes
**Steps:**
1. Make an incorrect match
2. Check browser console for API calls

**Verify:**
- [ ] API call to `record-practice-mistake` is made
- [ ] Request includes: wordlistId, word, translation, questionType: 'matching'
- [ ] Call is fire-and-forget (doesn't block UI)
- [ ] Error in API doesn't break the UI

#### 4.2 Submission Mistakes
**Steps:**
1. Answer questions incorrectly
2. Submit answers
3. Check browser console

**Verify:**
- [ ] Multiple API calls are made for each incorrect answer
- [ ] Fill-blank mistakes include word and questionType: 'fill_blank'
- [ ] Multiple-choice mistakes include word and questionType: 'multiple_choice'
- [ ] Unmatched pairs in matching questions are recorded

### ✅ Test 5: Visual Consistency

#### 5.1 Side-by-Side Comparison
**Steps:**
1. Open the downloaded HTML file in one browser tab
2. Open the share link in another tab
3. Compare visually

**Verify:**
- [ ] Container max-width is 800px in both
- [ ] Container padding is 32px in both
- [ ] Container has white background in both
- [ ] Container has rounded corners (16px) in both
- [ ] Question cards have same gray background (#f9fafb)
- [ ] Question cards have same border color (#e5e7eb)
- [ ] Question cards have same border radius (12px)
- [ ] Typography matches (font sizes, weights, colors)
- [ ] Spacing between elements matches
- [ ] Button styles match exactly

#### 5.2 Color Palette Verification
**Verify these colors match:**
- [ ] Background: #f9fafb
- [ ] Container: #ffffff
- [ ] Text: #1a1a1a (primary), #6b7280 (secondary)
- [ ] Borders: #e5e7eb (default), #000000 (selected)
- [ ] Success: #10b981 (green)
- [ ] Error: #ef4444 (red)
- [ ] Hint background: #fef3c7 (yellow)

#### 5.3 Typography Verification
**Verify these font styles match:**
- [ ] Title: 28px, weight 700
- [ ] Subtitle: 15px, color #6b7280
- [ ] Question number: 14px, weight 600
- [ ] Question type: 12px, weight 600, uppercase
- [ ] Question title: 18px, weight 600
- [ ] Body text: 15px
- [ ] Button text: 16px, weight 600

### ✅ Test 6: Responsive Behavior

#### 6.1 Mobile View (< 640px)
**Steps:**
1. Resize browser to 375px width (iPhone SE)
2. Or use browser DevTools device emulation

**Verify:**
- [ ] Container padding reduces to 20px
- [ ] Matching columns stack vertically (one column)
- [ ] Question cards maintain readability
- [ ] Buttons remain touch-friendly (min 44px height)
- [ ] Text remains legible
- [ ] No horizontal scrolling occurs
- [ ] Results modal fits on screen with margins

#### 6.2 Tablet View (640px - 1024px)
**Steps:**
1. Resize browser to 768px width (iPad)

**Verify:**
- [ ] Layout remains centered
- [ ] Matching columns remain side-by-side
- [ ] All elements scale appropriately
- [ ] Touch targets are adequate

#### 6.3 Desktop View (> 1024px)
**Steps:**
1. View on full desktop screen

**Verify:**
- [ ] Container is centered with max-width 800px
- [ ] Matching columns are side-by-side
- [ ] All spacing is consistent
- [ ] Hover effects work properly

### ✅ Test 7: Edge Cases

#### 7.1 No Questions Available
**Steps:**
1. Create a wordlist with no words
2. Generate share link
3. Access the link

**Verify:**
- [ ] Appropriate message is displayed
- [ ] No errors in console
- [ ] UI remains functional

#### 7.2 All Questions Answered Correctly
**Steps:**
1. Answer all questions correctly
2. Submit

**Verify:**
- [ ] Score shows 100%
- [ ] Correct count matches total count
- [ ] Results display properly

#### 7.3 All Questions Answered Incorrectly
**Steps:**
1. Answer all questions incorrectly
2. Submit

**Verify:**
- [ ] Score shows 0%
- [ ] Correct count is 0
- [ ] Results display properly
- [ ] All mistakes are recorded

#### 7.4 Partial Matching Question
**Steps:**
1. Match only some pairs in a matching question
2. Submit without completing all matches

**Verify:**
- [ ] Question is marked as incorrect
- [ ] Unmatched pairs are recorded as mistakes
- [ ] Score calculation is correct

### ✅ Test 8: Browser Compatibility

Test in the following browsers:

#### Chrome/Edge
- [ ] All features work correctly
- [ ] Animations are smooth
- [ ] No console errors

#### Firefox
- [ ] All features work correctly
- [ ] Animations are smooth
- [ ] No console errors

#### Safari
- [ ] All features work correctly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Border radius renders correctly
- [ ] Box shadows render correctly

### ✅ Test 9: Performance

#### 9.1 Load Time
**Verify:**
- [ ] Questions render within 1 second
- [ ] No visible lag when clicking items
- [ ] Animations are smooth (60fps)

#### 9.2 Large Question Sets
**Steps:**
1. Test with 20+ questions

**Verify:**
- [ ] Page remains responsive
- [ ] Scrolling is smooth
- [ ] No memory leaks
- [ ] Submit button remains accessible

### ✅ Test 10: Accessibility

#### 10.1 Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter/Space to select

**Verify:**
- [ ] All interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] Enter key works on buttons

#### 10.2 Screen Reader
**Steps:**
1. Enable screen reader (VoiceOver, NVDA, etc.)
2. Navigate through questions

**Verify:**
- [ ] Question numbers are announced
- [ ] Question types are announced
- [ ] Options are announced clearly
- [ ] Selected state is announced

## Test Results Template

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Browser:** [Browser + Version]
**Device:** [Desktop/Mobile/Tablet]

### Test Results Summary
- Total Tests: 10
- Passed: __
- Failed: __
- Blocked: __

### Failed Tests
1. [Test Name]: [Description of failure]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]
   - Screenshot: [Link if available]

### Notes
[Any additional observations or comments]
```

## Common Issues and Solutions

### Issue 1: Matching items not responding to clicks
**Solution:** Check that the `handleEnglishClick` and `handleMandarinClick` functions are properly bound.

### Issue 2: Shake animation not working
**Solution:** Verify that the `@keyframes shake` CSS is included and the `.incorrect` class is applied.

### Issue 3: Score calculation incorrect
**Solution:** Check the `calculateScore` function logic for each question type.

### Issue 4: Mistake recording fails silently
**Solution:** Check browser console for API errors. Verify session token is available.

### Issue 5: Responsive layout breaks on mobile
**Solution:** Verify media query at `@media (max-width: 640px)` is applied correctly.

## Completion Criteria

All tests must pass before marking task 5 as complete:
- [ ] All question types render correctly
- [ ] All interactions work as expected
- [ ] Submission and scoring are accurate
- [ ] Mistake recording functions properly
- [ ] Visual appearance matches HTML template
- [ ] Responsive behavior works on all screen sizes
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Accessibility requirements are met

## Next Steps

After completing manual testing:
1. Document any issues found
2. Create bug tickets for failures
3. Update the tasks.md file to mark task 5 as complete
4. Notify the team of completion
