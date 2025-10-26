# ElevenLabs List Styling - Implementation Plan

## Goal
Apply 1:1 ElevenLabs Sound Effects list styling to VocabGo's SavedWordlistsPage.vue

## Key Changes Required

### 1. Word Count Display (CRITICAL)
**Current**: Black pill with white text background
**Target**: Plain gray text, no background

```css
/* REMOVE */
.table-word-count {
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 6px 16px;
  border-radius: 9999px;
}

/* REPLACE WITH */
.table-word-count {
  color: #6B7280;
  font-size: 14px;
  font-weight: 400;
}
```

### 2. Action Icons
**Current**: ActionButton components with emoji icons
**Target**: Three clean SVG icon buttons (share, download, delete)

Replace:
```vue
<ActionButton icon="📥" label="Download" />
<ActionButton icon="🎯" label="Practice" />
<ActionButton icon="🗑️" label="Delete" />
```

With:
```vue
<button class="action-icon-btn" aria-label="Share">
  <svg><!-- share icon --></svg>
</button>
<button class="action-icon-btn" aria-label="Download">
  <svg><!-- download icon --></svg>
</button>
<button class="action-icon-btn" aria-label="Delete">
  <svg><!-- delete icon --></svg>
</button>
```

### 3. List Item Rows
**Current**: DataTable component with default styling
**Target**: Subtle borders, more padding, cleaner hover states

```css
/* Row styling */
.data-table-row {
  padding: 12-16px;
  border: 1px solid rgba(0, 0, 29, 0.075);
  border-radius: 8px;
  background: white;
}

.data-table-row:hover {
  background: rgba(0, 0, 0, 0.02);
}
```

### 4. Date Display
**Current**: Styled with ElevenLabs typography
**Target**: Keep similar, ensure gray color

```css
.table-date {
  color: #6B7280;
  font-size: 14px;
  font-weight: 400;
}
```

### 5. Status Badge
**Current**: Gradient purple/pink badge for "Shared"
**Target**: Keep as is (this is unique to VocabGo, not in ElevenLabs)

## Implementation Steps

1. ✅ Create design study document
2. ✅ Capture screenshots
3. ⬜ Update word count styling (remove background)
4. ⬜ Create SVG icon components
5. ⬜ Replace ActionButton with icon buttons
6. ⬜ Update DataTable row styling
7. ⬜ Test responsive behavior
8. ⬜ Verify accessibility
9. ⬜ Take "after" screenshots

## Icon SVGs Needed

### Share Icon
```svg
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
</svg>
```

### Download Icon
```svg
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
</svg>
```

### Delete Icon
```svg
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
</svg>
```

## CSS Variables to Add

```css
:root {
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  
  /* Borders */
  --border-subtle: rgba(0, 0, 29, 0.075);
  
  /* Backgrounds */
  --bg-hover: rgba(0, 0, 0, 0.02);
  --bg-button-hover: rgba(0, 0, 0, 0.05);
  
  /* Icon Button */
  --icon-btn-size: 32px;
  --icon-size: 16px;
}
```

## Testing Checklist

- [ ] Word count displays as plain gray text
- [ ] Action icons are visible and clickable
- [ ] Hover states work on icons
- [ ] Row hover effect is subtle
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Visual match with ElevenLabs screenshots

## Notes

- Keep the "Practice" button functionality but style it as an icon
- Maintain all existing functionality (delete, download, share)
- Ensure accessibility is not compromised
- Test with actual wordlist data
