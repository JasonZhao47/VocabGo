# Design Document: Processing Modal Enhancement

## Overview

This design transforms the processing page from a full-page view into a modal overlay that appears on top of the upload page. The modal will display upload progress and processing stages while maintaining user context. The implementation leverages existing modal infrastructure and animation systems to create a polished, ElevenLabs-inspired experience.

## Architecture

### Component Structure

```
UploadPage.vue (modified)
├── ProcessingModal.vue (new component)
│   ├── Modal.vue (existing, reused)
│   │   ├── Backdrop (blur + dark overlay)
│   │   └── Modal Content
│   │       ├── Close Button
│   │       ├── Processing Content
│   │       │   ├── File Info
│   │       │   ├── Loading Spinner
│   │       │   ├── Stage Indicators
│   │       │   ├── Progress Bar
│   │       │   └── Status Message
│   │       └── Error State (conditional)
│   └── Toast Notification (on success)
```

### State Management Flow

```
User uploads file
    ↓
uploadState.startUpload(file)
    ↓
ProcessingModal opens (v-model bound to isUploading || isProcessing)
    ↓
Upload progress → Processing stages
    ↓
Success: Modal closes → Toast notification → Navigate to /result
Error: Show error in modal → User can retry or close
```

## Components and Interfaces

### 1. ProcessingModal Component (New)

**Location:** `src/components/processing/ProcessingModal.vue`

**Purpose:** Wraps the existing Modal component with processing-specific content

**Props:**
```typescript
interface Props {
  modelValue: boolean  // Controls modal visibility
}
```

**Emits:**
```typescript
interface Emits {
  'update:modelValue': [value: boolean]
  'retry': []  // When user clicks "Try Again" on error
}
```

**Key Features:**
- Reuses existing `Modal.vue` component with `size="medium"`
- Sets `closable={true}`, `closeOnBackdrop={true}`, `closeOnEscape={true}`
- Watches `uploadState` for status changes
- Displays different content based on upload/processing/error states
- Auto-closes on successful completion
- Shows toast notification on success

### 2. UploadPage Modifications

**Changes Required:**
- Add `ProcessingModal` component
- Bind modal visibility to `isUploading || isProcessing || hasError`
- Remove navigation to `/processing` route
- Handle modal close events
- Show success toast when processing completes

**Template Structure:**
```vue
<template>
  <div class="upload-page">
    <!-- Existing upload UI -->
    
    <!-- New Processing Modal -->
    <ProcessingModal 
      v-model="showProcessingModal"
      @retry="handleRetry"
    />
  </div>
</template>
```

### 3. Router Changes

**Remove `/processing` route** since processing now happens in a modal overlay

**Update navigation logic:**
- After upload: Stay on `/upload` page, show modal
- After completion: Close modal, show toast, navigate to `/result`

## Data Models

### Upload State (Existing - No Changes)

```typescript
interface UploadState {
  status: UploadStatus  // 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  currentFile: File | null
  currentResult: WordPair[] | null
  error: string | null
  processingStage: ProcessingStage | null  // 'cleaning' | 'extracting' | 'translating'
}
```

### Modal State (Computed)

```typescript
const showProcessingModal = computed(() => 
  isUploading.value || isProcessing.value || hasError.value
)
```

## Visual Design Specifications

### Modal Styling

**Dimensions:**
- Width: `max-w-lg` (512px)
- Padding: 32px
- Border radius: 12px
- Max height: 90vh (scrollable if needed)

**Backdrop:**
- Background: `rgba(0, 0, 0, 0.75)`
- Backdrop filter: `blur(8px)`
- Z-index: 9999

**Colors:**
- Background: `rgb(255, 255, 255)`
- Text primary: `rgb(0, 0, 0)`
- Text secondary: `rgb(107, 114, 128)` (gray-600)
- Progress bar: `rgb(0, 0, 0)`
- Error: `rgb(239, 68, 68)` (red-500)
- Success indicator: `rgb(34, 197, 94)` (green-500)

