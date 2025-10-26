# ElevenLabs Sound Effects List - Design Study

## Overview
This document captures the exact design specifications from the ElevenLabs Sound Effects list page for 1:1 replication in the VocabGo wordlists page.

## Screenshots Captured
- `elevenlabs-sound-effects-list.png` - Full page view
- `elevenlabs-list-items-detail.png` - Detailed view of list items

## List Container Design

### Table Header
- **Background**: White/Light gray
- **Text Color**: Gray (#6B7280 or similar)
- **Font Size**: Small (12-13px)
- **Font Weight**: Medium (500)
- **Padding**: 12px vertical, 16px horizontal
- **Columns**: Description | Duration | Downloads | Actions
- **Border Bottom**: 1px solid light gray

### List Item Rows

#### Row Structure
- **Display**: Flex
- **Align Items**: Center
- **Padding**: 12-16px vertical, 16px horizontal
- **Background**: White
- **Border**: 1px solid rgba(0, 0, 29, 0.075) - very subtle
- **Border Radius**: 8px
- **Gap**: 16px between columns
- **Hover State**: Slight background change (rgba(0, 0, 0, 0.02))
- **Min Height**: ~72px

#### Row Layout (Grid/Flex)
```
[Play Button] [Description + Tags] [Duration] [Downloads] [Action Icons]
     60px           flex-1            80px       80px         120px
```

## Key Design Elements

### 1. Downloads Number Display
**CRITICAL STYLING** - This is what you specifically asked about:

- **Color**: `#6B7280` or `rgb(107, 114, 128)` - Medium gray
- **Font Size**: `14px`
- **Font Weight**: `400` (Regular)
- **Background**: **NONE** - No background color, just plain text
- **Display**: Inline text, right-aligned in its column
- **No Badge**: Unlike other number displays, this is plain text without any background

Example: `561`, `927`, `56` - just gray numbers, no background

### 2. Duration Display
- **Color**: Same gray as downloads `#6B7280`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Format**: `30s`, `2s`, `6s`, `8s`
- **Background**: None
- **May have loop icon**: Small infinity symbol (∞) for looping sounds

### 3. Action Icons (Right Side)

Three icon buttons in a row:

#### Icon Button Styling
- **Size**: 32px × 32px (or 36px × 36px)
- **Padding**: 8px
- **Background**: Transparent (default state)
- **Background (Hover)**: `rgba(0, 0, 0, 0.05)` - very subtle gray
- **Border**: None
- **Border Radius**: 6px
- **Gap Between Icons**: 4px
- **Cursor**: Pointer
- **Transition**: All 150ms ease

#### Icon Types (Left to Right)
1. **Share Icon** - Share/link icon
   - SVG icon, ~16px size
   - Color: `#6B7280` (gray)
   - Hover: Slightly darker

2. **Download Icon** - Download arrow icon
   - SVG icon, ~16px size
   - Color: `#6B7280` (gray)
   - Hover: Slightly darker

3. **Favorite/Star Icon** - Star outline
   - SVG icon, ~16px size
   - Color: `#6B7280` (gray)
   - Filled state: `#F59E0B` (amber/yellow)
   - Hover: Slightly darker or filled

### 4. Description Area
- **Font Size**: 14px
- **Font Weight**: 400
- **Color**: `#111827` (dark gray/black)
- **Line Height**: 1.5
- **Max Lines**: 2 (with ellipsis)
- **Tags Below**: Small pill-shaped tags
  - Background: `rgba(0, 0, 0, 0.05)`
  - Color: `#6B7280`
  - Padding: 4px 8px
  - Border Radius**: 4px
  - Font Size: 12px
  - Gap: 4px

### 5. Play Button (Left Side)
- **Size**: 40px × 40px circle
- **Background**: `rgba(0, 0, 0, 0.05)` (light gray)
- **Background (Hover)**: `rgba(0, 0, 0, 0.1)`
- **Icon**: Play triangle, centered
- **Icon Color**: `#111827`
- **Border Radius**: 50% (circle)
- **Transition**: All 150ms ease

## Color Palette

```css
/* Primary Text */
--text-primary: #111827;

/* Secondary Text (Numbers, Duration) */
--text-secondary: #6B7280;

/* Borders */
--border-subtle: rgba(0, 0, 29, 0.075);
--border-light: rgba(0, 0, 0, 0.1);

/* Backgrounds */
--bg-white: #FFFFFF;
--bg-hover: rgba(0, 0, 0, 0.02);
--bg-button-hover: rgba(0, 0, 0, 0.05);
--bg-tag: rgba(0, 0, 0, 0.05);

/* Accent */
--accent-favorite: #F59E0B;
```

## Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;

/* Sizes */
--text-xs: 12px;
--text-sm: 13px;
--text-base: 14px;
--text-lg: 16px;

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
```

## Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
```

## Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-full: 9999px;
```

## Key Observations for VocabGo Implementation

1. **No Background on Numbers**: The downloads count is plain gray text, NOT in a badge or pill
2. **Subtle Borders**: Very light borders (almost invisible) on list items
3. **Generous Spacing**: Plenty of padding and gaps between elements
4. **Minimal Hover States**: Very subtle hover effects (2-5% opacity changes)
5. **Icon Consistency**: All action icons are the same size and color
6. **Clean Typography**: Simple, readable fonts with good line height
7. **No Shadows**: No box shadows on list items (unlike cards)
8. **Flat Design**: Very flat, minimal design with subtle depth

## Implementation Priority

For VocabGo wordlists page:

1. ✅ Update downloads/word count to plain gray text (remove background)
2. ✅ Add three action icons (share, download, delete/favorite)
3. ✅ Update row padding and spacing
4. ✅ Simplify borders (make more subtle)
5. ✅ Update hover states (more subtle)
6. ✅ Ensure consistent icon sizing
7. ✅ Update typography to match
8. ✅ Add proper column alignment

## Icon SVGs to Extract

Need to download/create these icons:
- Share icon (link/share symbol)
- Download icon (down arrow)
- Star icon (outline and filled states)
- Delete icon (trash can) - for VocabGo

These should be simple, clean SVG icons at 16px size.
