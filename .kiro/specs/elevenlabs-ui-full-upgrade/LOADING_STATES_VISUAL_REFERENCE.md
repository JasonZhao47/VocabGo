# Loading States Visual Reference

Quick visual reference for all loading and empty state components.

## Component Hierarchy

```
ContentLoader (Wrapper)
├── LoadingSpinner (Loading State)
├── ErrorState (Error State)
├── EmptyState (Empty State)
└── Content (Success State)
```

## LoadingSpinner

### Small (24px)
```
  ⟳
Loading...
```

### Medium (40px) - Default
```
   ⟳
Loading data...
```

### Large (64px)
```
    ⟳
Processing...
```

**Colors:**
- Ring: `rgb(242, 242, 242)` (light gray)
- Active segment: `rgb(0, 0, 0)` (black)
- Label: `rgb(115, 115, 115)` (gray)

**Animation:** 800ms rotation, ease-in-out

---

## EmptyState

### No Data Variant
```
┌─────────────────────────────────────┐
│                                     │
│              📄                     │
│         (80x80 icon)                │
│                                     │
│      No wordlists found             │
│                                     │
│  Upload a document to create your   │
│        first wordlist               │
│                                     │
│      [Upload Document]              │
│                                     │
└─────────────────────────────────────┘
```

### Search Variant
```
┌─────────────────────────────────────┐
│                                     │
│              🔍                     │
│         (80x80 icon)                │
│                                     │
│       No results found              │
│                                     │
│   Try adjusting your search query   │
│                                     │
└─────────────────────────────────────┘
```

**Colors:**
- Background: `rgb(250, 250, 250)` (light gray)
- Icon: `rgb(229, 229, 229)` (gray)
- Title: `rgb(0, 0, 0)` (black, 700 weight)
- Description: `rgb(115, 115, 115)` (gray)
- Button: Black with white text

**Animations:**
- Icon: Fade-up 500ms @ 100ms delay
- Title: Fade-up 500ms @ 200ms delay
- Description: Fade-up 500ms @ 300ms delay
- Button: Fade-up 500ms @ 400ms delay

---

## ErrorState

### Basic Error
```
┌─────────────────────────────────────┐
│                                     │
│              ⚠️                     │
│         (64x64 icon)                │
│                                     │
│      Something went wrong           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ An error occurred. Please try │  │
│  │ again.                        │  │
│  └───────────────────────────────┘  │
│                                     │
│         [Try Again]                 │
│                                     │
└─────────────────────────────────────┘
```

### Error with Cancel
```
┌─────────────────────────────────────┐
│                                     │
│              ⚠️                     │
│                                     │
│         Upload failed               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ The file could not be         │  │
│  │ processed.                    │  │
│  └───────────────────────────────┘  │
│                                     │
│    [Try Again]    [Cancel]          │
│                                     │
└─────────────────────────────────────┘
```

**Colors:**
- Background: `rgb(250, 250, 250)` (light gray)
- Icon: `rgb(220, 38, 38)` (red)
- Title: `rgb(220, 38, 38)` (red, 700 weight)
- Message box: `rgb(254, 242, 242)` background, `rgb(254, 226, 226)` border
- Message text: `rgb(115, 115, 115)` (gray)
- Primary button: Red background, white text
- Secondary button: White background, black text

**Animations:**
- Icon: Shake 500ms (±10px horizontal)
- Container: Fade-in 300ms

---

## ContentLoader States

### State Flow
```
Loading → Error/Empty/Content
   ↓         ↓
   ↓      [Retry]
   ↓         ↓
   └─────────┘
```

### Loading State
```
┌─────────────────────────────────────┐
│                                     │
│              ⟳                      │
│       Loading content...            │
│                                     │
└─────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│              ⚠️                     │
│      Failed to load data            │
│  [Error message in box]             │
│         [Try Again]                 │
└─────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────┐
│              📄                     │
│       No data available             │
│    [Optional description]           │
│      [Optional action]              │
└─────────────────────────────────────┘
```

### Content State
```
┌─────────────────────────────────────┐
│  [Your actual content here]         │
│  • Item 1                           │
│  • Item 2                           │
│  • Item 3                           │
└─────────────────────────────────────┘
```

**Transitions:**
- All states: Fade 300ms
- Content: Fade-in with 10px translateY

---

## Responsive Behavior

### Desktop (≥768px)
- Full padding: 96px vertical, 24px horizontal
- Large icons: 80px (empty), 64px (error)
- Large text: 24px titles
- Horizontal button layout

### Mobile (<768px)
- Reduced padding: 64px vertical, 24px horizontal
- Smaller icons: 64px (empty), 48px (error)
- Smaller text: 20px titles
- Stacked button layout (full width)
- Minimum touch targets: 44px height

---

## Accessibility Features

### ARIA Attributes
```html
<!-- LoadingSpinner -->
<div role="status" aria-label="Loading...">
  <span class="sr-only">Loading...</span>
</div>

<!-- EmptyState -->
<div role="status" aria-label="Empty state">
  <!-- Content -->
</div>

<!-- ErrorState -->
<div role="alert" aria-label="Error occurred">
  <!-- Content -->
</div>
```

### Keyboard Navigation
- All buttons: Tab-accessible
- Focus indicators: 2px black outline, 2px offset
- Enter/Space: Activate buttons

### Screen Readers
- Hidden spinner text for loading state
- Descriptive ARIA labels
- Semantic HTML structure
- Proper heading hierarchy

---

## Animation Timing

### Standard Durations
- Fast: 150ms (hover states)
- Normal: 200ms (button transitions)
- Slow: 300ms (state transitions)
- Loading: 800ms (spinner rotation)
- Stagger: 100ms delay between elements

### Easing Functions
- Default: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- Fade-in: ease-out
- Fade-out: ease-in

### Reduced Motion
All animations disabled when `prefers-reduced-motion: reduce`:
- Spinner shows static state
- No fade/slide animations
- Instant state transitions
- No transform effects

---

## Color Palette

### Backgrounds
- Primary: `rgb(255, 255, 255)` (white)
- Secondary: `rgb(250, 250, 250)` (light gray)
- Error box: `rgb(254, 242, 242)` (light red)

### Text
- Primary: `rgb(0, 0, 0)` (black)
- Secondary: `rgb(115, 115, 115)` (gray)
- Error: `rgb(220, 38, 38)` (red)

### Borders
- Light: `rgb(242, 242, 242)`
- Medium: `rgb(229, 229, 229)`
- Error: `rgb(254, 226, 226)`

### Buttons
- Primary: Black bg, white text
- Secondary: White bg, black text, gray border
- Error: Red bg, white text

---

## Usage Patterns

### Pattern 1: Simple Loading
```vue
<LoadingSpinner v-if="loading" />
<div v-else>{{ content }}</div>
```

### Pattern 2: Full State Management
```vue
<ContentLoader
  :loading="loading"
  :error="error"
  :empty="!hasData"
>
  <YourContent />
</ContentLoader>
```

### Pattern 3: Inline Loading
```vue
<button :disabled="submitting">
  <LoadingSpinner v-if="submitting" size="sm" />
  <span v-else>Submit</span>
</button>
```

---

## Component Sizes

### File Sizes (minified + gzipped)
- LoadingSpinner: ~1KB
- EmptyState: ~2KB
- ErrorState: ~2KB
- ContentLoader: ~1.5KB

### DOM Complexity
- LoadingSpinner: 3 elements
- EmptyState: 5-7 elements
- ErrorState: 6-8 elements
- ContentLoader: Varies by state

---

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

All features work across modern browsers with graceful degradation for older browsers.
