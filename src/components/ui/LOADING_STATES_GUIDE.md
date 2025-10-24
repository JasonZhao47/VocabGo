# Loading & Empty States Guide

Comprehensive guide for using loading, empty, and error state components in VocabGo with ElevenLabs styling.

## Components Overview

### 1. LoadingSpinner
A simple, animated loading spinner with customizable sizes and labels.

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `label`: Optional text label below spinner
- `ariaLabel`: Accessibility label (default: `'Loading...'`)

**Usage:**
```vue
<LoadingSpinner size="md" label="Loading data..." />
```

**Features:**
- Three size variants (24px, 40px, 64px)
- Smooth rotation animation
- Respects `prefers-reduced-motion`
- Proper ARIA attributes for accessibility

---

### 2. EmptyState
A flexible empty state component with icon, title, description, and optional action button.

**Props:**
- `variant`: `'no-data' | 'search' | 'empty' | 'custom'` (default: `'no-data'`)
- `title`: Main heading text
- `description`: Supporting description text
- `actionLabel`: Text for action button (optional)
- `ariaLabel`: Accessibility label

**Events:**
- `@action`: Emitted when action button is clicked

**Slots:**
- `icon`: Custom icon content
- `title`: Custom title content
- `description`: Custom description content
- `action`: Custom action button

**Usage:**
```vue
<!-- Basic usage -->
<EmptyState
  variant="no-data"
  title="No wordlists found"
  description="Upload a document to create your first wordlist"
  action-label="Upload Document"
  @action="handleUpload"
/>

<!-- With custom icon -->
<EmptyState title="No results">
  <template #icon>
    <svg><!-- Custom SVG --></svg>
  </template>
</EmptyState>
```

**Features:**
- Four built-in icon variants
- Smooth fade-in animations
- Fully customizable via slots
- Mobile-responsive design
- Respects `prefers-reduced-motion`

---

### 3. ErrorState
An error display component with icon, title, message, and recovery actions.

**Props:**
- `title`: Error title (default: `'Something went wrong'`)
- `message`: Error message text
- `showRetry`: Show retry button (default: `true`)
- `showCancel`: Show cancel button (default: `false`)
- `retryLabel`: Retry button text (default: `'Try Again'`)
- `cancelLabel`: Cancel button text (default: `'Cancel'`)
- `ariaLabel`: Accessibility label

**Events:**
- `@retry`: Emitted when retry button is clicked
- `@cancel`: Emitted when cancel button is clicked

**Slots:**
- `icon`: Custom error icon
- `title`: Custom title content
- `message`: Custom message content
- `actions`: Custom action buttons

**Usage:**
```vue
<!-- Basic error -->
<ErrorState
  title="Failed to load data"
  message="Unable to fetch wordlists. Please try again."
  @retry="handleRetry"
/>

<!-- Error with cancel -->
<ErrorState
  title="Upload failed"
  message="The file could not be processed."
  :show-retry="true"
  :show-cancel="true"
  @retry="handleRetry"
  @cancel="handleCancel"
/>
```

**Features:**
- Shake animation on icon
- Red color scheme for errors
- Flexible action buttons
- Mobile-responsive stacked layout
- Respects `prefers-reduced-motion`

---

### 4. ContentLoader
A wrapper component that handles loading, error, empty, and content states with smooth transitions.

**Props:**
- `loading`: Show loading state (default: `false`)
- `error`: Error message string or null
- `empty`: Show empty state (default: `false`)
- `loadingLabel`: Label for loading spinner
- `spinnerSize`: Size of loading spinner
- `errorTitle`: Title for error state
- `showRetry`: Show retry button in error state
- `showCancel`: Show cancel button in error state
- `emptyVariant`: Variant for empty state
- `emptyTitle`: Title for empty state
- `emptyDescription`: Description for empty state
- `emptyActionLabel`: Action button label for empty state

**Events:**
- `@retry`: Emitted when error retry is clicked
- `@cancel`: Emitted when error cancel is clicked
- `@emptyAction`: Emitted when empty action is clicked

