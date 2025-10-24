# ElevenLabs Homepage Design Reference - 1:1 Replication Guide

## Screenshot Location
- Full page screenshot saved at: `/tmp/playwright-mcp-output/1760974321491/elevenlabs-home.png`
- Date captured: October 24, 2025

## Layout Structure

### Overall Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar - Left 200px fixed]  │  [Main Content Area]        │
│                                │                              │
│                                │  [New Badge] Agent Workflows │
│                                │                              │
│                                │  My Workspace                │
│                                │  Good afternoon, jessica hall│
│                                │                              │
│                                │  [6 Action Cards in Grid]    │
│                                │                              │
│                                │  Latest from the library     │
│                                │  [Voice cards list]          │
│                                │                              │
│                                │  Create or clone a voice     │
│                                │  [3 Option cards]            │
└─────────────────────────────────────────────────────────────┘
```

## Exact Measurements & Spacing

### Main Content Area
- **Background**: Pure white `rgb(255, 255, 255)`
- **Max width**: ~1200px centered
- **Padding**: 
  - Top: 48px
  - Left/Right: 48px
  - Bottom: 48px

### Header Section
1. **Workspace Name**
   - Text: "My Workspace"
   - Font size: 14px
   - Font weight: 400 (normal)
   - Color: `rgb(115, 115, 115)` (gray-500)
   - Margin bottom: 8px

2. **Greeting Heading**
   - Text: "Good afternoon, jessica hall"
   - Font size: 32px (2xl)
   - Font weight: 700 (bold)
   - Color: `rgb(0, 0, 0)` (black)
   - Line height: 1.2
   - Margin bottom: 48px

3. **Right Side Action** (Have a question?)
   - Position: Absolute top-right
   - Button: "Talk to El" with icon
   - Background: White with border
   - Border radius: 8px

### Action Cards Grid

#### Grid Layout
- **Display**: Grid
- **Columns**: 6 columns (auto-fit, minmax(140px, 1fr))
- **Gap**: 16px
- **Margin bottom**: 64px

#### Individual Card Specs
- **Width**: ~140px (flexible)
- **Height**: ~140px
- **Background**: `rgb(245, 245, 245)` (gray-100)
- **Border radius**: 12px
- **Padding**: 20px
- **Display**: Flex column
- **Align items**: Center
- **Justify content**: Center
- **Transition**: All 200ms ease
- **Cursor**: Pointer

#### Card Hover State
- **Background**: `rgb(242, 242, 242)` (gray-200)
- **Transform**: translateY(-2px)
- **Box shadow**: `0 4px 12px rgba(0, 0, 0, 0.08)`

#### Card Icon Container
- **Width**: 64px
- **Height**: 64px
- **Border radius**: 12px
- **Display**: Flex
- **Align items**: Center
- **Justify content**: Center
- **Margin bottom**: 16px
- **Background**: Gradient or solid color (varies per card)

#### Card Label
- **Font size**: 14px
- **Font weight**: 500 (medium)
- **Color**: `rgb(0, 0, 0)` (black)
- **Text align**: Center
- **Line height**: 1.4

### Card Icon Colors (from screenshot)

1. **Instant speech** (Blue theme)
   - Background: Light blue gradient
   - Icon color: Blue `rgb(59, 130, 246)`

2. **Audiobook** (Red theme)
   - Background: Light red/pink gradient
   - Icon color: Red `rgb(239, 68, 68)`

3. **ElevenLabs Agents** (Purple theme)
   - Background: Light purple gradient
   - Icon color: Purple `rgb(168, 85, 247)`

4. **Music** (Orange theme)
   - Background: Light orange gradient
   - Icon color: Orange `rgb(249, 115, 22)`

5. **Sound effect** (Blue theme)
   - Background: Light blue gradient
   - Icon color: Blue `rgb(59, 130, 246)`

6. **Dubbed video** (Green theme)
   - Background: Light green gradient
   - Icon color: Green `rgb(34, 197, 94)`

## Typography System

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
- **xs**: 12px
- **sm**: 14px
- **base**: 16px
- **lg**: 18px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

### Font Weights
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

### Line Heights
- **tight**: 1.1
- **snug**: 1.2
- **normal**: 1.4
- **relaxed**: 1.6

## Color Palette

### Neutrals
```css
--white: rgb(255, 255, 255);
--black: rgb(0, 0, 0);
--gray-50: rgb(250, 250, 250);
--gray-100: rgb(245, 245, 245);
--gray-200: rgb(242, 242, 242);
--gray-300: rgb(229, 229, 229);
--gray-400: rgb(163, 163, 163);
--gray-500: rgb(115, 115, 115);
--gray-600: rgb(82, 82, 82);
--gray-700: rgb(64, 64, 64);
--gray-800: rgb(38, 38, 38);
--gray-900: rgb(28, 28, 28);
```

### Accent Colors
```css
--blue-500: rgb(59, 130, 246);
--red-500: rgb(239, 68, 68);
--purple-500: rgb(168, 85, 247);
--orange-500: rgb(249, 115, 22);
--green-500: rgb(34, 197, 94);
```

## Spacing System (8px base unit)

```css
--spacing-0: 0px;
--spacing-1: 8px;
--spacing-2: 16px;
--spacing-3: 24px;
--spacing-4: 32px;
--spacing-6: 48px;
--spacing-8: 64px;
--spacing-12: 96px;
--spacing-16: 128px;
```

## Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

## Shadows

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

## Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

## Animation Details

### Page Entrance
- **Stagger delay**: 80ms between elements
- **Base delay**: 100ms
- **Animation**: Fade in + translate up
- **Duration**: 300ms
- **Easing**: ease-in-out

### Card Hover
- **Duration**: 200ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Transform**: translateY(-2px)
- **Shadow**: Increases on hover

## Responsive Breakpoints

### Mobile (< 768px)
- Action cards: 2 columns
- Font sizes: Scale down by ~20%
- Padding: Reduce to 24px

### Tablet (768px - 1023px)
- Action cards: 3 columns
- Font sizes: Scale down by ~10%
- Padding: 32px

### Desktop (≥ 1024px)
- Action cards: 6 columns (or 3 rows of 2)
- Full font sizes
- Padding: 48px

## Key Design Principles

1. **Generous White Space**: Don't crowd elements
2. **Clear Hierarchy**: Size and weight create clear visual flow
3. **Subtle Interactions**: Hover states are gentle, not jarring
4. **Consistent Spacing**: Always use 8px base unit multiples
5. **Accessible Colors**: All text meets WCAG AA contrast ratios
6. **Performance**: Animations respect prefers-reduced-motion

## Implementation Checklist

- [ ] Workspace name at top (gray-500, 14px)
- [ ] Large greeting heading (black, 32px, bold)
- [ ] Subtitle with proper spacing
- [ ] 6 action cards in responsive grid
- [ ] Card backgrounds: gray-100
- [ ] Card hover: gray-200 + lift + shadow
- [ ] Icon containers with colored backgrounds
- [ ] Proper spacing: 48px sections, 16px gaps
- [ ] Stagger animations on page load
- [ ] Smooth transitions (200ms)
- [ ] Mobile responsive (2 columns)
- [ ] Tablet responsive (3 columns)
- [ ] Desktop layout (6 columns or 3x2)
- [ ] Accessibility: ARIA labels, keyboard nav
- [ ] Reduced motion support

## VocabGo Adaptation

For VocabGo, we'll use:
- **2 action cards** instead of 6
- Same layout structure
- Same spacing and typography
- Same animation system
- Adapted greeting: "Good [timeOfDay], welcome to VocabGo"
- Cards: "Upload Document" and "View Wordlists"
- Icon colors: Blue for upload, Green for wordlists
