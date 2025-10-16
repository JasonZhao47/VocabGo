# Design Document

## Overview

This document outlines the technical design for enhancing VocabGo's navigation and list components to match the aesthetic and interaction patterns observed in ElevenLabs.io. The enhancement focuses on creating a sophisticated, modern interface with smooth interactions, elegant visual hierarchy, and professional polish.

Based on the analysis of ElevenLabs' interface, we identified key design patterns:
- **Minimal left sidebar navigation** with clean typography and subtle hover states
- **Table/list components** with icon-based action buttons and smooth transitions
- **Category cards** with aesthetic backgrounds and hover effects
- **Consistent design tokens** for spacing, typography, and colors

## Architecture

### Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.vue (new)
│   │   └── Header.vue (existing - minimal changes)
│   ├── ui/
│   │   ├── DataTable.vue (new)
│   │   ├── ActionButton.vue (new)
│   │   └── CategoryCard.vue (new)
│   └── wordlist/
│       └── WordlistTable.vue (new - replaces grid)
├── composables/
│   ├── useNavigation.ts (new)
│   └── useTableActions.ts (new)
└── config/
    └── designTokens.ts (new)
```

### Design System Integration

We'll leverage the existing animation system and design tokens while adding ElevenLabs-specific patterns:
- Reuse existing `animationConfig` from `src/config/animations.ts`
- Extend with new interaction patterns
- Maintain consistency with current gradient and color system

## Components and Interfaces

### 1. Sidebar Component

**Purpose:** Provide persistent left-side navigation with ElevenLabs aesthetic

**Interface:**
```typescript
interface SidebarProps {
  collapsed?: boolean
  items: NavigationItem[]
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: string | number
  children?: NavigationItem[]
}
```

**Key Features:**
- Fixed width: 260px (expanded), 72px (collapsed)
- Dark background (#FAFAFA in light mode, #1A1A1A in dark mode)
- Icon + text layout
- Smooth collapse/expand animation
- Active state with accent color
- Collapsible sub-sections

**Styling Approach:**
```css
.sidebar {
  width: 260px;
  background: #FAFAFA;
  border-right: 1px solid #F0F0F0;
  transition: width 200ms ease-out;
}

.sidebar-item {
  padding: 12px 16px;
  font-size: 15px;
  color: #6B7280;
  transition: all 150ms ease-out;
}

.sidebar-item:hover {
  background: #F5F5F5;
  color: #000000;
}

.sidebar-item.active {
  background: #F0F0F0;
  color: #000000;
  font-weight: 600;
}
```

### 2. DataTable Component

**Purpose:** Display wordlists in a clean table format with action buttons

**Interface:**
```typescript
interface DataTableProps<T> {
  columns: TableColumn[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  actions?: TableAction[]
}

interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => string | VNode
}

interface TableAction {
  icon: string
  label: string
  onClick: (row: any) => void
  variant?: 'default' | 'danger'
  disabled?: (row: any) => boolean
}
```

**Key Features:**
- Clean table layout with subtle borders
- Row height: 56px minimum
- Hover states with background change
- Action buttons revealed/emphasized on hover
- Responsive: converts to cards on mobile (<768px)

**Styling Approach:**
```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F0;
}

.table-header-cell {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  text-align: left;
}

.table-row {
  border-bottom: 1px solid #F5F5F5;
  transition: background 150ms ease-out;
}

.table-row:hover {
  background: #FAFAFA;
}

.table-cell {
  padding: 16px;
  font-size: 15px;
  color: #000000;
}

.table-actions {
  display: flex;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 150ms ease-out;
}

.table-row:hover .table-actions {
  opacity: 1;
}
```

### 3. ActionButton Component

**Purpose:** Icon-based action buttons for table rows

**Interface:**
```typescript
interface ActionButtonProps {
  icon: string
  label: string
  variant?: 'default' | 'danger'
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}
```

**Key Features:**
- Icon-only display with tooltip
- Size: 36x36px
- Hover states with scale (1.05)
- Loading spinner state
- Disabled state with reduced opacity

**Styling Approach:**
```css
.action-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #6B7280;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.action-button:hover {
  transform: scale(1.05);
  border-color: #D1D5DB;
  color: #000000;
}

