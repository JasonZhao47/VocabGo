# Responsive Design Testing Guide

## Quick Visual Testing

### Using Browser DevTools

1. **Open the Application**
   ```bash
   pnpm dev
   ```
   Navigate to: `http://localhost:5173/upload`

2. **Open DevTools**
   - Chrome/Edge: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

3. **Enable Device Toolbar**
   - Chrome/Edge: Click the device icon or press `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows)
   - Firefox: Click the responsive design mode icon or press `Cmd+Option+M` (Mac) / `Ctrl+Shift+M` (Windows)

### Test Scenarios

#### Scenario 1: Upload Modal on Mobile
1. Set viewport to **iPhone SE (375x667)**
2. Upload a document
3. Verify:
   - ✅ Modal fits within screen (no horizontal scroll)
   - ✅ Title is 18px (smaller than desktop)
   - ✅ Spinner is 48px (medium size)
   - ✅ Stage indicators have 16px gap
   - ✅ All text is readable

#### Scenario 2: Error State on Mobile
1. Keep viewport at **iPhone SE (375x667)**
2. Trigger an error (disconnect network or use invalid file)
3. Verify:
   - ✅ Error icon is 48px (smaller than desktop)
   - ✅ "Try Again" button is at least 44px tall
   - ✅ "Cancel" button is at least 44px tall
   - ✅ Buttons are easy to tap (full width)
   - ✅ Error message text is 14px

#### Scenario 3: Processing State on Tablet
1. Set viewport to **iPad Mini (768x1024)**
2. Upload a document
3. Verify:
   - ✅ Modal uses desktop styles (512px width)
   - ✅ Spinner is 64px (large size)
   - ✅ Stage indicators have 24px gap
   - ✅ Buttons use medium size (36px)

#### Scenario 4: Long Filename on Mobile
1. Set viewport to **iPhone 12 (390x844)**
2. Upload a file with a very long name (e.g., "This_is_a_very_long_filename_that_should_wrap_properly_on_mobile_devices.pdf")
3. Verify:
   - ✅ Filename wraps to multiple lines
   - ✅ No horizontal overflow
   - ✅ Text remains readable

#### Scenario 5: Scrollability Test
1. Set viewport to **iPhone SE (375x667)** (smallest common mobile size)
2. Upload a document and let it process
3. Verify:
   - ✅ If content exceeds viewport, it scrolls smoothly
   - ✅ No content is cut off
   - ✅ Scrolling feels natural (especially on iOS)

#### Scenario 6: Responsive Transition
1. Start with desktop viewport (1280px+)
2. Upload a document
3. Slowly resize browser window to mobile size
4. Verify:
   - ✅ Modal adapts smoothly
   - ✅ No layout jumps or breaks
   - ✅ All elements remain properly positioned

### Device-Specific Testing

#### Small Mobile (375px)
- iPhone SE
- iPhone 12 Mini
- **Expected**: Compact layout, 48px spinner, 44px buttons

#### Standard Mobile (390-430px)
- iPhone 12/13/14
- iPhone 14 Pro Max
- **Expected**: Comfortable layout, 48px spinner, 44px buttons

#### Tablet (768px+)
- iPad Mini
- iPad Air
- **Expected**: Desktop layout, 64px spinner, 36px buttons

#### Desktop (1024px+)
- Laptops
- Desktop monitors
- **Expected**: Full desktop layout, optimal spacing

## Automated Testing Commands

### Type Check
```bash
pnpm type-check
```

### Component Diagnostics
```bash
# Check for TypeScript errors
# (Use Kiro's getDiagnostics tool)
```

## Common Issues to Watch For

### ❌ Horizontal Scrolling
- **Symptom**: Modal extends beyond viewport width
- **Check**: Modal width should be `calc(100vw - 32px)` on mobile

### ❌ Tiny Touch Targets
- **Symptom**: Buttons are hard to tap on mobile
- **Check**: All buttons should be at least 44px tall

### ❌ Overlapping Text
- **Symptom**: Text overlaps or is cut off
- **Check**: Font sizes should scale down on mobile

### ❌ Unreadable Text
- **Symptom**: Text is too small to read
- **Check**: Minimum font size should be 11px (stage labels)

### ❌ Awkward Spacing
- **Symptom**: Elements feel cramped or too spread out
- **Check**: Gaps should be 16-20px on mobile, 24px on desktop

## Accessibility Checks

### Touch Target Size
```
Minimum: 44x44px (WCAG AAA)
Current Implementation:
- Close button: 44x44px ✅
- Action buttons: 44px+ height ✅
```

### Text Readability
```
Minimum: 14px for body text (WCAG AA)
Current Implementation:
- Body text: 14px on mobile ✅
- Stage labels: 11px (acceptable for labels) ✅
```

### Color Contrast
```
All text maintains WCAG AA contrast ratios:
- Black on white: 21:1 ✅
- Gray-600 on white: 7:1 ✅
- Red-700 on red-50: 4.5:1+ ✅
```

## Performance Checks

### CSS Performance
- ✅ Media queries are efficient
- ✅ No JavaScript resize listeners
- ✅ Smooth scrolling enabled for iOS

### Rendering Performance
- ✅ No layout thrashing
- ✅ Smooth transitions
- ✅ GPU-accelerated animations

## Sign-Off Checklist

Before marking task as complete, verify:

- [ ] Modal displays correctly on iPhone SE (375px)
- [ ] Modal displays correctly on iPhone 12 (390px)
- [ ] Modal displays correctly on iPad Mini (768px)
- [ ] Modal displays correctly on desktop (1280px+)
- [ ] All buttons meet 44px minimum touch target
- [ ] Long filenames wrap properly
- [ ] Content scrolls smoothly when needed
- [ ] No horizontal scrolling occurs
- [ ] Typography scales appropriately
- [ ] Spacing feels natural at all sizes
- [ ] Close button is easily tappable
- [ ] Error state displays correctly on mobile
- [ ] Processing stages display correctly on mobile
- [ ] No TypeScript errors
- [ ] No console errors

## Notes

- Test on actual devices when possible (not just DevTools)
- iOS Safari may behave differently than Chrome DevTools
- Test in both portrait and landscape orientations
- Verify smooth scrolling on iOS devices specifically
