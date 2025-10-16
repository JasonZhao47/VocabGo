# Layout Components

## Sidebar Component

A responsive, accessible sidebar navigation component with support for collapsible sections, mobile drawer mode, and swipe gestures.

### Features

- ✅ Fixed width sidebar (260px expanded, 72px collapsed)
- ✅ Icon + text layout with hover and active states
- ✅ Collapsible sections with smooth animations
- ✅ Responsive mobile drawer with overlay
- ✅ Swipe gesture support on mobile
- ✅ WCAG AA compliant accessibility
- ✅ Keyboard navigation support
- ✅ Visual separators between sections
- ✅ Badge support for notification counts

### Basic Usage

```vue
<template>
  <div class="app-layout">
    <Sidebar :items="navigationItems" />
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar, { type NavigationItem } from '@/components/layout/Sidebar.vue'

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '<svg>...</svg>', // SVG string
    route: '/',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: '<svg>...</svg>',
    route: '/upload',
  },
  {
    id: 'wordlists',
    label: 'Saved Wordlists',
    icon: '<svg>...</svg>',
    route: '/wordlists',
    badge: '3', // Optional badge
  },
]
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px; /* Match sidebar width */
  padding: 24px;
}

@media (max-width: 767px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
```

### Collapsed Sidebar

```vue
<template>
  <Sidebar :items="navigationItems" :collapsed="true" />
</template>
```

When collapsed, the sidebar width becomes 72px and labels are hidden.

### Collapsible Sections

```vue
<script setup lang="ts">
const navigationItems: NavigationItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: '<svg>...</svg>',
    route: '/settings',
    children: [
      {
        id: 'profile',
        label: 'Profile',
        icon: '<svg>...</svg>',
        route: '/settings/profile',
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: '<svg>...</svg>',
        route: '/settings/preferences',
      },
    ],
  },
]
</script>
```

Items with `children` will render as collapsible groups with a chevron indicator.

### Mobile Drawer Mode

On mobile (<768px), the sidebar automatically converts to a slide-out drawer:

```vue
<template>
  <div>
    <!-- Toggle button for mobile -->
    <SidebarToggle :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar with v-model for mobile state -->
    <Sidebar :items="navigationItems" v-model="sidebarOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import SidebarToggle from '@/components/layout/SidebarToggle.vue'

const sidebarOpen = ref(false)
</script>
```

### Swipe Gestures

The sidebar supports swipe gestures on mobile:
- **Swipe left** on the sidebar to close it
- **Swipe right** from the edge to open it

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavigationItem[]` | **required** | Array of navigation items |
| `collapsed` | `boolean` | `false` | Whether sidebar is collapsed (desktop) |
| `modelValue` | `boolean` | `false` | Whether sidebar is open (mobile) |

### NavigationItem Interface

```typescript
interface NavigationItem {
  id: string              // Unique identifier
  label: string           // Display text
  icon: string            // SVG string
  route: string           // Vue Router path
  badge?: string | number // Optional badge (e.g., notification count)
  children?: NavigationItem[] // Optional nested items
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when mobile drawer state changes |

### Exposed Methods

```typescript
interface SidebarExposed {
  closeSidebar: () => void  // Close mobile drawer
  openSidebar: () => void   // Open mobile drawer
  isOpen: Ref<boolean>      // Current mobile drawer state
  isMobile: Ref<boolean>    // Whether in mobile mode
}
```

### Accessibility

- **ARIA labels**: All interactive elements have descriptive labels
- **Keyboard navigation**: Full keyboard support with Tab, Enter, Space, Escape
- **Focus indicators**: WCAG AA compliant focus states
- **Screen readers**: Semantic HTML with proper ARIA attributes
- **Touch targets**: Minimum 44x44px on mobile

### Styling

The component uses design tokens from `@/config/designTokens.ts` for consistent styling:

- Colors: Neutral grays with accent colors
- Spacing: 8px base unit
- Typography: 15px base font size
- Transitions: 150-200ms for smooth interactions
- Border radius: 6px for elements

### Responsive Breakpoints

- **Mobile**: 0-767px (drawer mode)
- **Tablet/Desktop**: 768px+ (fixed sidebar)

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## SidebarToggle Component

A hamburger menu button for toggling the mobile sidebar.

### Usage

```vue
<template>
  <SidebarToggle :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarToggle from '@/components/layout/SidebarToggle.vue'

const sidebarOpen = ref(false)
</script>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Whether sidebar is open (animates to X) |

### Events

| Event | Description |
|-------|-------------|
| `toggle` | Emitted when button is clicked |

### Features

- Animated hamburger to X transition
- Only visible on mobile (<768px)
- 44x44px touch target
- WCAG AA compliant focus states

## Demo

See `SidebarDemo.vue` for a complete interactive demo of the Sidebar component.

To view the demo, add it to your router:

```typescript
{
  path: '/demo/sidebar',
  component: () => import('@/components/layout/SidebarDemo.vue'),
}
```