.action-button.danger:hover {
  border-color: #FCA5A5;
  color: #DC2626;
  background: #FEF2F2;
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
```

### 4. CategoryCard Component

**Purpose:** Display categories with aesthetic backgrounds

**Interface:**
```typescript
interface CategoryCardProps {
  title: string
  description?: string
  image?: string
  gradient?: string
  onClick: () => void
}
```

**Key Features:**
- Aspect ratio: 16:9 or 4:3
- Background: image or gradient
- Text overlay with semi-transparent background
- Hover: scale (1.02) + shadow increase
- Border radius: 12px

**Styling Approach:**
```css
.category-card {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 200ms ease-out;
}

.category-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-card-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.category-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
}

.category-card-content {
  position: relative;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #FFFFFF;
}
```

## Data Models

### Navigation State
```typescript
interface NavigationState {
  sidebarCollapsed: boolean
  activeRoute: string
  navigationItems: NavigationItem[]
}
```

### Table State
```typescript
interface TableState<T> {
  data: T[]
  loading: boolean
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
  selectedRows: Set<string>
}
```

## Design Tokens

Create a centralized design tokens file:

```typescript
// src/config/designTokens.ts
export const designTokens = {
  colors: {
    // Neutrals
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    // Semantic
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '15px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    easing: 'ease-out',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}
```

## Error Handling

### Component-Level Error Handling
- Display inline error messages for failed actions
- Use toast notifications for global errors
- Provide retry mechanisms for failed operations
- Graceful degradation for missing data

### Loading States
- Skeleton screens for initial loads
- Inline spinners for action buttons
- Progress indicators for long operations
- Optimistic updates where appropriate

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock external dependencies
- Test all interaction states (hover, active, disabled)
- Test responsive behavior

### Integration Tests
- Test navigation flow
- Test table interactions (sort, filter, actions)
- Test keyboard navigation
- Test screen reader compatibility

### Visual Regression Tests
- Capture screenshots of key states
- Compare against baseline
- Test across different viewports
- Test dark mode variations

### Accessibility Tests
- WCAG AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management

## Performance Considerations

### Optimization Strategies
1. **Virtual Scrolling:** For tables with >100 rows
2. **Lazy Loading:** Load images and heavy components on demand
3. **Memoization:** Cache computed values and rendered components
4. **CSS Transforms:** Use GPU-accelerated properties for animations
5. **Code Splitting:** Lazy load sidebar and table components

### Performance Metrics
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1
- Animation frame rate: 60fps

## Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  mobile: '0px',      // 0-767px
  tablet: '768px',    // 768-1023px
  desktop: '1024px',  // 1024px+
}
```

### Mobile Adaptations
- Sidebar: Converts to slide-out drawer
- Table: Converts to card layout
- Action buttons: Larger touch targets (44x44px)
- Typography: Slightly smaller on mobile

## Accessibility

### ARIA Labels
- All interactive elements have descriptive labels
- Navigation landmarks properly defined
- Table headers associated with cells
- Action buttons have tooltips

### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space activates buttons
- Arrow keys navigate table rows
- Escape closes modals/drawers

### Screen Reader Support
- Semantic HTML elements
- Live regions for dynamic content
- Status announcements for actions
- Descriptive alt text for images

## Migration Strategy

### Phase 1: Foundation
1. Create design tokens file
2. Build base components (Sidebar, DataTable, ActionButton)
3. Update existing pages to use new components

### Phase 2: Enhancement
1. Add category cards to HomePage
2. Implement advanced table features (sort, filter)
3. Add keyboard shortcuts

### Phase 3: Polish
1. Performance optimization
2. Accessibility audit and fixes
3. Cross-browser testing
4. Documentation

## Dependencies

### New Dependencies
- None required (using existing Vue 3, TailwindCSS, GSAP)

### Existing Dependencies to Leverage
- Vue 3 Composition API
- Vue Router 4
- TailwindCSS (extend with custom tokens)
- GSAP (for complex animations)
- Existing animation system

## Design Decisions and Rationale

### Why Table Over Grid for Wordlists?
- Better scannability for text-heavy content
- Easier to implement sorting and filtering
- More familiar pattern for data management
- Better accessibility with semantic HTML

### Why Icon-Only Action Buttons?
- Cleaner visual design
- More space-efficient
- Tooltips provide context
- Matches ElevenLabs pattern

### Why Fixed Sidebar?
- Persistent navigation improves UX
- Reduces cognitive load
- Matches modern SaaS patterns
- Easy to collapse on smaller screens

### Why Design Tokens?
- Centralized source of truth
- Easier to maintain consistency
- Facilitates theming
- Improves developer experience