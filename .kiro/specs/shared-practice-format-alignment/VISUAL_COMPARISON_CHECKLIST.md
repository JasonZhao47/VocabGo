# Visual Comparison Checklist

## Purpose
This checklist helps verify pixel-perfect alignment between the shared practice view and the downloaded HTML template.

## Quick Reference: Key Visual Elements

### Container Styles
```css
max-width: 800px
margin: 0 auto
background: #ffffff
border-radius: 16px
padding: 32px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
```

### Question Card Styles
```css
margin-bottom: 32px
padding: 24px
background: #f9fafb
border-radius: 12px
border: 2px solid #e5e7eb
```

### Matching Item Styles
```css
padding: 12px 16px
background: #ffffff
border: 2px solid #e5e7eb
border-radius: 8px
transition: all 150ms ease-out
```

### States
- **Selected**: border-color: #000000, background: #f3f4f6
- **Matched**: border-color: #10b981, background: #ecfdf5, opacity: 0.7
- **Incorrect**: border-color: #ef4444, background: #fef2f2, animation: shake

## Side-by-Side Comparison

### Setup
1. Open downloaded HTML file: `practice_template.html`
2. Open share link: `http://localhost:5173/practice/{shareToken}`
3. Use browser split-screen or two monitors
4. Zoom to 100% on both

### Visual Elements to Compare

