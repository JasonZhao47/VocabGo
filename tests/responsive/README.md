# Responsive Design Testing Documentation

This directory contains responsive design tests and documentation for the VocabGo ElevenLabs UI redesign.

## Breakpoints

VocabGo uses a mobile-first responsive design approach with the following breakpoints:

| Breakpoint | Min Width | Max Width | Description |
|------------|-----------|-----------|-------------|
| Mobile     | 0px       | 767px     | Smartphones and small devices |
| Tablet     | 768px     | 1023px    | Tablets and medium devices |
| Desktop    | 1024px    | ∞         | Desktop computers and large screens |

### Critical Test Widths

Test at these specific widths to catch edge cases:

- **320px**: Smallest mobile devices (iPhone SE)
- **375px**: Standard mobile (iPhone 12/13)
- **768px**: Tablet portrait (iPad)
- **1024px**: Tablet landscape / Small desktop
- **1440px**: Standard desktop
- **1920px**: Large desktop

## Mobile Layout (0px - 767px)

### Layout Characteristics

- **Columns**: Single column layout
- **Padding**: 16px horizontal padding
- **Font sizes**: Reduced by 10-25% from desktop
- **Buttons**: Full-width buttons
- **Navigation**: Hamburger menu
- **Drop zone**: 240px minimum height

### Typography Scale

| Element | Mobile Size | Desktop Size |
|---------|-------------|--------------|
| Display | 32px        | 48px         |
| H1      | 28px        | 36px         |
| H2      | 20px        | 24px         |
| Body    | 15px        | 16px         |
| Small   | 13px        | 14px         |

### Touch Targets

All interactive elements must meet minimum touch target sizes:

- **Minimum size**: 44x44px
- **Recommended size**: 48x48px
- **Spacing**: 8px minimum between targets

### Mobile-Specific Features

- Hamburger menu for navigation
- Full-width form inputs
- Stacked button groups
- Horizontal scroll for tables
- Reduced animation complexity

## Tablet Layout (768px - 1023px)

### Layout Characteristics

- **Columns**: 2-column grids
- **Padding**: 24px horizontal padding
- **Font sizes**: Intermediate between mobile and desktop
- **Buttons**: Auto-width with minimum width
- **Navigation**: Full navigation bar
- **Drop zone**: 280px minimum height

### Grid Layouts

- **Wordlist cards**: 2 columns
- **Feature cards**: 2 columns
- **Form layouts**: 2 columns where appropriate

## Desktop Layout (1024px+)

### Layout Characteristics

- **Columns**: 3-column grids
- **Padding**: 32px horizontal padding
- **Max width**: 1200px centered container
- **Font sizes**: Full desktop sizes
- **Buttons**: Auto-width with padding
- **Navigation**: Full navigation bar
- **Drop zone**: 280px minimum height

### Grid Layouts

- **Wordlist cards**: 3 columns
- **Feature cards**: 3-4 columns
- **Form layouts**: Multi-column where appropriate

## Responsive Components

### Header

**Mobile (< 768px)**
- Height: 56px
- Logo: 20px font size
- Hamburger menu button
- Collapsible navigation

**Tablet/Desktop (≥ 768px)**
- Height: 64px
- Logo: 24px font size
- Full navigation links
- User actions on right

### Hero Section

**Mobile**
- Padding: 48px vertical
- Title: 36px
- Subtitle: 16px
- Full-width button

**Tablet**
- Padding: 64px vertical
- Title: 42px
- Subtitle: 17px
- Auto-width button

**Desktop**
- Padding: 80px vertical
- Title: 48px
- Subtitle: 18px
- Auto-width button

### Upload Drop Zone

**Mobile**
- Min height: 240px
- Padding: 24px
- Icon: 32px
- Text: 14px/15px

**Tablet/Desktop**
- Min height: 280px
- Padding: 32px
- Icon: 40px
- Text: 15px/16px

### Wordlist Cards

**Mobile**
- Grid: 1 column
- Gap: 16px
- Padding: 20px

**Tablet**
- Grid: 2 columns
- Gap: 20px
- Padding: 24px

**Desktop**
- Grid: 3 columns
- Gap: 24px
- Padding: 24px

### Tables