### Processing Content Layout

**Vertical spacing:**
- Title: `mb-4` (16px)
- File info section: `mb-6` (24px)
- Spinner: `mb-8` (32px)
- Stage label: `mb-6` (24px)
- Stage indicators: `mb-6` (24px)
- Progress bar: `mb-6` (24px)
- Status message: (no bottom margin)

**Stage Indicators:**
- Size: 12px diameter circles
- Gap: 24px between indicators
- States:
  - Pending: `bg-gray-300`
  - Active: `bg-black` with pulse animation
  - Completed: `bg-green-500` with scale animation

**Progress Bar:**
- Height: 6px (1.5 in Tailwind)
- Background: `bg-gray-200`
- Fill: `bg-black`
- Border radius: Full (pill shape)
- Transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)

### Loading Spinner

**Specifications:**
- Size: 64px diameter
- Border width: 3px
- Border color: `rgb(242, 242, 242)` (gray-100)
- Border top color: `rgb(0, 0, 0)` (black)
- Animation: 800ms linear infinite rotation

## Animations

### Modal Entry Animation

**Timeline (300ms total):**
1. Backdrop fade-in: 0-210ms (70% of duration)
   - Opacity: 0 → 1
   - Easing: `easeOut`

2. Modal scale + slide: 50-300ms
   - Opacity: 0 → 1
   - Scale: 0.95 → 1
   - Y position: 20px → 0
   - Easing: `spring` (cubic-bezier(0.34, 1.56, 0.64, 1))

### Modal Exit Animation

**Timeline (300ms total):**
1. Modal scale + slide: 0-240ms (80% of duration)
   - Opacity: 1 → 0
   - Scale: 1 → 0.95
   - Y position: 0 → 20px
   - Easing: `easeIn`

2. Backdrop fade-out: 100-300ms
   - Opacity: 1 → 0
   - Easing: `easeIn`

### Stage Transition Animation

**When stage changes:**
- Stage label: Slide fade transition (200ms)
  - Old label: Slide down 10px + fade out
  - New label: Slide up from 10px + fade in
  
- Stage indicator: Scale pulse (300ms)
  - Scale: 1 → 1.2 → 1
  - Easing: `easeOut`

- Progress bar: Smooth width transition (300ms)
  - Easing: `easeInOut`

### Success Animation

**On completion:**
1. Final stage indicator turns green with scale animation
2. Modal closes after 500ms delay
3. Toast notification slides in from top-right
4. Navigate to `/result` page

## Error Handling

### Error Display in Modal

**Layout:**
- Error icon (64px, red) with shake animation
- Error message in red-themed box
- Two action buttons:
  - "Try Again" (primary, black)
  - "Cancel" (secondary, gray)

**Error States:**
1. Upload failure: "Failed to upload document"
2. Processing failure: "Failed to process document"
3. Network error: "Network error. Please check your connection"

**User Actions:**
- Try Again: Closes modal, resets state, user can select file again
- Cancel/Close: Closes modal, resets state, returns to idle

## Accessibility

### ARIA Labels

```html
<div role="dialog" aria-modal="true" aria-labelledby="processing-title">
  <h2 id="processing-title">Processing Document</h2>
  <div aria-live="polite" aria-atomic="true">
    <!-- Status updates announced to screen readers -->
  </div>
</div>
```

### Keyboard Navigation

- **Escape key:** Closes modal (if not in critical processing state)
- **Tab:** Cycles through focusable elements (close button, action buttons)
- **Focus trap:** Focus stays within modal when open

### Screen Reader Announcements

- Upload start: "Uploading document [filename]"
- Stage changes: "Processing stage: [stage name]"
- Completion: "Processing complete"
- Error: "Error: [error message]"

### Color Contrast

All text meets WCAG AA standards:
- Black text on white: 21:1 ratio
- Gray-600 text on white: 7:1 ratio
- White text on black buttons: 21:1 ratio
- Error text on light red background: 4.5:1+ ratio

