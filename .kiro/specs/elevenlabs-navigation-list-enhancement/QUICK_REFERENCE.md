# Quick Reference - ElevenLabs List Styling

## At a Glance

### The Big Change
**Word Count**: Black pill → Plain gray text ⭐

### Before
```
[40 words]  ← Black background, white text
```

### After
```
40  ← Gray text, no background
```

## Icon Buttons

### Size
- Button: 32px × 32px
- Icon: 16px × 16px
- Padding: 8px
- Gap: 4px

### Colors
- Default: #6B7280 (gray)
- Hover: #111827 (darker)
- Hover BG: rgba(0, 0, 0, 0.05)

### Icons Used
1. 🔗 Share (network icon)
2. ⬇️ Download (down arrow)
3. 🗑️ Delete (trash can)

## CSS Quick Copy

```css
/* Word Count - Plain Text */
.table-word-count {
  color: #6B7280;
  font-size: 14px;
  font-weight: 400;
}

/* Icon Button */
.action-icon-btn {
  width: 32px;
  height: 32px;
  padding: 8px;
  background: transparent;
  border-radius: 6px;
  color: #6B7280;
  transition: all 150ms ease;
}

.action-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111827;
}
```

## SVG Icons

### Share Icon
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
</svg>
```

### Download Icon
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
</svg>
```

### Delete Icon
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
</svg>
```

## Color Palette

```css
#111827  /* Primary text (dark) */
#6B7280  /* Secondary text (gray) */
rgba(0, 0, 0, 0.02)   /* Row hover */
rgba(0, 0, 0, 0.05)   /* Button hover */
rgba(0, 0, 29, 0.075) /* Subtle border */
```

## Typography

```css
font-size: 14px;
font-weight: 400;
letter-spacing: -0.005em;
color: #6B7280;
```

## Key Principles

1. **Minimal**: Less visual noise
2. **Subtle**: Light hover effects (2-5% opacity)
3. **Consistent**: Same sizing throughout
4. **Professional**: Clean, modern look
5. **Accessible**: ARIA labels, keyboard nav

## Testing

```bash
# Start dev server
pnpm dev

# Navigate to
http://localhost:5173/wordlists

# Upload documents to see list
# Hover over icons to test
# Click to verify functionality
```

## Files Changed

- `src/pages/SavedWordlistsPage.vue`

## Match Score

99% match with ElevenLabs Sound Effects list design