**Slots:**
- `loading`: Custom loading content
- `error`: Custom error content (receives `error` and `retry` props)
- `empty`: Custom empty content
- `default`: Main content (shown when not loading/error/empty)

**Usage:**
```vue
<ContentLoader
  :loading="isLoading"
  :error="errorMessage"
  :empty="!hasData"
  loading-label="Loading wordlists..."
  error-title="Failed to load"
  empty-title="No wordlists"
  empty-description="Upload a document to get started"
  empty-action-label="Upload"
  @retry="loadData"
  @empty-action="goToUpload"
>
  <!-- Your content here -->
  <div v-for="item in data" :key="item.id">
    {{ item.name }}
  </div>
</ContentLoader>
```

**Features:**
- Automatic state management
- Smooth fade transitions between states
- Content fade-in animation
- Fully customizable via slots
- Respects `prefers-reduced-motion`

---

## Design Principles

### ElevenLabs Styling
All components follow ElevenLabs design tokens:

- **Typography**: Inter font family, precise sizing
- **Colors**: Black/white with gray scale
- **Spacing**: 8px base unit system
- **Animations**: 150-300ms durations with ease-in-out
- **Border Radius**: 8px, 12px, or full rounded

### Accessibility
All components include:

- Proper ARIA attributes (`role`, `aria-label`)
- Screen reader text where appropriate
- Keyboard navigation support
- Focus indicators
- Reduced motion support

### Animations
Smooth, purposeful animations:

- **Fade-in**: Content appearance (300ms)
- **Fade-up**: Staggered element entrance (500ms)
- **Spin**: Loading spinner rotation (800ms)
- **Shake**: Error icon emphasis (500ms)

All animations respect `prefers-reduced-motion` media query.

---

## Common Patterns

### 1. Data Fetching with ContentLoader
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { ContentLoader } from '@/components/ui'

const loading = ref(true)
const error = ref(null)
const data = ref([])

async function loadData() {
  loading.value = true
  error.value = null
  
  try {
    data.value = await fetchData()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <ContentLoader
    :loading="loading"
    :error="error"
    :empty="data.length === 0"
    @retry="loadData"
  >
    <div v-for="item in data" :key="item.id">
      {{ item.name }}
    </div>
  </ContentLoader>
</template>
```

### 2. Search Results with Empty State
```vue
<template>
  <div>
    <input v-model="searchQuery" placeholder="Search..." />
    
    <EmptyState
      v-if="filteredResults.length === 0"
      variant="search"
      title="No results found"
      description="Try adjusting your search query"
    />
    
    <div v-else>
      <!-- Results -->
    </div>
  </div>
</template>
```

### 3. Form Submission with Error Handling
```vue
<script setup>
const submitting = ref(false)
const error = ref(null)

async function handleSubmit() {
  submitting.value = true
  error.value = null
  
  try {
    await submitForm()
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Form fields -->
    
    <ErrorState
      v-if="error"
      :message="error"
      @retry="handleSubmit"
    />
    
    <button :disabled="submitting">
      <LoadingSpinner v-if="submitting" size="sm" />
      <span v-else>Submit</span>
    </button>
  </form>
</template>
```

---

## Testing

All components include comprehensive unit tests:

```bash
# Run all loading state tests
pnpm vitest run src/components/ui/LoadingSpinner.test.ts
pnpm vitest run src/components/ui/EmptyState.test.ts
pnpm vitest run src/components/ui/ErrorState.test.ts
pnpm vitest run src/components/ui/ContentLoader.test.ts
```

---

## Demo

View all components in action:
```
/loading-states-demo
```

The demo page showcases:
- All spinner sizes
- Empty state variants
- Error state configurations
- ContentLoader state transitions
- Skeleton screens
- Interactive state controls

---

## Requirements Coverage

This implementation satisfies the following requirements:

- **11.1**: Skeleton screens for loading states
- **11.2**: Empty state messages and illustrations
- **11.3**: Error state styling with recovery options
- **6.4**: Smooth fade-in animations for content appearance

All components use ElevenLabs design tokens and follow accessibility best practices.
