# Design Document

## Overview

This design document outlines the technical approach for implementing a sidebar toggle enhancement that matches the ElevenLabs UI pattern. The enhancement adds a toggle button for collapsing/expanding the sidebar while maintaining the existing responsive behavior and improving the visual design to match modern SaaS dashboard standards.

## Reference Screenshots

The design is based on the ElevenLabs sidebar behavior captured in the following screenshots:

- **Expanded State**: `screenshots/elevenlabs-sidebar-open.png` - Shows the full sidebar with navigation labels visible
- **Collapsed State**: `screenshots/elevenlabs-sidebar-collapsed.png` - Shows the collapsed sidebar with only icons visible

Key observations from the reference:
- Clean white sidebar background (#FFFFFF)
- Subtle right border (#E5E7EB) - only on the sidebar's right edge
- **No internal borders** - navigation items have no dividers or separators
- Fixed positioning that doesn't scroll with content
- Smooth toggle animation
- Icons remain visible in collapsed state
- Toggle button positioned in top-left area
- **Top navbar**: White background (#FFFFFF) with bottom border (#E5E7EB)
- **Navbar layout**: Toggle button, page title, and action buttons (Feedback, Documentation, etc.)
- **Fixed navbar**: Stays at top during content scrolling

## Architecture

### Component Structure

```
src/
├── components/
│   └── layout/
│       ├── Sidebar.vue (enhanced)
│       ├── SidebarToggle.vue (new)
│       └── Header.vue (enhanced)
├── composables/
│   ├── useNavigation.ts (enhanced)
│   └── useSidebarToggle.ts (new)
└── App.vue (enhanced)
```

### State Management

The sidebar toggle state will be managed through:

1. **Global State**: `useNavigation` composable enhanced with toggle functionality
2. **Local Storage**: Persist user preference across sessions
3. **Reactive Updates**: Synchronize state across components

## Components and Interfaces

### 1. Enhanced Sidebar Component

**File**: `src/components/layout/Sidebar.vue`

**Key Changes**:
- Add toggle button integration
- Update styling to match ElevenLabs design
- Enhance fixed positioning behavior
- Improve animation transitions

**Props Interface**:
```typescript
interface SidebarProps {
  collapsed?: boolean
  items: NavigationItem[]
  modelValue?: boolean // Mobile drawer state
}
```

**New CSS Classes**:
```css
.sidebar--collapsed-desktop {
  width: 72px;
}

.sidebar--fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  z-index: 100;
}

/* Remove existing internal borders */
.sidebar__item--group::before {
  display: none; /* Remove separator lines between sections */
}

.sidebar__link {
  border: none; /* Ensure no borders on navigation links */
}
```

### 2. New SidebarToggle Component

**File**: `src/components/layout/SidebarToggle.vue`

**Purpose**: Dedicated toggle button component with proper accessibility

**Interface**:
```typescript
interface SidebarToggleProps {
  collapsed: boolean
  position?: 'sidebar' | 'header' // Where the button is placed
}

interface SidebarToggleEmits {
  toggle: []
}
```

**Features**:
- Keyboard accessible (Enter/Space)
- Screen reader announcements
- Icon animation on state change
- Tooltip support for collapsed state

### 3. Enhanced Header Component

**File**: `src/components/layout/Header.vue`

**Changes**:
- Add top navbar styling to match ElevenLabs
- Include toggle button when sidebar is collapsed
- Fixed positioning coordination
- White background with bottom border
- Proper z-index layering above content but below modals

**New Header Structure**:
```vue
<header class="navbar">
  <div class="navbar__left">
    <SidebarToggle v-if="showToggleInHeader" />
    <h1 class="navbar__title">{{ pageTitle }}</h1>
  </div>
  <div class="navbar__right">
    <!-- Action buttons like Feedback, Documentation -->
    <slot name="actions" />
  </div>
</header>
```

**Header CSS**:
```css
.navbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  transition: left var(--animation-duration) ease-out;
}

.navbar--sidebar-collapsed {
  left: 72px;
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar__title {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

### 4. New useSidebarToggle Composable

**File**: `src/composables/useSidebarToggle.ts`

**Purpose**: Manage sidebar toggle state and persistence

```typescript
interface SidebarToggleState {
  collapsed: Ref<boolean>
  toggle: () => void
  setCollapsed: (value: boolean) => void
  isDesktop: Ref<boolean>
}

export function useSidebarToggle(): SidebarToggleState
```

**Features**:
- localStorage persistence
- Responsive behavior detection
- State synchronization
- Accessibility announcements

## Data Models

### Enhanced NavigationItem

```typescript
interface NavigationItem {
  id: string
  label: string
  icon: string // SVG string
  route: string
  badge?: string | number
  children?: NavigationItem[]
  tooltip?: string // For collapsed state
}
```

### SidebarState

```typescript
interface SidebarState {
  collapsed: boolean
  isDesktop: boolean
  isMobile: boolean
  drawerOpen: boolean // Mobile only
}
```

## Visual Design Specifications

### Color Palette

Based on ElevenLabs reference:

```css
:root {
  --sidebar-bg: #FFFFFF;
  --sidebar-border-right: #E5E7EB; /* Only right border */
  --sidebar-border-internal: none; /* No internal borders */
  --content-bg: #FAFAFA;
  --navbar-bg: #FFFFFF;
  --navbar-border: #E5E7EB;
  --toggle-hover: #F5F5F5;
  --text-primary: #000000;
  --text-secondary: #6B7280;
}
```

### Dimensions

```css
:root {
  --sidebar-width-expanded: 260px;
  --sidebar-width-collapsed: 72px;
  --navbar-height: 64px;
  --toggle-size: 40px;
  --animation-duration: 200ms;
  --content-top-offset: 64px; /* Account for fixed navbar */
}
```

### Typography

- Font Family: System UI stack (Inter, -apple-system, etc.)
- Navigation Labels: 15px, medium weight
- Toggle Button: 14px, medium weight

## Animation System

### Transition Specifications

```css
.sidebar-transition {
  transition: width var(--animation-duration) ease-out;
}

.content-transition {
  transition: margin-left var(--animation-duration) ease-out;
}

.label-fade {
  transition: opacity 150ms ease-out;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .sidebar-transition,
  .content-transition,
  .label-fade {
    transition: none;
  }
}
```

## Responsive Behavior

### Desktop (≥768px)
- Fixed sidebar with toggle functionality
- Fixed top navbar with proper left margin adjustment
- Persistent state in localStorage
- Smooth width transitions
- Content area margin adjustment for both sidebar and navbar
- Main content positioned below navbar (top: 64px)

### Mobile (<768px)
- Drawer behavior (slide in/out)
- Full-width navbar (left: 0)
- Overlay backdrop
- No state persistence
- Touch gesture support
- Navbar toggle button always visible

### Breakpoint Handling

```typescript
const MOBILE_BREAKPOINT = 768;

const checkViewport = () => {
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  const isDesktop = !isMobile;
  
  return { isMobile, isDesktop };
};
```

## Accessibility Implementation

### ARIA Attributes

```html
<!-- Toggle Button -->
<button
  :aria-expanded="!collapsed"
  :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
  aria-controls="main-sidebar"
>

<!-- Sidebar -->
<aside
  id="main-sidebar"
  :aria-label="collapsed ? 'Collapsed navigation' : 'Main navigation'"
  role="navigation"
>
```

### Keyboard Navigation

- **Tab**: Navigate through sidebar items
- **Enter/Space**: Activate toggle button
- **Escape**: Close mobile drawer

### Screen Reader Support

```typescript
const announceToggle = (collapsed: boolean) => {
  const message = collapsed 
    ? 'Sidebar collapsed' 
    : 'Sidebar expanded';
  
  // Use aria-live region for announcements
  announcer.announce(message);
};
```

## Error Handling

### localStorage Failures

```typescript
const saveToggleState = (collapsed: boolean) => {
  try {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  } catch (error) {
    console.warn('Failed to save sidebar state:', error);
    // Graceful degradation - continue without persistence
  }
};
```

### Animation Failures

- Fallback to instant state changes
- CSS feature detection
- Progressive enhancement approach

## Testing Strategy

### Unit Tests

1. **useSidebarToggle Composable**
   - State management
   - localStorage integration
   - Responsive behavior

2. **SidebarToggle Component**
   - Click handling
   - Keyboard events
   - Accessibility attributes

3. **Enhanced Sidebar Component**
   - Prop handling
   - State synchronization
   - Animation classes

### Integration Tests

1. **Cross-component Communication**
   - Toggle button → Sidebar state
   - Sidebar state → Content layout
   - Responsive breakpoint changes

2. **Accessibility Testing**
   - Screen reader compatibility
   - Keyboard navigation flow
   - ARIA attribute correctness

### Visual Regression Tests

1. **State Comparisons**
   - Expanded vs collapsed layouts
   - Mobile vs desktop rendering
   - Animation frame captures

## Performance Considerations

### Animation Optimization

```css
.sidebar {
  will-change: width;
  transform: translateZ(0); /* Force GPU acceleration */
}

.sidebar-content {
  will-change: margin-left;
}
```

### Bundle Size Impact

- New components: ~2KB gzipped
- Enhanced composables: ~1KB gzipped
- CSS additions: ~1KB gzipped
- Total impact: ~4KB gzipped

### Runtime Performance

- Use `requestAnimationFrame` for smooth animations
- Debounce resize event handlers
- Lazy load non-critical sidebar features

## Implementation Phases

### Phase 1: Core Toggle Functionality
1. Create `useSidebarToggle` composable
2. Add toggle button component
3. Enhance existing sidebar component
4. Implement basic state management

### Phase 2: Visual Design Enhancement
1. Apply ElevenLabs color scheme
2. Implement smooth animations
3. Add fixed positioning
4. Update content area layout

### Phase 3: Accessibility & Polish
1. Add ARIA attributes and announcements
2. Implement keyboard navigation
3. Add reduced motion support
4. Comprehensive testing

### Phase 4: Mobile Optimization
1. Ensure drawer behavior is preserved
2. Add touch gesture support
3. Optimize for various screen sizes
4. Cross-browser testing

## Migration Strategy

### Backward Compatibility

- Existing `collapsed` prop remains functional
- Mobile drawer behavior unchanged
- No breaking changes to navigation items

### Gradual Rollout

1. Feature flag for toggle functionality
2. A/B testing with subset of users
3. Monitoring for performance impact
4. Full rollout after validation

This design provides a comprehensive foundation for implementing the sidebar toggle enhancement while maintaining code quality, accessibility, and performance standards.