# Complete Manual Testing Guide

This guide provides step-by-step instructions for manually verifying all aspects of the practice session removal.

## Prerequisites

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Ensure Supabase is running (if testing with real data):
   ```bash
   cd supabase
   supabase start
   ```

## Test Scenarios

### Scenario 1: Empty State Testing

**Steps:**
1. Open browser to http://localhost:5173/wordlists
2. Clear any existing wordlists from the database (if needed)

**Expected Results:**
- ✅ Page loads without errors
- ✅ "Saved Wordlists" heading is visible
- ✅ Search bar is present and styled correctly
- ✅ Empty state message: "No saved wordlists"
- ✅ "Upload Document" button is visible
- ✅ No console errors in browser DevTools

**Screenshot Location:** `.kiro/specs/remove-practice-session/screenshots/empty-state.png`

---

### Scenario 2: Practice Route Redirect

**Steps:**
1. Navigate directly to http://localhost:5173/practice
2. Observe the URL change

**Expected Results:**
- ✅ URL automatically changes to http://localhost:5173/wordlists
- ✅ Wordlists page loads correctly
- ✅ No errors in console
- ✅ No flash of practice page content

**Screenshot Location:** `.kiro/specs/remove-practice-session/screenshots/redirect-test.png`

---

### Scenario 3: Wordlist with Practice Button (Requires Data)

**Setup:**
1. Navigate to http://localhost:5173/upload
2. Upload a test document (use `test-document.txt` in project root)
3. Wait for processing to complete
4. Save the wordlist
5. Navigate to http://localhost:5173/wordlists

**Steps:**
1. Locate the saved wordlist card
2. Observe the "Practice Questions" button
3. Hover over the button
4. Try to click the button

**Expected Results:**
- ✅ Practice Questions button is visible
- ✅ Button has proper ElevenLabs styling:
  - Rounded-full border radius
  - White background with gray border
  - 14px font size, semibold weight
  - Lightbulb icon on the left
- ✅ Button is disabled (grayed out, cursor shows not-allowed)
- ✅ Tooltip appears on hover: "Practice session feature has been removed"
- ✅ Button does not respond to clicks
- ✅ No console errors

**Screenshot Location:** `.kiro/specs/remove-practice-session/screenshots/practice-button.png`

---

### Scenario 4: Button Styling Verification

**Steps:**
1. With a wordlist visible, inspect the Practice Questions button
2. Compare with other buttons (View, Export, Delete)

**Expected Results:**

**Practice Questions Button:**
```css
✅ Width: w-full (100%)
✅ Height: h-10 (40px)
✅ Padding: px-4 (16px horizontal)
✅ Font: text-[14px] font-semibold
✅ Colors: text-black bg-white border border-gray-200
✅ Border radius: rounded-full
✅ Hover: hover:bg-gray-50
✅ Transition: transition-colors duration-150
✅ Disabled: disabled:opacity-50 disabled:cursor-not-allowed
✅ Icon: Lightbulb SVG (w-4 h-4)
✅ Gap: gap-2 between icon and text
```

**Comparison with View Button (Primary):**
- ✅ Same height (h-10)
- ✅ Same padding (px-4)
- ✅ Same font size (text-[14px] font-semibold)
- ✅ Same border radius (rounded-full)
- ✅ Same transition (duration-150)
- ✅ Different colors (View is black bg, white text)

**Screenshot Location:** `.kiro/specs/remove-practice-session/screenshots/button-comparison.png`

---

### Scenario 5: Responsive Design Testing

**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Test at different viewport sizes:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1024px width

**Expected Results at Each Breakpoint:**

**Mobile (< 768px):**
- ✅ Single column grid
- ✅ Practice button full width
- ✅ Button text visible
- ✅ Icon visible
- ✅ Touch-friendly size (min-height: 44px)

**Tablet (768px - 1023px):**
- ✅ Two column grid
- ✅ Practice button full width within card
- ✅ All button elements visible

**Desktop (>= 1024px):**
- ✅ Three column grid
- ✅ Practice button full width within card
- ✅ Hover effects work smoothly

**Screenshot Locations:**
- `.kiro/specs/remove-practice-session/screenshots/mobile-view.png`
- `.kiro/specs/remove-practice-session/screenshots/tablet-view.png`
- `.kiro/specs/remove-practice-session/screenshots/desktop-view.png`

---

### Scenario 6: Multiple Wordlists Testing

**Setup:**
1. Create 3-5 wordlists with different characteristics:
   - Small wordlist (2-3 words)
   - Medium wordlist (10-15 words)
   - Large wordlist (30-40 words)