#### ✅ Header Section
- [ ] Title font size (28px)
- [ ] Title font weight (700)
- [ ] Title color (#1a1a1a)
- [ ] Subtitle font size (15px)
- [ ] Subtitle color (#6b7280)
- [ ] Spacing between title and subtitle (8px)
- [ ] Bottom border (2px solid #e5e7eb)
- [ ] Padding bottom (24px)

#### ✅ Question Header
- [ ] Question number font size (14px)
- [ ] Question number font weight (600)
- [ ] Question type font size (12px)
- [ ] Question type uppercase
- [ ] Question type letter spacing (0.5px)
- [ ] Flex layout (space-between)
- [ ] Bottom border (1px solid #e5e7eb)
- [ ] Padding bottom (12px)

#### ✅ Matching Question Layout
- [ ] Grid template columns (1fr 1fr)
- [ ] Gap between columns (16px)
- [ ] Gap between items (12px)
- [ ] Item padding (12px 16px)
- [ ] Item border radius (8px)
- [ ] Item border width (2px)
- [ ] Item border color (#e5e7eb)
- [ ] Item background (#ffffff)
- [ ] Item text alignment (center)

#### ✅ Matching Question States
- [ ] Hover: border-color #d1d5db, background #f9fafb
- [ ] Selected: border-color #000000, background #f3f4f6, box-shadow
- [ ] Matched: border-color #10b981, background #ecfdf5, opacity 0.7
- [ ] Incorrect: border-color #ef4444, background #fef2f2
- [ ] Shake animation: translateX(-4px to 4px), 300ms

#### ✅ Fill-Blank Question
- [ ] Sentence font size (16px)
- [ ] Sentence color (#374151)
- [ ] Sentence line height (1.6)
- [ ] Hint section background (#fef3c7)
- [ ] Hint section border (#fde68a)
- [ ] Hint section padding (12px)
- [ ] Hint section border radius (8px)
- [ ] Hint label font weight (600)
- [ ] Hint label color (#92400e)
- [ ] Hint text font family (monospace)
- [ ] Hint text letter spacing (2px)
- [ ] Input field width (100%)
- [ ] Input field padding (12px 16px)
- [ ] Input field border (2px solid #e5e7eb)
- [ ] Input field border radius (8px)
- [ ] Input field focus border (#000000)
- [ ] Input field focus box-shadow

#### ✅ Multiple-Choice Question
- [ ] Sentence font size (16px)
- [ ] Sentence margin bottom (16px)
- [ ] Options gap (12px)
- [ ] Option padding (14px 16px)
- [ ] Option background (#ffffff)
- [ ] Option border (2px solid #e5e7eb)
- [ ] Option border radius (8px)
- [ ] Option text alignment (left)
- [ ] Option hover: border-color #d1d5db, background #f9fafb
- [ ] Option selected: border-color #000000, background #f3f4f6, box-shadow

#### ✅ Submit Button
- [ ] Padding (16px 48px)
- [ ] Background (#000000)
- [ ] Color (#ffffff)
- [ ] Border radius (8px)
- [ ] Font size (16px)
- [ ] Font weight (600)
- [ ] Hover: background #1f2937, translateY(-1px), box-shadow
- [ ] Active: translateY(0)

#### ✅ Results Modal
- [ ] Overlay background (rgba(0, 0, 0, 0.5))
- [ ] Modal background (#ffffff)
- [ ] Modal border radius (16px)
- [ ] Modal padding (48px)
- [ ] Modal max-width (500px)
- [ ] Modal box-shadow (0 20px 60px rgba(0, 0, 0, 0.3))
- [ ] Icon font size (64px)
- [ ] Title font size (32px)
- [ ] Title font weight (700)
- [ ] Score text font size (20px)
- [ ] Count text font size (16px)
- [ ] Try Again button padding (14px 32px)
- [ ] Try Again button background (#10b981)
- [ ] Try Again button hover (#059669)

#### ✅ Responsive Breakpoints
- [ ] Mobile breakpoint: 640px
- [ ] Container padding mobile: 20px
- [ ] Matching columns mobile: 1fr (stacked)
- [ ] Question padding mobile: 16px
- [ ] Results padding mobile: 32px 24px
- [ ] Results margin mobile: 16px

## Screenshot Comparison

### Recommended Screenshots
1. **Full page view** - Desktop (1920x1080)
2. **Matching question** - Close-up
3. **Fill-blank question** - Close-up
4. **Multiple-choice question** - Close-up
5. **Submit button** - Close-up
6. **Results modal** - Full view
7. **Mobile view** - iPhone SE (375x667)
8. **Tablet view** - iPad (768x1024)

### Screenshot Tool
Use browser DevTools or a tool like:
- Chrome DevTools (Cmd+Shift+P → "Capture screenshot")
- Firefox Screenshot tool
- Third-party: Percy, Chromatic, BackstopJS

## Color Palette Verification

### Primary Colors
```
Background:     #f9fafb  ⬜
Container:      #ffffff  ⬜
Text Primary:   #1a1a1a  ⬛
Text Secondary: #6b7280  ⬜
Border Default: #e5e7eb  ⬜
Border Hover:   #d1d5db  ⬜
Border Focus:   #000000  ⬛
Success:        #10b981  🟢
Error:          #ef4444  🔴
Warning:        #fef3c7  🟡
```

### Use Color Picker
1. Open browser DevTools
2. Use color picker tool
3. Click on elements
4. Verify hex values match

## Typography Verification

### Font Families
- Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- Monospace: monospace (for hints)

### Font Sizes
```
Title:          28px
Subtitle:       15px
Question #:     14px
Question Type:  12px
Question Title: 18px
Body Text:      15px
Sentence:       16px
Button:         16px
Results Title:  32px
Results Score:  20px
```

### Font Weights
```
Regular:  400
Medium:   500
SemiBold: 600
Bold:     700
```

## Spacing Verification

### Margins
```
Question bottom:    32px
Title bottom:       8px
Subtitle bottom:    16px
Sentence bottom:    16px
Options gap:        12px
Matching gap:       16px
```

### Padding
```
Container:          32px (20px mobile)
Question card:      24px (16px mobile)
Matching item:      12px 16px
Option:             14px 16px
Input:              12px 16px
Button:             16px 48px
Results modal:      48px (32px 24px mobile)
```

## Animation Verification

### Transitions
```
All elements:       150ms ease-out
Hover effects:      150ms ease-out
Focus effects:      150ms ease-out
```

### Keyframe Animations
```
Shake:
  Duration:         300ms
  Easing:           ease-in-out
  Transform:        translateX(-4px to 4px)
  Keyframes:        0%, 100% (0), 25% (-4px), 75% (4px)
```

### Performance
- [ ] Animations run at 60fps
- [ ] No jank or stuttering
- [ ] Smooth transitions
- [ ] GPU acceleration used where appropriate

## Accessibility Verification

### Color Contrast
Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

- [ ] Text on background: 4.5:1 minimum (AA)
- [ ] Large text: 3:1 minimum (AA)
- [ ] Interactive elements: 3:1 minimum (AA)

### Focus Indicators
- [ ] All interactive elements have visible focus
- [ ] Focus outline is clear and consistent
- [ ] Focus order is logical

## Browser-Specific Checks

### Chrome/Edge
- [ ] Border radius renders correctly
- [ ] Box shadows render correctly
- [ ] Animations are smooth
- [ ] Grid layout works

### Firefox
- [ ] Border radius renders correctly
- [ ] Box shadows render correctly
- [ ] Animations are smooth
- [ ] Grid layout works

### Safari
- [ ] Border radius renders correctly (known issues with Safari)
- [ ] Box shadows render correctly
- [ ] Animations are smooth
- [ ] Grid layout works
- [ ] -webkit prefixes applied where needed

## Final Verification

### Pixel-Perfect Checklist
- [ ] All measurements match exactly
- [ ] All colors match exactly
- [ ] All fonts match exactly
- [ ] All spacing matches exactly
- [ ] All animations match exactly
- [ ] All states match exactly
- [ ] All responsive breakpoints match exactly

### User Experience Checklist
- [ ] Visual hierarchy is clear
- [ ] Interactive elements are obvious
- [ ] Feedback is immediate
- [ ] Errors are clear
- [ ] Success states are celebratory
- [ ] Loading states are informative

## Notes Section

### Differences Found
[Document any differences between HTML template and Vue component]

### Intentional Deviations
[Document any intentional differences and reasons]

### Browser-Specific Issues
[Document any browser-specific rendering issues]

### Performance Issues
[Document any performance concerns]

## Sign-Off

**Tester:** _______________
**Date:** _______________
**Status:** ☐ Pass ☐ Fail ☐ Pass with Notes

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
