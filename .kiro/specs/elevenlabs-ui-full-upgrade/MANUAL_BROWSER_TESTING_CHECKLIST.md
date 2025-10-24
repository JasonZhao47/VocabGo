# Manual Cross-Browser Testing Checklist

## Instructions

This checklist should be completed by manually testing the application in each browser. Check off items as you verify them.

## Testing Environment Setup

### Before You Begin
- [ ] Clear browser cache and cookies
- [ ] Disable browser extensions (test in incognito/private mode)
- [ ] Have design mockups/reference available
- [ ] Test on actual devices when possible (especially for Safari iOS)
- [ ] Document browser versions being tested

### Browser Versions to Test
- Chrome: Version _____ (latest stable)
- Firefox: Version _____ (latest stable)
- Safari: Version _____ (macOS/iOS)
- Edge: Version _____ (latest stable)

---

## Chrome Testing Checklist

### Typography & Fonts ✓
- [ ] Waldenburg font loads and displays correctly
- [ ] Font weights (400 regular, 700 bold) render properly
- [ ] Font sizes match design (18px base, 48px H1, 32px H2, 24px H3)
- [ ] Line heights are correct (1.6 body, 1.1 headings)
- [ ] Text is crisp and readable (antialiased)

### Layout & Spacing ✓
- [ ] 8px grid system is consistent across all pages
- [ ] Card padding (24-32px) is correct
- [ ] Container max-width (1200px) works properly
- [ ] Spacing between elements follows design tokens
- [ ] No unexpected overflow or layout shifts

### Colors & Contrast ✓
- [ ] White backgrounds are pure white (rgb(255,255,255))
- [ ] Black text is pure black (rgb(0,0,0))
- [ ] Gray backgrounds match design (rgb(242,242,242))
- [ ] All text meets WCAG AA contrast ratios
- [ ] Colors are consistent across pages

### Buttons & Interactive Elements ✓
- [ ] Primary buttons: black bg, white text, rounded-full
- [ ] Secondary buttons: gray bg, proper styling
- [ ] Ghost buttons: transparent, proper hover
- [ ] Hover transitions are smooth (200ms)
- [ ] Active states show reduced opacity
- [ ] Disabled states show opacity-50
- [ ] Button text is 14px with proper padding

### Form Controls ✓
- [ ] Input fields have 8px border-radius
- [ ] Focus rings are visible (2px outline, 2px offset)
- [ ] Placeholder text has reduced opacity
- [ ] Error states show red borders
- [ ] Textarea matches input styling
- [ ] Form validation feedback appears correctly

### Cards & Containers ✓
- [ ] Cards have 8px or 12px border-radius
- [ ] Subtle shadows render correctly
- [ ] Hover effects increase shadow smoothly
- [ ] Card content is properly padded
- [ ] Nested containers work correctly

### Animations & Transitions ✓
- [ ] Button hover animations are smooth (200ms)
- [ ] Card hover effects work properly
- [ ] Modal fade-in is smooth (300ms)
- [ ] Page transitions work without jank
- [ ] Loading animations are smooth
- [ ] No animation stuttering or lag

### Responsive Behavior ✓
- [ ] Mobile (375px): Stacked layout, 44px touch targets
- [ ] Tablet (768px): Proper breakpoint behavior
- [ ] Desktop (1440px): Good space utilization
- [ ] Hamburger menu works on mobile
- [ ] Navigation adapts correctly
- [ ] Content reflows properly at all sizes

### Accessibility ✓
- [ ] Tab key navigates through all interactive elements
- [ ] Focus indicators are clearly visible
- [ ] Skip-to-content link works
- [ ] ARIA labels are present
- [ ] Keyboard shortcuts work
- [ ] Screen reader announces content correctly

### Performance ✓
- [ ] Page loads quickly (< 3 seconds)
- [ ] Animations run at 60fps
- [ ] No layout shifts during load
- [ ] Font loading doesn't cause FOUT
- [ ] Smooth scrolling performance

**Chrome Issues Found:**
- (Document any issues here)

---

## Firefox Testing Checklist

### Typography & Fonts
- [ ] Waldenburg font loads correctly
- [ ] Font rendering quality is acceptable
- [ ] Font weights render properly
- [ ] Line heights are consistent
- [ ] Text smoothing works (-moz-osx-font-smoothing)

### Layout & Spacing
- [ ] Flexbox layouts work correctly
- [ ] Grid layouts align properly
- [ ] Spacing matches Chrome
- [ ] No layout shifts or reflows

### Colors & Contrast
- [ ] Colors match Chrome exactly
- [ ] Gradients render smoothly (if any)
- [ ] Transparency/opacity works correctly