**Mobile**
- Horizontal scroll
- Shadow indicators
- Minimum column width
- Sticky first column (optional)

**Tablet/Desktop**
- Full table layout
- No horizontal scroll
- Flexible column widths

## Testing

### Running Tests

```bash
# Run all responsive tests
pnpm vitest tests/responsive --run

# Run specific test file
pnpm vitest tests/responsive/breakpoint-testing.test.ts --run

# Run with watch mode
pnpm vitest tests/responsive
```

### Manual Testing Checklist

#### Mobile Testing (320px - 767px)
- [ ] Test at 320px width
- [ ] Test at 375px width
- [ ] Test at 414px width
- [ ] Verify single column layouts
- [ ] Check touch target sizes
- [ ] Test hamburger menu
- [ ] Verify full-width buttons
- [ ] Test horizontal scroll on tables
- [ ] Check font sizes are readable
- [ ] Verify no horizontal overflow

#### Tablet Testing (768px - 1023px)
- [ ] Test at 768px width
- [ ] Test at 834px width
- [ ] Test at 1024px width
- [ ] Verify 2-column grids
- [ ] Check navigation bar
- [ ] Test button layouts
- [ ] Verify spacing and padding
- [ ] Check typography scales

#### Desktop Testing (1024px+)
- [ ] Test at 1024px width
- [ ] Test at 1280px width
- [ ] Test at 1440px width
- [ ] Test at 1920px width
- [ ] Verify 3-column grids
- [ ] Check max-width container
- [ ] Test full layouts
- [ ] Verify all features visible

#### Orientation Testing
- [ ] Test portrait orientation
- [ ] Test landscape orientation
- [ ] Verify layout adapts correctly
- [ ] Check for content overflow

#### Device Testing
- [ ] iPhone SE (320px)
- [ ] iPhone 12/13 (375px)
- [ ] iPhone 12/13 Pro Max (428px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1440px+)

## Browser DevTools

### Chrome DevTools

1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test at different breakpoints
5. Use responsive mode to drag resize

### Firefox DevTools

1. Open DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test at different breakpoints
5. Rotate device orientation

### Safari DevTools

1. Open Web Inspector (Cmd+Option+I)
2. Enter responsive design mode
3. Select device or enter custom dimensions
4. Test at different breakpoints

## Common Issues and Solutions

### Issue: Horizontal scroll on mobile
**Solution**: Check for fixed widths, use max-width: 100%, check padding/margins

### Issue: Text too small on mobile
**Solution**: Increase font size to minimum 14px, check line-height

### Issue: Touch targets too small
**Solution**: Increase to minimum 44x44px, add padding

### Issue: Layout breaks at specific width
**Solution**: Test at critical widths, adjust breakpoints, use flexible units

### Issue: Images overflow container
**Solution**: Use max-width: 100%, height: auto

### Issue: Table doesn't fit on mobile
**Solution**: Implement horizontal scroll, consider card layout alternative

## Performance Considerations

### Mobile Performance

- Minimize JavaScript execution
- Optimize images for mobile
- Reduce animation complexity
- Use CSS for layout changes
- Lazy load images and components

### Responsive Images

```html
<!-- Use srcset for responsive images -->
<img 
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
  alt="Description"
/>
```

### CSS Media Queries

```css
/* Mobile first approach */
.element {
  /* Mobile styles */
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .element {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .element {
    padding: 32px;
  }
}
```

## Accessibility Considerations

### Responsive Accessibility

- Maintain keyboard navigation at all sizes
- Ensure focus indicators are visible
- Keep touch targets at minimum 44x44px
- Maintain color contrast at all sizes
- Test with screen readers on mobile

### Zoom Testing

- Test at 200% zoom level
- Verify no horizontal scroll
- Check text remains readable
- Ensure buttons remain accessible

## Resources

- [Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)
- [Mobile-First CSS](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

## Continuous Testing

Responsive design should be tested:

1. During development (DevTools)
2. Before each commit (automated tests)
3. Before each release (manual testing)
4. On real devices regularly
5. After any layout changes

## Contact

For responsive design questions or issues, please:

1. Open an issue on GitHub
2. Contact the development team
3. Submit a pull request with improvements
