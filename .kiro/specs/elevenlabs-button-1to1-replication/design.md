# Design Document

## Overview

This design outlines the technical approach for updating the Button component to achieve a 1:1 visual match with ElevenLabs Productions page buttons. The changes focus on precise styling adjustments to border radius, typography, sizing, and transitions while maintaining all existing functionality and accessibility features.

## Architecture

### Component Structure

The implementation will modify the existing Button component (`src/components/ui/Button.vue`) without changing its API or functionality. The component will continue to support:

- Multiple variants (primary, secondary, ghost, destructive)
- Multiple sizes (sm, md, lg)
- Loading states
- Disabled states
- Full-width option
- Ripple effects (optional)
- Icon slots

### Design Tokens Update

Update `src/config/elevenlabsDesignTokens.ts` to include button-specific tokens that match the ElevenLabs reference:

```typescript
button: {
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '20px',
  transition: {
    duration: '75ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  sizes: {
    sm: {
      height: '32px',
      paddingX: '10px'
    },
    md: {
      height: '36px',
      paddingX: '12px'
    },
    lg: {
      height: '40px',
      paddingX: '16px'
    }
  }
}
```

## Components and Interfaces

### Button Component Updates

**File:** `src/components/ui/Button.vue`

#### Style Changes

1. **Border Radius**
   - Current: `rounded-full` (9999px)
   - New: `rounded-lg` (8px via Tailwind config)

2. **Typography**
   - Font size: `text-[13px]` (13px)
   - Font weight: `font-medium` (500)
   - Line height: `leading-[20px]` (20px)

3. **Button Sizing**
   - Small: `h-8 px-[10px]` (32px height, 10px horizontal padding)
   - Medium: `h-9 px-3` (36px height, 12px horizontal padding)
   - Large: `h-10 px-4` (40px height, 16px horizontal padding)
   - Remove vertical padding (py-*) classes

4. **Transitions**
   - Duration: `duration-[75ms]` (75ms)
   - Remove hover scale transforms
   - Keep opacity transitions for hover/active states

5. **Variant Colors**
   - Secondary: Add `border border-[rgba(0,0,29,0.1)]` for white background with subtle border
   - Ghost: Maintain transparent background, no border
   - Primary: Keep existing black background
   - Text color for secondary/ghost: `text-[rgb(15,15,16)]`

#### Implementation Strategy

Use Tailwind CSS utility classes for all styling changes. The computed `buttonClasses` function will be updated to apply the new class combinations based on variant and size props.

### Upload Page Integration

**File:** `src/pages/UploadPage.vue`

Update the "Upload and Process" button to use `size="md"` instead of `size="lg"` to match the ElevenLabs reference sizing.

## Data Models

No data model changes required. The Button component props interface remains unchanged:

```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  tag?: 'button' | 'a'
  type?: 'button' | 'submit' | 'reset'
  ripple?: boolean
  ariaLabel?: string
}
```

## Error Handling

No new error handling required. Existing error handling for:
- Invalid prop values
- Loading states
- Disabled states

...will continue to function as designed.

## Testing Strategy

### Visual Regression Testing

1. **Component Demo Page**
   - Verify all button variants render with correct styling
   - Check all size variations
   - Validate hover, active, and focus states
   - Test loading and disabled states

2. **Upload Page Integration**
   - Verify button styling matches ElevenLabs reference
   - Test responsive behavior
   - Validate accessibility features

### Manual Testing Checklist

- [ ] Border radius is 8px (not fully rounded)
- [ ] Font size is 13px with weight 500
- [ ] Line height is 20px
- [ ] Button heights match specifications (32px, 36px, 40px)
- [ ] Horizontal padding matches specifications
- [ ] No scale transform on hover
- [ ] Transition duration is 75ms
- [ ] Secondary variant has subtle border
- [ ] All variants maintain proper contrast ratios
- [ ] Keyboard navigation works correctly
- [ ] Focus indicators are visible
- [ ] Loading spinner displays correctly
- [ ] Disabled state styling is appropriate

### Browser Compatibility

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Implementation Notes

### Tailwind Configuration

Ensure `tailwind.config.js` includes the necessary custom values:

```javascript
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'lg': '8px'
      },
      fontSize: {
        '13': '13px'
      },
      lineHeight: {
        '20': '20px'
      },
      transitionDuration: {
        '75': '75ms'
      }
    }
  }
}
```

### Accessibility Considerations

- Maintain WCAG AA contrast ratios for all button variants
- Ensure focus indicators remain visible with 8px border radius
- Preserve keyboard navigation functionality
- Keep ARIA attributes and labels intact

### Performance Considerations

- Use CSS transitions (not JavaScript animations) for optimal performance
- Leverage GPU acceleration for opacity transitions
- Avoid layout thrashing by using transform-free hover states

## Migration Path

1. Update design tokens in `elevenlabsDesignTokens.ts`
2. Modify Button component styling in `Button.vue`
3. Update Upload page button size
4. Run visual regression tests
5. Verify accessibility compliance
6. Test across browsers and devices

## Rollback Strategy

If issues arise:
1. Revert Button.vue changes
2. Revert design token updates
3. Revert Upload page changes
4. All functionality will return to previous state

The component API remains unchanged, so no consumer code needs modification during rollback.
