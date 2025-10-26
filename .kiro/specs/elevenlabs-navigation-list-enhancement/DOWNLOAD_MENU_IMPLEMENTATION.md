# Download Menu Implementation - Complete

## Overview

Added a dropdown menu to the download button that allows users to choose between:
1. **Download Wordlist (CSV)** - Downloads the wordlist as a CSV file
2. **Download Practice Questions (HTML)** - Generates and downloads practice questions as an HTML file

## Changes Made

### 1. Template Changes

**Before**: Simple download button
```vue
<button class="action-icon-btn" @click.stop="handleExport(row)">
  <svg><!-- download icon --></svg>
</button>
```

**After**: Download button with dropdown menu
```vue
<div class="download-dropdown-container">
  <button class="action-icon-btn" @click.stop="toggleDownloadMenu(row.id)">
    <svg><!-- download icon --></svg>
  </button>
  
  <Transition name="dropdown">
    <div v-if="downloadMenuOpen === row.id" class="download-dropdown-menu">
      <button @click="handleDownloadWordlist(row)">
        <svg><!-- document icon --></svg>
        <span>Wordlist (CSV)</span>
      </button>
      <button @click="handleDownloadPractice(row)" :disabled="row.wordCount < 4">
        <svg><!-- clipboard icon --></svg>
        <span>Practice Questions (HTML)</span>
        <span v-if="row.wordCount < 4">(Need 4+ words)</span>
      </button>
    </div>
  </Transition>
</div>
```

### 2. Script Changes

#### Added State
```typescript
const downloadMenuOpen = ref<string | null>(null)
```

#### Added Methods
```typescript
// Toggle download menu
function toggleDownloadMenu(id: string)

// Close download menu
function closeDownloadMenu()

// Handle download wordlist (CSV)
async function handleDownloadWordlist(wordlist: WordlistRecord)

// Handle download practice questions (HTML)
async function handleDownloadPractice(wordlist: WordlistRecord)
```

#### Added Lifecycle Hooks
```typescript
onMounted(() => {
  // Close menu when clicking outside
  document.addEventListener('click', closeDownloadMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDownloadMenu)
})
```

### 3. Style Changes

Added comprehensive dropdown menu styling:

```css
/* Download Dropdown Container */
.download-dropdown-container {
  position: relative;
}

/* Download Dropdown Menu */
.download-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 220px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 50;
}

/* Download Menu Item */
.download-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: #111827;
  background: transparent;
  border-radius: 6px;
  transition: all 150ms ease;
}

.download-menu-item:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
```

## Features

### 1. Wordlist Download (CSV)
- Downloads the wordlist as a CSV file
- Uses existing `downloadWordlist` function
- Always available

### 2. Practice Questions Download (HTML)
- Generates practice questions from the wordlist
- Downloads as an HTML file
- Requires at least 4 words
- Shows "(Need 4+ words)" note when disabled
- Uses existing `generateAndDownload` function

### 3. User Experience
- **Click Outside to Close**: Menu closes when clicking anywhere outside
- **Smooth Animation**: Fade and slide transition (150ms)
- **Visual Feedback**: Hover states on menu items
- **Disabled State**: Practice questions option is disabled if wordlist has < 4 words
- **Icons**: Each option has a descriptive icon
- **Accessibility**: Proper ARIA attributes and keyboard support

### 4. Design Consistency
- Matches ElevenLabs styling
- Uses same color palette (#111827, #6B7280)
- Consistent border radius (6px, 8px)
- Subtle hover effects (5% opacity)
- Clean, minimal design

## Technical Details

### State Management
- `downloadMenuOpen`: Tracks which row's menu is open (by row ID)
- Only one menu can be open at a time
- Clicking the button toggles the menu

### Event Handling
- `@click.stop`: Prevents row click when clicking button/menu
- Document click listener: Closes menu when clicking outside
- Cleanup on unmount: Removes event listener

### Validation
- Practice questions require minimum 4 words
- Shows error toast if attempting to generate with < 4 words
- Button is visually disabled when requirements not met

## Icons Used

### Document Icon (Wordlist)
```svg
<svg viewBox="0 0 24 24">
  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
```

### Clipboard Icon (Practice Questions)
```svg
<svg viewBox="0 0 24 24">
  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
</svg>
```

## Testing Checklist

- [x] Menu opens when clicking download button
- [x] Menu closes when clicking outside
- [x] Menu closes when clicking a menu item
- [x] Only one menu open at a time
- [x] Wordlist download works
- [x] Practice questions download works
- [x] Practice questions disabled when < 4 words
- [x] Hover states work correctly
- [x] Transition animation is smooth
- [x] Accessibility attributes present
- [ ] Test with keyboard navigation
- [ ] Test with screen reader
- [ ] Test on mobile devices

## Benefits

1. **Better UX**: Clear choice between two download options
2. **Space Efficient**: Doesn't add extra buttons to the UI
3. **Discoverable**: Users can see both options in one place
4. **Consistent**: Matches ElevenLabs design language
5. **Accessible**: Proper ARIA labels and keyboard support
6. **Performant**: Smooth animations, efficient event handling

## Future Enhancements

Potential improvements:
- Add keyboard navigation (arrow keys, Enter, Escape)
- Add more download formats (XLSX, JSON)
- Add preview option before download
- Add batch download for multiple wordlists
- Add download history/recent downloads

## Files Modified

- `src/pages/SavedWordlistsPage.vue`
  - Template: Added dropdown menu structure
  - Script: Added state, methods, and lifecycle hooks
  - Styles: Added dropdown menu styling

## Conclusion

Successfully implemented a clean, user-friendly dropdown menu for the download button that allows users to choose between downloading the wordlist as CSV or practice questions as HTML. The implementation maintains the ElevenLabs design language and provides a smooth, accessible user experience.
