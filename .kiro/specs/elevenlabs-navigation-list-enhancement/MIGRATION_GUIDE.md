# Migration Guide

## Overview

This guide helps you migrate existing VocabGo pages to use the new ElevenLabs-inspired navigation and list components.

## Prerequisites

- Vue 3.3+
- TypeScript 5.0+
- TailwindCSS 3.0+
- Existing VocabGo project structure

## Migration Steps

### Step 1: Install Design Tokens

The design tokens are already included in `src/config/designTokens.ts`. No installation needed.

### Step 2: Update App Layout

Replace your existing layout with the new Sidebar navigation.

**Before (`App.vue`):**

```vue
<template>
  <div class="app">
    <Header />
    <main>
      <router-view />
    </main>
  </div>
</template>
```

**After (`App.vue`):**

```vue
<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import { useNavigation } from '@/composables/useNavigation'

const { collapsed, navigationItems, toggleSidebar } = useNavigation()
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Navigation -->
    <Sidebar
      :collapsed="collapsed"
      :items="navigationItems"
      @toggle="toggleSidebar"
    />
    
    <!-- Main Content Area -->
    <main class="flex-1 overflow-auto bg-gray-50">
      <router-view />
    </main>
  </div>
</template>
```

### Step 3: Migrate SavedWordlistsPage

Replace the grid layout with DataTable component.

**Before:**

```vue
<template>
  <div class="wordlists-page">
    <h1>Saved Wordlists</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="wordlist in wordlists"
        :key="wordlist.id"
        class="wordlist-card"
      >
        <h3>{{ wordlist.filename }}</h3>
        <p>{{ wordlist.created_at }}</p>
        <p>{{ wordlist.word_count }} words</p>
        
        <div class="actions">
          <button @click="download(wordlist)">Download</button>
          <button @click="deleteWordlist(wordlist)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

**After:**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'
import type { TableColumn, TableAction } from '@/components/ui/DataTable.vue'

const wordlists = ref([])
const loading = ref(false)

const columns: TableColumn[] = [
  { key: 'filename', label: 'Filename', width: '40%' },
  { key: 'created_at', label: 'Date Created', width: '25%' },
  { key: 'word_count', label: 'Words', width: '15%', align: 'right' }
]

const actions: TableAction[] = [
  {
    icon: 'download',
    label: 'Download wordlist',
    onClick: (row) => downloadWordlist(row)
  },
  {
    icon: 'trash',
    label: 'Delete wordlist',
    variant: 'danger',
    onClick: (row) => deleteWordlist(row)
  }
]

onMounted(async () => {
  loading.value = true
  wordlists.value = await fetchWordlists()
  loading.value = false
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Saved Wordlists</h1>
    
    <DataTable
      :columns="columns"
      :data="wordlists"
      :loading="loading"
      :actions="actions"
    />
  </div>
</template>
```

### Step 4: Update HomePage with CategoryCards

Add visual category cards to the homepage.

**Before:**

```vue
<template>
  <div class="home-page">
    <h1>Welcome to VocabGo</h1>
    
    <div class="links">
      <router-link to="/upload">Upload Document</router-link>
      <router-link to="/wordlists">Saved Wordlists</router-link>
    </div>
  </div>
</template>
```

**After:**

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import CategoryCard from '@/components/ui/CategoryCard.vue'

const router = useRouter()
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-8">Welcome to VocabGo</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <CategoryCard
        title="Upload Document"
        description="Extract vocabulary from PDFs, DOCX, TXT, and XLSX files"
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        @click="router.push('/upload')"
      />
      
      <CategoryCard
        title="Saved Wordlists"
        description="View and manage your vocabulary collections"
        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        @click="router.push('/wordlists')"
      />
    </div>
  </div>
</template>
```

### Step 5: Replace Custom Buttons with ActionButton

Update any custom action buttons to use the new ActionButton component.

**Before:**

```vue
<button
  class="action-btn"
  @click="handleDownload"
  :disabled="isDownloading"
>
  <DownloadIcon />
</button>
```

**After:**

```vue
<ActionButton
  icon="download"
  label="Download wordlist"
  :loading="isDownloading"
  :disabled="isDownloading"
  @click="handleDownload"
/>
```

## Breaking Changes

### Component Props

Some prop names have changed for consistency:

| Old Prop | New Prop | Component |
|----------|----------|-----------|
| `isLoading` | `loading` | ActionButton |
| `isDisabled` | `disabled` | ActionButton |
| `onClick` | `@click` | All components |

### CSS Classes

Custom CSS classes are no longer needed. Use design tokens instead:

**Before:**

```css
.custom-button {
  padding: 12px 16px;
  border-radius: 6px;
  background: #667eea;
}
```

**After:**

```vue
<script setup lang="ts">
import { designTokens } from '@/config/designTokens'
</script>

