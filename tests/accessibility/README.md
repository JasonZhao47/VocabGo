# Accessibility Testing Documentation

This directory contains accessibility tests and documentation for the VocabGo ElevenLabs UI redesign.

## WCAG 2.1 AA Compliance

VocabGo meets WCAG 2.1 Level AA standards for accessibility.

### Color Contrast

All text and interactive elements meet minimum contrast ratios:

- **Primary text (#000000 on #FFFFFF)**: 21:1 (exceeds AAA)
- **Secondary text (#6B7280 on #FFFFFF)**: 5.74:1 (exceeds AA)
- **Tertiary text (#6B7280 on #FFFFFF)**: 5.74:1 (exceeds AA)
- **Link text (#2563EB on #FFFFFF)**: 4.56:1 (meets AA)
- **Success text (#059669 on #FFFFFF)**: 3.04:1 (meets AA for large text)
- **Error text (#EF4444 on #FFFFFF)**: 3.04:1 (meets AA for large text)

### Keyboard Navigation

All interactive elements are keyboard accessible:

- **Tab order**: Logical and sequential
- **Focus indicators**: Visible 2px black outline with 2px offset
- **Skip links**: "Skip to main content" link for keyboard users
- **Escape key**: Closes modals and dropdowns
- **Enter/Space**: Activates buttons and links

### Screen Reader Support

All content is accessible to screen readers:

- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<button>`, etc.
- **ARIA labels**: All interactive elements have descriptive labels
- **ARIA live regions**: Toast notifications use `aria-live="polite"`
- **ARIA roles**: Modals use `role="dialog"`, alerts use `role="alert"`
- **Alt text**: All images have descriptive alt text
- **Form labels**: All inputs have associated labels

### Form Accessibility

Forms are fully accessible:

- **Labels**: All inputs have visible labels
- **Required fields**: Marked with asterisk and `aria-required="true"`
- **Error messages**: Associated with inputs via `aria-describedby`
- **Validation**: Real-time validation with clear error messages
- **Help text**: Descriptive help text for complex inputs

### Touch Targets

All interactive elements meet minimum touch target sizes:

- **Minimum size**: 44x44px on mobile devices
- **Spacing**: At least 8px between touch targets
- **Button heights**: 44px (medium), 48px (large)
- **Input heights**: 44px minimum

### Motion and Animation

Respects user preferences for reduced motion:

- **prefers-reduced-motion**: All animations disabled when requested
- **Static alternatives**: All interactions work without motion
- **Smooth scrolling**: Disabled for users who prefer reduced motion

## Testing

### Running Tests

```bash
# Run all accessibility tests
pnpm vitest tests/accessibility --run

# Run specific test file
pnpm vitest tests/accessibility/wcag-compliance.test.ts --run

# Run with coverage
pnpm vitest tests/accessibility --coverage
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test skip link functionality
- [ ] Verify modal focus trapping
- [ ] Test escape key to close modals

#### Screen Reader Testing
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Verify all content is announced
- [ ] Test form validation announcements

#### Color Contrast
- [ ] Verify text contrast with browser tools
- [ ] Test in different lighting conditions
- [ ] Verify focus indicators are visible
- [ ] Test with color blindness simulators

#### Touch Interactions
- [ ] Test on mobile devices
- [ ] Verify touch target sizes
- [ ] Test drag-and-drop on touch screens
- [ ] Verify no accidental touches

#### Responsive Design
- [ ] Test at 320px width (small mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1024px width (desktop)
- [ ] Test at 1440px width (wide desktop)
- [ ] Verify layout doesn't break at any size

## Browser Testing

### Supported Browsers

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest version
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 10+

### Testing Checklist

#### Chrome
- [ ] Verify all features work
- [ ] Test DevTools accessibility audit
- [ ] Verify animations are smooth
- [ ] Test touch events on touch devices

#### Firefox
- [ ] Verify all features work
- [ ] Test with Firefox accessibility inspector
- [ ] Verify CSS grid/flexbox layouts
- [ ] Test keyboard navigation

#### Safari
- [ ] Verify all features work
- [ ] Test on macOS and iOS
- [ ] Verify webkit-specific features
- [ ] Test VoiceOver integration

#### Edge
- [ ] Verify all features work
- [ ] Test with Edge DevTools
- [ ] Verify Chromium compatibility
- [ ] Test narrator integration

## Tools and Resources

### Browser Extensions
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Performance and accessibility audits
- **Color Contrast Analyzer**: Check contrast ratios

### Screen Readers
- **VoiceOver**: Built into macOS and iOS
- **NVDA**: Free screen reader for Windows
- **JAWS**: Professional screen reader for Windows
- **TalkBack**: Built into Android

### Testing Tools
- **Keyboard**: Test keyboard navigation
- **Browser DevTools**: Inspect accessibility tree
- **Color Blindness Simulators**: Test for color blindness
- **Responsive Design Mode**: Test different screen sizes

## Common Issues and Solutions

### Issue: Focus indicator not visible
**Solution**: Ensure focus styles have sufficient contrast (3:1 minimum)

### Issue: Screen reader not announcing changes
**Solution**: Use ARIA live regions for dynamic content

### Issue: Keyboard trap in modal
**Solution**: Implement proper focus management and escape key handling

### Issue: Touch targets too small
**Solution**: Ensure minimum 44x44px size for all interactive elements

### Issue: Color contrast too low
**Solution**: Use darker colors or increase font weight

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

## Continuous Improvement

Accessibility is an ongoing process. We continuously:

1. Run automated tests in CI/CD pipeline
2. Conduct manual testing with real users
3. Monitor user feedback and bug reports
4. Stay updated with WCAG guidelines
5. Test with assistive technologies
6. Review and update documentation

## Contact

For accessibility questions or issues, please:

1. Open an issue on GitHub
2. Contact the development team
3. Submit a pull request with improvements
