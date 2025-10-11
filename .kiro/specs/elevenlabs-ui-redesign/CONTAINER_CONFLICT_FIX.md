# Container Conflict Fix

## Issue
The upload page (and home page) were appearing blank after the Task 4 redesign.

## Root Cause
**Double Container Wrapping Conflict**

The application has a `Container` component in `App.vue` that wraps all pages with:
- `max-width: 700px`
- Massive vertical padding (120px top / 80px bottom on desktop)
- Horizontal padding (24-32px)

Both `HomePage.vue` and `UploadPage.vue` were defining their own container styling with:
- Their own `max-width: 700px`
- Their own padding values
- Their own centering logic

This created a **double wrapping** issue where:
1. The outer `Container` component applied constraints
2. The inner page containers applied additional constraints
3. The conflicting padding and max-width values caused layout issues
4. Content was either hidden or pushed off-screen

## Solution
Removed duplicate container styling from individual pages and let the `Container` component handle all layout concerns.

### Changes Made

#### HomePage.vue
- Removed `max-width: 700px` from `.hero-section`
- Removed `margin: 0 auto` (centering handled by Container)
- Removed all padding from `.hero-section` (Container handles this)
- Removed padding from `.below-fold` except for top padding for spacing
- Changed to `width: 100%` to fill the Container

#### UploadPage.vue
- Renamed `.upload-container` to `.upload-content` for clarity
- Removed `max-width: 700px` from the content wrapper
- Removed all padding from `.upload-page` (Container handles this)
- Removed responsive padding overrides
- Changed to `width: 100%` to fill the Container

## Result
- Pages now render correctly with proper spacing
- No conflicting layout constraints
- Consistent spacing across all pages (handled by Container)
- Cleaner, more maintainable code with single source of truth for layout

## Lesson Learned
When using a global layout component (like Container), individual pages should not define their own container constraints. Let the layout component handle max-width, centering, and padding.
