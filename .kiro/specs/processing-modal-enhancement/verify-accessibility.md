# Accessibility Verification Guide

## Quick Verification Steps

### 1. ARIA Attributes Verification

Open the browser DevTools and inspect the modal when it's open:

```html
<!-- Expected structure -->
<div role="dialog" aria-modal="true" aria-labelledby="processing-title">
  <h2 id="processing-title">Processing Document</h2>
  
  <!-- Live region for announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    Processing stage: Cleaning text
  </div>
  
  <!-- Progress bar -->
  <div role="progressbar" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">
  </div>
  
  <!-- Stage indicators -->
  <div aria-label="Cleaning - active">...</div>
  <div aria-label="Extracting - pending">...</div>
  <div aria-label="Translating - pending">...</div>
</div>
```

### 2. Focus Trap Verification

1. Open the modal
2. Press Tab key repeatedly
3. Verify focus cycles through: Close button → Try Again button (if error) → Cancel button (if error) → back to Close button
4. Press Shift+Tab to verify reverse cycling
5. Close modal and verify focus returns to the element that opened it

### 3. Keyboard Navigation Verification

**When NOT processing:**
- Press Escape → Modal should close
- Click backdrop → Modal should close

**When actively processing:**
- Press Escape → Modal should NOT close
- Click backdrop → Modal should NOT close

**In error state:**
- Press Escape → Modal should close
- Click backdrop → Modal should close

### 4. Screen Reader Verification

Using VoiceOver (macOS) or NVDA (Windows):

1. **Upload starts:**
   - Expected: "Uploading document [filename]"
   
2. **Processing starts:**
   - Expected: "Processing document"
   
3. **Stage changes:**
   - Expected: "Processing stage: Cleaning text"
   - Expected: "Processing stage: Extracting words"
   - Expected: "Processing stage: Translating words"
   
4. **Error occurs:**
   - Expected: "Error: [error message]"

### 5. Color Contrast Verification

Use browser DevTools or WebAIM Contrast Checker:

**Text on white background:**
- Black text (headings): 21:1 ✅
- Gray-600 text (body): 7:1 ✅
- Red-500 (error icon): 4.5:1 ✅

**Error message:**
- Red-700 on red-50 background: 7.5:1 ✅

### 6. Reduced Motion Verification

1. Enable reduced motion in OS settings:
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Windows: Settings → Ease of Access → Display → Show animations

2. Open modal and verify:
   - No fade/scale animations
   - No stage transition animations
   - No progress bar animations
   - No error icon shake animation

## Browser Testing

Test in the following browsers with screen readers:

- [ ] Chrome + VoiceOver (macOS)
- [ ] Safari + VoiceOver (macOS)
- [ ] Firefox + NVDA (Windows)
- [ ] Edge + Narrator (Windows)

## Automated Checks

Run the following tools:

```bash
# Lighthouse accessibility audit
pnpm build
pnpm preview
# Open Chrome DevTools → Lighthouse → Accessibility

# axe DevTools
# Install axe DevTools browser extension
# Run scan on page with modal open
```

## Expected Results

All checks should pass with:
- ✅ No ARIA violations
- ✅ No color contrast violations
- ✅ No keyboard navigation issues
- ✅ No focus management issues
- ✅ 100% Lighthouse accessibility score