<style scoped>
.custom-button {
  padding: v-bind('designTokens.spacing.md') v-bind('designTokens.spacing.lg');
  border-radius: v-bind('designTokens.borderRadius.md');
  background: v-bind('designTokens.colors.primary');
}
</style>
```

### Event Handlers

Event handler signatures remain the same, but some components now emit different events:

**DataTable:**
- `@row-click` replaces custom click handlers
- Action buttons use individual `onClick` callbacks

## Compatibility

### Supported Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

### Vue Version

- Minimum: Vue 3.3.0
- Recommended: Vue 3.4.0+

### TypeScript

- Minimum: TypeScript 5.0
- Recommended: TypeScript 5.3+

## Troubleshooting

### Issue: Sidebar not showing on mobile

**Solution:** Ensure you have the mobile toggle button in your header:

```vue
<button
  class="lg:hidden"
  @click="toggleSidebar"
  aria-label="Toggle menu"
>
  <MenuIcon />
</button>
```

### Issue: DataTable actions not visible

**Solution:** Check that actions array is properly formatted:

```typescript
const actions = [
  {
    icon: 'edit',        // Required
    label: 'Edit',       // Required
    onClick: handleEdit  // Required
  }
]
```

### Issue: Design tokens not working

**Solution:** Import design tokens at the top of your component:

```typescript
import { designTokens } from '@/config/designTokens'
```

### Issue: TypeScript errors with table columns

**Solution:** Import and use the proper types:

```typescript
import type { TableColumn, TableAction } from '@/components/ui/DataTable.vue'

const columns: TableColumn[] = [...]
const actions: TableAction[] = [...]
```

## Testing Your Migration

### Checklist

- [ ] Sidebar navigation works on desktop
- [ ] Sidebar converts to drawer on mobile (<768px)
- [ ] DataTable displays correctly
- [ ] Action buttons work and show tooltips
- [ ] CategoryCards are clickable
- [ ] All pages are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Screen reader announces navigation changes
- [ ] Animations respect `prefers-reduced-motion`

### Test Commands

```bash
# Run unit tests
pnpm test

# Run accessibility tests
pnpm test tests/accessibility/

# Run responsive tests
pnpm test tests/responsive/

# Run cross-browser tests
pnpm test tests/cross-browser/
```

### Manual Testing

1. **Desktop Navigation**
   - Click each sidebar item
   - Verify active state highlights
   - Test collapse/expand functionality

2. **Mobile Navigation**
   - Resize browser to <768px
   - Open/close drawer
   - Test swipe gestures (on device)

3. **Table Interactions**
   - Hover over rows
   - Click action buttons
   - Test on mobile (card layout)

4. **Keyboard Navigation**
   - Tab through all interactive elements
   - Activate with Enter/Space
   - Close drawer with Escape

5. **Screen Reader**
   - Test with VoiceOver (Mac) or NVDA (Windows)
   - Verify all labels are announced
   - Check navigation landmarks

## Rollback Plan

If you need to rollback the migration:

1. **Restore Previous Layout**
   ```bash
   git checkout HEAD~1 src/App.vue
   ```

2. **Remove New Components**
   ```bash
   git checkout HEAD~1 src/components/layout/Sidebar.vue
   git checkout HEAD~1 src/components/ui/DataTable.vue
   git checkout HEAD~1 src/components/ui/ActionButton.vue
   ```

3. **Restore Previous Pages**
   ```bash
   git checkout HEAD~1 src/pages/SavedWordlistsPage.vue
   git checkout HEAD~1 src/pages/HomePage.vue
   ```

## Getting Help

### Resources

- [Full Documentation](./README.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Accessibility Guide](./ACCESSIBILITY_AUDIT.md)
- [Component Examples](../../components/ui/)

### Common Questions

**Q: Can I use the old grid layout alongside DataTable?**
A: Yes, but for consistency we recommend migrating all list views to DataTable.

**Q: Do I need to update my Tailwind config?**
A: No, the components work with your existing Tailwind setup.

**Q: Can I customize the design tokens?**
A: Yes, edit `src/config/designTokens.ts` to match your brand.

**Q: Is dark mode supported?**
A: The foundation is in place. Dark mode implementation is planned for v2.0.

## Next Steps

After completing the migration:

1. Review the [Accessibility Guide](./ACCESSIBILITY_AUDIT.md)
2. Run the full test suite
3. Test on real devices (iOS, Android)
4. Gather user feedback
5. Consider implementing advanced features (sorting, filtering, etc.)

## Version History

- **v1.0.0** (2025-01-16): Initial release
  - Sidebar navigation
  - DataTable component
  - ActionButton component
  - CategoryCard component
  - Design tokens system
