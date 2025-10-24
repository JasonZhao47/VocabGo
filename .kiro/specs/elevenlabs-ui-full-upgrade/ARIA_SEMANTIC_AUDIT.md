# ARIA Labels and Semantic HTML Audit

## Overview
This document provides a comprehensive audit of ARIA labels and semantic HTML implementation across the VocabGo application, addressing Requirement 13.2.

## Current State Assessment

### ✅ Well-Implemented Components

#### 1. App.vue
- **Skip-to-content link**: Properly implemented for keyboard navigation
- **Main landmark**: `<main id="main-content" role="main">` with tabindex="-1"
- **Application role**: Root div has `role="application"`
- **Focus management**: Skip link properly focuses main content

#### 2. Input.vue
- **Label association**: Proper `<label for="inputId">` with unique IDs
- **Required indicator**: Visual `*` with `aria-required` attribute
- **Error states**: `aria-invalid` and `aria-describedby` for error messages
- **Helper text**: Properly associated with `aria-describedby`
- **Error messages**: `role="alert"` for immediate announcement
- **Icons**: `aria-hidden="true"` on decorative SVGs

#### 3. Textarea.vue
- **Label association**: Proper `<label for="textareaId">` with unique IDs
- **Required indicator**: Visual `*` with `aria-required` attribute
- **Error states**: `aria-invalid` and `aria-describedby`
- **Character count**: Visible but not announced (acceptable)
- **Error messages**: `role="alert"` for immediate announcement

#### 4. Modal.vue
- **Dialog role**: `role="dialog"` with `aria-modal="true"`
- **Labeling**: `aria-labelledby` for title, `aria-describedby` for description
- **Focus trap**: Implemented via useKeyboardNavigation composable
- **Close button**: `aria-label="Close modal"`
- **Backdrop**: `aria-hidden="true"` on non-interactive backdrop

#### 5. Toggle.vue
- **Switch role**: `role="switch"` for toggle button
- **State**: `aria-checked` reflects current state
- **Label**: `aria-label` prop for accessibility
- **Button type**: `type="button"` to prevent form submission

#### 6. Accordion.vue
- **Button semantics**: `type="button"` for trigger
- **Expansion state**: `aria-expanded` reflects open/closed state
- **Content association**: `aria-controls` links trigger to content
- **Content visibility**: `aria-hidden` on collapsed content
- **Unique IDs**: Generated for `aria-controls` association

#### 7. ToastContainer.vue
- **Live region**: `aria-live="polite"` on container
- **Atomic updates**: `aria-atomic="true"` for complete announcements
- **Role**: `role="alert"` for errors, `role="status"` for others
- **Descriptive labels**: `aria-label` with type and message
- **Close button**: `aria-label="Close"` on dismiss button

#### 8. Header.vue
- **Semantic HTML**: `<header>` element
- **Button semantics**: Toggle buttons have `type="button"`
- **Aria labels**: "Toggle navigation menu", "Expand/Collapse sidebar"
- **Aria controls**: `aria-controls="main-sidebar"`
- **Expansion state**: `aria-expanded` on desktop toggle
- **Icons**: `aria-hidden="true"` on decorative SVGs
- **Touch targets**: Minimum 44px for mobile accessibility

### ⚠️ Components Needing Enhancement

#### 1. Button.vue
**Current State:**
- Has proper button semantics
- Loading state with spinner
- Disabled state handling

**Needs:**
- `aria-busy="true"` when loading
- `aria-label` or `aria-labelledby` when only icon is present
- `aria-disabled` in addition to `disabled` attribute

#### 2. Card.vue
**Current State:**
- Uses semantic HTML (`<article>`, `<section>`, `<div>`)
- Interactive cards have click handlers

**Needs:**
- `role="article"` or `role="region"` for semantic cards
- `aria-label` or `aria-labelledby` for card identification
- `tabindex="0"` for interactive cards
- `role="button"` for clickable cards

#### 3. DataTable.vue
**Current State:**
- Uses `<table>` semantic HTML
- Has headers and data cells

**Needs:**
- `role="table"` (implicit but can be explicit)
- `scope="col"` on header cells
- `scope="row"` on row headers
- `aria-label` or `<caption>` for table description
- `aria-sort` on sortable columns
- `aria-rowcount` and `aria-rowindex` for virtual scrolling

#### 4. HomePage.vue
**Current State:**
- Has heading hierarchy (h1)
- Semantic structure

**Needs:**
- Proper heading hierarchy (h1 → h2 → h3)
- `<section>` elements with `aria-labelledby`
- Landmark roles for major sections

#### 5. UploadPage.vue
**Current State:**
- Has heading (h1)
- File input with label

**Needs:**
- `aria-label` on file input
- `aria-describedby` for upload instructions
- `aria-live` region for upload status
- Proper heading hierarchy
- `<section>` elements for content areas

#### 6. SavedWordlistsPage.vue
**Current State:**
- Has heading (h1)
- Search input
- Table structure

**Needs:**
- `aria-label` on search input
- `role="search"` on search container
- Proper heading hierarchy (h1 → h2 → h3)
- `aria-live` region for dynamic content updates
- `<section>` elements with labels

## Implementation Plan

### Phase 1: Button Component Enhancement