## Responsive Design

### Desktop (≥768px)
- Modal width: 512px (max-w-lg)
- Padding: 32px
- Spinner: 64px
- Font sizes: Standard (text-xl for title, text-base for body)

### Mobile (<768px)
- Modal width: calc(100vw - 32px)
- Padding: 24px
- Spinner: 48px
- Font sizes: Slightly smaller (text-lg for title, text-sm for body)
- Stage indicators: Smaller gap (16px instead of 24px)

### Touch Targets

All interactive elements meet minimum 44x44px touch target size:
- Close button: 44x44px
- Action buttons: Full width, 48px height

## Testing Strategy

### Unit Tests

**ProcessingModal.vue:**
- Renders correctly with different states (uploading, processing, error)
- Displays correct stage information
- Emits events correctly (close, retry)
- Updates progress bar based on stage
- Shows/hides based on modelValue prop

**UploadPage.vue:**
- Shows modal when upload starts
- Hides modal when processing completes
- Handles retry action
- Shows toast on success
- Navigates to result page after completion

### Integration Tests

- Full upload flow: Select file → Upload → Process → Complete → Toast → Navigate
- Error handling: Upload fails → Show error → Retry
- Modal interactions: Close button, backdrop click, escape key
- Stage transitions: Verify smooth animations between stages

### Accessibility Tests

- Keyboard navigation works correctly
- Screen reader announcements are accurate
- Focus trap functions properly
- ARIA labels are present and correct
- Color contrast meets WCAG AA

### Visual Regression Tests

- Modal appearance matches design specs
- Animations are smooth and performant
- Responsive behavior works on all screen sizes
- Dark mode compatibility (if applicable)

## Performance Considerations

### Animation Performance

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, or `top/left` properties
- Use `will-change` sparingly and only during animations
- Leverage existing `useModalAnimation` composable

### Bundle Size

- Reuse existing Modal component (no additional bundle cost)
- Minimal new code (~200 lines for ProcessingModal)
- No new dependencies required

### Memory Management

- Clean up animation timers on component unmount
- Remove event listeners when modal closes
- Clear upload state after navigation

## Migration Path

### Phase 1: Create ProcessingModal Component
1. Create new component file
2. Implement basic structure with Modal wrapper
3. Add processing content (spinner, stages, progress)
4. Add error state handling

### Phase 2: Integrate with UploadPage
1. Import ProcessingModal
2. Add modal to template with v-model binding
3. Remove navigation to /processing route
4. Add toast notification on success

### Phase 3: Update Router
1. Remove /processing route definition
2. Update any links/navigation that reference /processing
3. Test all navigation flows

### Phase 4: Remove ProcessingPage
1. Delete src/pages/ProcessingPage.vue
2. Clean up any unused imports
3. Update tests

### Phase 5: Polish & Test
1. Fine-tune animations
2. Add accessibility features
3. Write comprehensive tests
4. Perform visual QA

## Dependencies

### Existing (Reused)
- `Modal.vue` - Base modal component
- `useModalAnimation` - Modal animation composable
- `useToast` - Toast notification system
- `uploadState` - Upload state management
- `useLoadingAnimation` - Progress bar animation
- `Skeleton.vue` - Loading skeleton for file name

### New (None Required)
All functionality can be implemented using existing components and composables.

## Open Questions

1. **Should the modal be dismissible during active processing?**
   - Recommendation: No, prevent closing during upload/processing to avoid interrupting the operation
   - Allow closing only in error state or when idle

2. **Should we show a small toast notification in the corner during processing?**
   - Recommendation: No, the modal provides sufficient feedback
   - Only show toast on successful completion

3. **What happens if user navigates away while processing?**
   - Recommendation: Processing continues in background
   - Show modal again if user returns to /upload page
   - Consider adding a small indicator in header if processing is active

4. **Should we add a "Cancel Upload" button?**
   - Recommendation: Yes, add for better UX
   - Only show during upload phase (not during processing)
   - Implement abort controller for fetch request
