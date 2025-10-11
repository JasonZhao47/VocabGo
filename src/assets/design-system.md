# ElevenLabs-Inspired Design System

This document outlines the design system foundation implemented for VocabGo's UI redesign.

## Quick Reference

### Colors
- **Primary**: `bg-primary` (#000000) - Black buttons and accents
- **Text**: `text-primary` (#000000), `text-secondary` (#6B7280), `text-tertiary` (#9CA3AF)
- **Surfaces**: `bg-background` (#FFFFFF), `bg-surface-light` (#FAFAFA)
- **Borders**: `border-light` (#F3F4F6), `border-medium` (#E5E7EB), `border-input` (#D1D5DB)

### Typography
- **Display**: `text-display` (48px/56px, bold)
- **H1**: `text-h1` (36px/44px, bold)
- **H2**: `text-h2` (24px/32px, semibold)
- **Body**: `text-body` (16px/24px, normal)
- **Small**: `text-body-small` (14px/20px, normal)

### Spacing (8px Grid)
- **XS**: `space-xs` (4px)
- **SM**: `space-sm` (8px)
- **MD**: `space-md` (16px)
- **LG**: `space-lg` (24px)
- **XL**: `space-xl` (32px)
- **2XL**: `space-2xl` (48px)
- **3XL**: `space-3xl` (64px)

### Components

#### Buttons
```html
<!-- Primary black pill button -->
<button class="btn-primary">Generate Wordlist</button>

<!-- Secondary outlined button -->
<button class="btn-secondary">Export</button>

<!-- Text link button -->
<button class="btn-text">View Details</button>
```

#### Inputs
```html
<input class="input-base" placeholder="Enter text..." />
```

#### Cards
```html
<!-- Static card -->
<div class="card-base p-lg">Content</div>

<!-- Interactive card -->
<div class="card-interactive p-lg">Clickable content</div>
```

#### Layout
```html
<!-- Centered container -->
<div class="container-centered">
  <!-- Page header pattern -->
  <header class="page-header">
    <div class="page-label">Upload Document</div>
    <h1 class="page-title">Upload Document</h1>
    <p class="page-subtitle">Extract vocabulary from your reading materials</p>
  </header>
</div>
```

### Responsive Breakpoints
- **Mobile**: 0-767px (`mobile:`)
- **Tablet**: 768-1023px (`tablet:`)
- **Desktop**: 1024px+ (`desktop:`)
- **Wide**: 1440px+ (`wide:`)

### Animations
- **Fade In**: `animate-fade-in`
- **Slide Up**: `animate-slide-up`
- **Scale In**: `animate-scale-in`

### CSS Custom Properties
All design tokens are available as CSS custom properties:
- `var(--color-primary)`
- `var(--spacing-lg)`
- `var(--radius-md)`
- `var(--transition-normal)`

## Implementation Notes

1. **Mobile-First**: All responsive utilities follow mobile-first approach
2. **Accessibility**: Focus states and reduced motion preferences are handled
3. **Performance**: Animations respect `prefers-reduced-motion`
4. **Consistency**: Use the predefined component classes for common patterns

## Next Steps

With the design system foundation in place, you can now:
1. Apply the new styles to existing components
2. Create new UI components using the design tokens
3. Implement the ElevenLabs-inspired layouts for each page