**Steps:**
1. Navigate to http://localhost:5173/wordlists
2. Observe all wordlist cards
3. Check Practice Questions button on each card

**Expected Results:**
- ✅ All cards display Practice Questions button
- ✅ All buttons are disabled (regardless of word count)
- ✅ All buttons have same styling
- ✅ All buttons show same tooltip
- ✅ Consistent spacing and alignment across all cards

**Screenshot Location:** `.kiro/specs/remove-practice-session/screenshots/multiple-wordlists.png`

---

### Scenario 7: Console Error Check

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Navigate to http://localhost:5173/wordlists
5. Perform various actions:
   - Search for wordlists
   - Expand a wordlist
   - Hover over buttons
   - Click View button
   - Click Export button

**Expected Results:**
- ✅ No errors related to practice sessions
- ✅ No errors about missing components
- ✅ No errors about undefined methods
- ✅ No errors about missing imports
- ✅ Only acceptable warnings (e.g., favicon.ico 404)

**Screenshot Location:** `.kiro/specs/remove-practice-session/screenshots/console-clean.png`

---

### Scenario 8: Search Functionality

**Steps:**
1. With multiple wordlists visible
2. Type in the search bar
3. Observe filtered results

**Expected Results:**
- ✅ Search works correctly
- ✅ Filtered wordlists display Practice Questions button
- ✅ Button styling remains consistent
- ✅ No errors when filtering

---

### Scenario 9: Expand/Collapse Wordlist

**Steps:**
1. Click "View" button on a wordlist
2. Observe the expanded view
3. Click "Hide" button

**Expected Results:**
- ✅ Wordlist expands smoothly
- ✅ Word pairs table displays correctly
- ✅ Practice Questions button remains visible and disabled
- ✅ Collapse animation works smoothly
- ✅ No errors during expand/collapse

---

### Scenario 10: Dark Mode (if applicable)

**Steps:**
1. Enable dark mode in system preferences
2. Reload the page
3. Observe button styling

**Expected Results:**
- ✅ Practice Questions button adapts to dark mode
- ✅ Text remains readable
- ✅ Border remains visible
- ✅ Hover effects work in dark mode

---

## Checklist Summary

Use this checklist to track your manual testing progress:

### Basic Functionality
- [ ] Empty state renders correctly
- [ ] /practice redirects to /wordlists
- [ ] No console errors on page load
- [ ] Search functionality works

### Practice Questions Button
- [ ] Button is visible on wordlist cards
- [ ] Button is disabled
- [ ] Tooltip shows correct message
- [ ] Button has proper ElevenLabs styling
- [ ] Icon is visible
- [ ] Button does not respond to clicks

### Styling Verification
- [ ] rounded-full border radius
- [ ] Correct font size (14px)
- [ ] Correct font weight (semibold)
- [ ] White background with gray border
- [ ] Hover effect (bg-gray-50)
- [ ] Disabled state styling (opacity-50)
- [ ] Proper spacing (gap-2, px-4, h-10)

### Responsive Design
- [ ] Mobile view (< 768px) works correctly
- [ ] Tablet view (768px - 1023px) works correctly
- [ ] Desktop view (>= 1024px) works correctly
- [ ] Touch-friendly on mobile (44px min height)

### Edge Cases
- [ ] Works with 0 wordlists (empty state)
- [ ] Works with 1 wordlist
- [ ] Works with many wordlists (10+)
- [ ] Works with small wordlists (< 4 words)
- [ ] Works with large wordlists (40 words)

### Browser Compatibility (Optional)
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Reporting Issues

If you find any issues during manual testing:

1. **Take a screenshot** of the issue
2. **Copy the console errors** (if any)
3. **Document the steps** to reproduce
4. **Note the browser** and viewport size
5. **Create an issue** with all the above information

---

## Success Criteria

All scenarios should pass with:
- ✅ No JavaScript errors
- ✅ Proper button styling
- ✅ Correct disabled state
- ✅ Appropriate tooltip message
- ✅ Consistent behavior across all wordlists
- ✅ Responsive design working at all breakpoints

---

## Additional Notes

### Test Document Content
If you need to create test wordlists, use the existing `test-document.txt` in the project root, or create a simple text file with English words:

```
The quick brown fox jumps over the lazy dog.
Technology is advancing rapidly in modern society.
Education plays a crucial role in personal development.
```

### Database Reset (if needed)
To clear all wordlists and start fresh:
```sql
-- Run in Supabase SQL editor
DELETE FROM wordlists;
```

### Performance Testing
While testing, observe:
- Page load time
- Animation smoothness
- Button hover responsiveness
- Search filter speed

All interactions should feel snappy and responsive.
