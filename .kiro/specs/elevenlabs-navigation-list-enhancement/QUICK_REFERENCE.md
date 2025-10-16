# Quick Reference Guide

## Design Tokens Cheat Sheet

```typescript
import { designTokens } from '@/config/designTokens'

// Colors
designTokens.colors.gray[500]      // #6B7280
designTokens.colors.danger         // #DC2626

// Spacing (8px grid)
designTokens.spacing.sm            // 8px
designTokens.spacing.md            // 12px
designTokens.spacing.lg            // 16px

// Typography
designTokens.typography.fontSize.base    // 15px
designTokens.typography.fontWeight.medium // 500

// Transitions
designTokens.transitions.fast      // 150ms
designTokens.transitions.easing    // 'ease-out'

// Border Radius
designTokens.borderRadius.md       // 6px
designTokens.borderRadius.xl       // 12px
```

## Component Quick Start

### ActionButton

```vue
<ActionButton
  icon="download"
  label="Download"
  @click="handleClick"
/>
```

### DataTable

```vue
<DataTable
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'date', label: 'Date' }
  ]"
  :data="items"
  :actions="[
    { icon: 'edit', label: 'Edit', onClick: handleEdit }
  ]"
/>
```

### Sidebar

```vue
<Sidebar
  :collapsed="false"
  :items="[
    { id: 'home', label: 'Home', icon: 'home', route: '/' }
  ]"
/>
```

### CategoryCard

```vue
<CategoryCard
  title="Upload"
  description="Upload documents"
  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  @click="navigate"
/>
```

## Accessibility Checklist

- [ ] All buttons have `aria-label`
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus indicators visible
- [ ] Touch targets ≥ 44x44px
- [ ] Respects `prefers-reduced-motion`

## Responsive Breakpoints

```typescript
mobile:  0-767px   // Drawer navigation, card layout
tablet:  768-1023px // Collapsible sidebar
desktop: 1024px+    // Full sidebar, table layout
```

## Common Patterns

### Loading State

```vue
<ActionButton
  :loading="isLoading"
  :disabled="isLoading"
  label="Save"
  icon="save"
/>
```

### Danger Action

```vue
<ActionButton
  variant="danger"
  icon="trash"
  label="Delete"
  @click="confirmDelete"
/>
```

### Conditional Actions

```vue
<DataTable
  :actions="[
    {
      icon: 'edit',
      label: 'Edit',
      onClick: handleEdit,
      disabled: (row) => !row.editable
    }
  ]"
/>
```

## Performance Tips

1. Use `v-memo` for large lists
2. Lazy load images with `loading="lazy"`
3. Use CSS transforms for animations
4. Implement virtual scrolling for >100 rows
5. Code split routes with dynamic imports

## Testing Commands

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test ActionButton.test.ts

# Run accessibility tests
pnpm test tests/accessibility/

# Run with coverage
pnpm test --coverage
```