### Buttons & Interactive Elements
- [ ] Button styles match Chrome
- [ ] Hover states work correctly
- [ ] Active states provide feedback
- [ ] Cursor changes appropriately
- [ ] Transitions are smooth

### Form Controls
- [ ] Input field styling is consistent
- [ ] Focus outlines render correctly
- [ ] Select dropdowns match design
- [ ] Textarea resizing works
- [ ] Form validation displays properly

### Cards & Containers
- [ ] Card styling matches Chrome
- [ ] Shadows render correctly
- [ ] Border-radius is consistent
- [ ] Hover effects work smoothly

### Animations & Transitions
- [ ] CSS transitions work smoothly
- [ ] Transform animations are smooth
- [ ] No animation stuttering
- [ ] Timing functions work correctly

### Responsive Behavior
- [ ] Media queries trigger correctly
- [ ] Mobile viewport renders properly
- [ ] Touch events work (if applicable)
- [ ] Breakpoints match Chrome

### Accessibility
- [ ] Firefox accessibility features work
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible

### Performance
- [ ] Page load speed is acceptable
- [ ] Animations are smooth
- [ ] No performance degradation vs Chrome

**Firefox Issues Found:**
- (Document any issues here)

**Known Firefox Differences:**
- Font rendering may be slightly different (anti-aliasing)
- Focus outlines have different defaults (overridden by CSS)
- Scrollbar styling may differ

---

## Safari Testing Checklist

### Typography & Fonts
- [ ] Waldenburg font loads correctly
- [ ] Font rendering on Retina displays is crisp
- [ ] Font weights render properly
- [ ] -webkit-font-smoothing works
- [ ] Text is readable and crisp

### Layout & Spacing
- [ ] Flexbox works correctly
- [ ] Grid layouts work properly
- [ ] Sticky positioning works
- [ ] Safe area insets respected (iOS)
- [ ] Layout matches Chrome

### Colors & Contrast
- [ ] Color accuracy on different displays
- [ ] Colors match Chrome
- [ ] Transparency works correctly

### Buttons & Interactive Elements
- [ ] Button tap highlights are controlled (iOS)
- [ ] Hover states work (desktop Safari)
- [ ] Active states work (iOS)
- [ ] Touch feedback is appropriate
- [ ] Transitions are smooth

### Form Controls
- [ ] Input fields don't have iOS default styling
- [ ] Focus states work correctly
- [ ] Zoom on focus is controlled (iOS)
- [ ] Select dropdowns work natively
- [ ] Form validation works

### Cards & Containers
- [ ] Card styling matches Chrome
- [ ] Shadows render correctly
- [ ] Border-radius is consistent
- [ ] Hover effects work (desktop)

### Animations & Transitions
- [ ] CSS transitions are smooth
- [ ] Transform animations work
- [ ] will-change is respected
- [ ] No animation lag on older devices

### Responsive Behavior (iOS)
- [ ] iOS viewport units (vh) work correctly
- [ ] Safe area insets (notch) are handled
- [ ] Orientation changes work smoothly
- [ ] Touch gestures don't conflict
- [ ] Pinch-to-zoom is controlled

### Accessibility
- [ ] VoiceOver compatibility (macOS/iOS)
- [ ] Dynamic Type support (iOS)
- [ ] Keyboard navigation (macOS)
- [ ] Focus indicators work

### Performance
- [ ] Page loads quickly on iOS
- [ ] Animations are smooth (60fps)
- [ ] No lag on older devices
- [ ] Scrolling is smooth

**Safari Issues Found:**
- (Document any issues here)

**Known Safari Differences:**
- May require -webkit- prefixes for some properties
- iOS Safari has different form control defaults
- Viewport height (vh) behaves differently on iOS
- Touch events have different behavior

---

## Edge Testing Checklist

### Typography & Fonts
- [ ] Waldenburg font loads correctly
- [ ] Font rendering matches Chrome
- [ ] ClearType rendering on Windows
- [ ] Font weights render properly

### Layout & Spacing
- [ ] Layouts match Chrome behavior
- [ ] No Windows-specific issues
- [ ] Spacing is consistent

### Colors & Contrast
- [ ] Colors render correctly on Windows
- [ ] High contrast mode compatibility
- [ ] Colors match Chrome

### Buttons & Interactive Elements
- [ ] Button interactions work correctly
- [ ] Hover states match Chrome
- [ ] Transitions are smooth

### Form Controls
- [ ] Input fields render correctly
- [ ] Windows form styling is overridden
- [ ] Focus states work properly

### Cards & Containers
- [ ] Card styling matches Chrome
- [ ] Shadows render correctly
- [ ] Border-radius is consistent

### Animations & Transitions
- [ ] Animations match Chrome performance
- [ ] No Windows-specific issues
- [ ] Smooth transitions

### Responsive Behavior
- [ ] Breakpoints work correctly
- [ ] Touch support on Windows tablets
- [ ] Layout adapts properly

### Accessibility
- [ ] Windows Narrator compatibility
- [ ] High contrast mode support
- [ ] Windows accessibility features work
- [ ] Keyboard navigation works

### Performance
- [ ] Performance matches Chrome
- [ ] No Windows-specific lag
- [ ] Smooth animations

**Edge Issues Found:**
- (Document any issues here)

**Known Edge Differences:**
- Edge (Chromium) should behave identically to Chrome
- May have Windows-specific font rendering
- High contrast mode may affect colors

---

## Page-Specific Testing

### HomePage (/)
- [ ] Chrome: All elements render correctly
- [ ] Firefox: All elements render correctly
- [ ] Safari: All elements render correctly
- [ ] Edge: All elements render correctly
- [ ] Typography is consistent across browsers
- [ ] Buttons work in all browsers
- [ ] Animations are smooth in all browsers

### UploadPage (/upload)
- [ ] Chrome: Upload interface works
- [ ] Firefox: Upload interface works
- [ ] Safari: Upload interface works
- [ ] Edge: Upload interface works
- [ ] Drag-and-drop works in all browsers
- [ ] File selection works in all browsers
- [ ] Form validation works in all browsers

### ProcessingPage (/processing)
- [ ] Chrome: Loading states display correctly
- [ ] Firefox: Loading states display correctly
- [ ] Safari: Loading states display correctly
- [ ] Edge: Loading states display correctly
- [ ] Animations are smooth in all browsers
- [ ] Progress indicators work in all browsers

### ResultPage (/result)
- [ ] Chrome: Results display correctly
- [ ] Firefox: Results display correctly
- [ ] Safari: Results display correctly
- [ ] Edge: Results display correctly
- [ ] Tables render properly in all browsers
- [ ] Action buttons work in all browsers

### SavedWordlistsPage (/wordlists)
- [ ] Chrome: Wordlists display correctly
- [ ] Firefox: Wordlists display correctly
- [ ] Safari: Wordlists display correctly
- [ ] Edge: Wordlists display correctly
- [ ] Cards render properly in all browsers
- [ ] Empty states work in all browsers

---

## Critical Issues Matrix

### Priority Levels
- **P0 (Critical)**: Blocks core functionality, must fix immediately
- **P1 (High)**: Significant visual or functional issue, fix before release
- **P2 (Medium)**: Minor visual inconsistency, fix if time permits
- **P3 (Low)**: Cosmetic issue, can be addressed later

### Issues Template

| Browser | Page | Issue | Priority | Status | Notes |
|---------|------|-------|----------|--------|-------|
| Example | HomePage | Button hover not working | P1 | Fixed | Added -webkit- prefix |
|         |          |       |          |        |       |

---

## Browser-Specific Fixes Applied

### Safari Fixes
```css
/* Example fixes that were needed */
```

### Firefox Fixes
```css
/* Example fixes that were needed */
```

### Edge Fixes
```css
/* Example fixes that were needed */
```

---

## Test Results Summary

### Overall Status
- [ ] Chrome: ✅ Pass / ⚠️ Issues / ❌ Fail
- [ ] Firefox: ✅ Pass / ⚠️ Issues / ❌ Fail
- [ ] Safari: ✅ Pass / ⚠️ Issues / ❌ Fail
- [ ] Edge: ✅ Pass / ⚠️ Issues / ❌ Fail

### Critical Issues Count
- P0 (Critical): ___
- P1 (High): ___
- P2 (Medium): ___
- P3 (Low): ___

### Ready for Production?
- [ ] Yes - All critical issues resolved
- [ ] No - Issues remaining (list below)

**Remaining Issues:**
1. 
2. 
3. 

---

## Sign-Off

### Tested By
- **Chrome**: _________________ Date: _______
- **Firefox**: _________________ Date: _______
- **Safari**: _________________ Date: _______
- **Edge**: _________________ Date: _______

### Approved By
- **Product Owner**: _________________ Date: _______
- **Tech Lead**: _________________ Date: _______
- **QA Lead**: _________________ Date: _______

---

## Notes & Observations

### General Observations
- 

### Browser-Specific Notes
- **Chrome**: 
- **Firefox**: 
- **Safari**: 
- **Edge**: 

### Recommendations
- 

---

## Related Documents
- [Cross-Browser Testing Report](./CROSS_BROWSER_TESTING.md)
- [Automated Test Results](../../tests/cross-browser/elevenlabs-ui-browser.test.ts)
- [Design Document](./design.md)
- [Requirements Document](./requirements.md)
