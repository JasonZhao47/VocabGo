# Design Document: ElevenLabs-Inspired UI Redesign

## Overview

This design transforms VocabGo into a premium, modern application inspired by ElevenLabs' sophisticated design system. The redesign focuses on clean minimalism, generous whitespace, subtle interactions, and a professional aesthetic that inspires confidence while maintaining excellent usability.

Based on extensive research of ElevenLabs' actual interface (homepage, sign-in, and text-to-speech pages), this design captures their core aesthetic: ultra-clean layouts, generous whitespace, subtle borders, rounded corners, and a focus on content over decoration.

## Design Principles

1. **Clean Minimalism**: Remove visual clutter, use generous whitespace, focus on content
2. **Subtle Sophistication**: Refined colors, smooth transitions, elegant typography  
3. **Professional Polish**: High-quality interactions, attention to detail, premium feel
4. **User-Centric**: Intuitive navigation, clear hierarchy, accessible design
5. **Content First**: Let the functionality shine, minimal decorative elements

## Key Observations from ElevenLabs Dashboard Research

### Detailed Interface Analysis

**1. Upload Modal (Speech-to-Text)**
- **Modal Structure**: Large centered modal with clean white background and subtle shadow
- **Upload Area**: Large drag-and-drop zone with subtle gray background (#F8F9FA)
- **Upload Icon**: Simple download icon in center, medium gray color
- **Text Hierarchy**: 
  - Primary: "Click or drag files here to upload" (black, medium weight)
  - Secondary: "Audio & video files, up to 1000MB" (gray, smaller)
- **Option Cards**: Two-column layout with radio button selection
  - AI Transcript: Selected state with subtle blue accent
  - Human Transcript: Clean card with "Productions" badge
- **Form Controls**: 
  - Dropdown for "Primary language" with "Detect" default
  - Toggle switches for "Tag audio events" and "Include subtitles"
  - Clean, minimal styling with proper labels
- **Action Button**: "Upload files" button (disabled state shown) with subtle gray styling

**2. Music Page (Long Input Interface)**
- **Page Layout**: Centered content with generous whitespace
- **Header**: "Begin your musical journey." with ElevenMusic branding
- **Text Area**: 
  - Large, prominent textarea with placeholder "Describe your song..."
  - Light gray background (#F8F9FA) similar to upload areas
  - Rounded corners (12px border-radius)
  - Expands to accommodate longer text (tested with 400+ character input)
  - Clean, minimal border styling
- **Control Row**: 
  - Left side: "2" button, "Auto" button, and additional control button
  - Right side: Credits display "40,000 credits remaining" with progress bar
  - "Generate" button (black, disabled state)
- **Layout Behavior**: Text area gracefully expands vertically to show full content
- **Typography**: Clean, readable font with good line-height for longer text

**3. Text-to-Speech Interface**
- **Main Layout**: Two-column design with large text area on left, settings panel on right
- **Text Area**: 
  - Large, prominent input area with placeholder text
  - Clean white background with subtle border
  - Suggestion pills below: "Get started with" followed by action buttons
  - Pills include: "Narrate a story", "Tell a silly joke", "Record an advertisement", etc.
- **Settings Panel**:
  - Tabbed interface: "Settings" and "History" tabs
  - Voice selector: Dropdown showing "Rachel" with avatar
  - Model selector: "Eleven Multilingual v2" with description
  - Sliders for: Speed, Stability, Similarity, Style Exaggeration
  - Toggle for "Speaker boost"
  - "Reset values" link in bottom right
- **Studio 3.0 Promotion**: Colorful gradient card promoting new features

**4. Studio Dashboard**
- **Page Header**: 
  - Large "Studio" title on left
  - Action buttons on right: "Upload" (outlined) and "New blank project" (black)
- **Content Sections**:
  - "Audio" section with 4 feature cards in 2x2 grid
  - "Video" section with 6 feature cards in 2x3 grid
- **Feature Cards**:
  - Colorful circular icons (blue, purple, orange, etc.)
  - Bold titles: "New audiobook", "Create a podcast", "URL to audio", etc.
  - Descriptive subtitles in gray text
  - Clean white backgrounds with subtle hover effects
- **Recent Projects**: 
  - Search bar with magnifying glass icon
  - Table headers: "Title", "Created at", "Actions"
  - Clean, minimal table styling

**5. Voice Library Interface**
- **Navigation Tabs**: "Explore", "My Voices", "Default Voices", "Collections"
- **Search & Filters**:
  - Large search bar with "Search library voices..." placeholder
  - "Search with audio sample" button with microphone icon
  - "Trending" dropdown filter
  - "Filters" button
  - "Create or Clone a Voice" prominent button (blue background)
- **Voice Cards Grid**:
  - 3-column grid layout for trending voices
  - Each card shows: avatar, name, category, language support
  - Clean white cards with subtle shadows
  - Language badges: "English +9", "English +11", etc.
- **Curated Sections**:
  - "Handpicked for your use case" with horizontal scroll
  - Large promotional cards with images and descriptions
  - "Weekly Spotlight - Customer Service Agents" section
  - Voice cards in table format with detailed information

**6. Design System Patterns**
- **Color Palette**: 
  - Pure white backgrounds (#FFFFFF)
  - Black text for primary content (#000000)
  - Medium gray for secondary text (#6B7280)
  - Light gray for tertiary text (#9CA3AF)
  - Subtle gray backgrounds for input areas (#F8F9FA)
- **Button Styles**:
  - Primary: Black background with white text, pill-shaped
  - Secondary: White background with black text and border
  - Disabled: Gray background with reduced opacity
- **Input Styling**:
  - Light gray backgrounds (#F8F9FA)
  - Subtle borders (#E5E7EB)
  - Rounded corners (8-12px)
  - Focus states with darker borders
- **Card Design**:
  - White backgrounds with subtle shadows
  - 12-16px border radius
  - Generous padding (20-24px)
  - Subtle hover effects (slight elevation)
- **Typography**:
  - Clean sans-serif font stack
  - Generous line-height (1.5-1.6)
  - Clear hierarchy with font weights (400, 500, 600, 700)
- **Spacing**:
  - Generous whitespace throughout
  - Consistent 8px grid system
  - Large margins between sections (32-48px)

## Architecture

### Design System Foundation

#### Color Palette

**Primary Colors (ElevenLabs Style):**
- Background: `#FFFFFF` (pure white for main areas)
- Surface Light: `#FAFAFA` (very light gray for input areas)
- Surface Card: `#FFFFFF` (white cards with shadows)
- Text Primary: `#000000` or `#0A0A0A` (true black or near-black)
- Text Secondary: `#6B7280` (medium gray)
- Text Tertiary: `#9CA3AF` (light gray)

**Accent Colors:**
- Primary Button: `#000000` (black) - ElevenLabs uses black for primary CTAs
- Primary Hover: `#1A1A1A` (slightly lighter black)
- Link Blue: `#3B82F6` (blue for text links)
- Success: `#10B981` (green)
- Error: `#EF4444` (red)
- Warning: `#F59E0B` (amber)

**Borders & Dividers:**
- Border Light: `#F3F4F6` (very subtle)
- Border Medium: `#E5E7EB` (subtle gray)
- Border Input: `#D1D5DB` (input borders)
- Border Focus: `#000000` (black focus state)

#### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

**Type Scale:**
- Display: 48px / 56px (line-height), font-weight: 700
- H1: 36px / 44px, font-weight: 700
- H2: 24px / 32px, font-weight: 600
- H3: 20px / 28px, font-weight: 600
- Body Large: 18px / 28px, font-weight: 400
- Body: 16px / 24px, font-weight: 400
- Body Small: 14px / 20px, font-weight: 400
- Caption: 12px / 16px, font-weight: 400

#### Spacing System

8px base unit grid:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

#### Border Radius

- sm: 8px (small elements, badges)
- md: 12px (buttons, inputs)
- lg: 16px (cards, modals)
- xl: 24px (large containers)
- full: 9999px (pills, avatars)

#### Shadows

```css
/* Subtle elevation */
shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Card elevation */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Hover elevation */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Modal elevation */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

#### Animation & Transitions

**Timing Functions:**
- Ease Out: `cubic-bezier(0, 0, 0.2, 1)` - for entrances
- Ease In: `cubic-bezier(0.4, 0, 1, 1)` - for exits
- Ease In Out: `cubic-bezier(0.4, 0, 0.2, 1)` - for state changes

**Durations:**
- Fast: 150ms (hover states, small changes)
- Normal: 250ms (most transitions)
- Slow: 350ms (page transitions, modals)

## Components and Interfaces

### 1. Layout Structure

#### App Shell

```
┌─────────────────────────────────────────┐
│  Header (fixed, 64px height)           │
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                      │
│  (max-width: 1200px, centered)         │
│  (padding: 32px)                        │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Header Component (ElevenLabs Ultra-Minimal):**
- **NO fixed positioning** - flows naturally with content
- **NO shadow** - completely flat, clean design
- White background blends seamlessly with page
- Logo on the left (24px font, bold, black, clickable)
- Minimal or NO navigation links in header
- Auto height based on content (~60px)
- Horizontal padding: 24px (mobile) → 32px (desktop)
- Vertical padding: 16px → 20px

**Main Container:**
- Max-width: 700px (narrower for better focus)
- Centered with auto margins
- Massive vertical padding: 120px+ top, 80px+ bottom (desktop)
- Mobile padding: 60px top, 40px bottom
- Minimal horizontal padding: 24px (mobile) → 32px (desktop)
- Content should breathe with generous whitespace

### 2. Home Page (True ElevenLabs Style)

**Hero Section:**
- **CENTERED layout** with massive whitespace (not left-aligned)
- **Ultra-prominent heading** (H1): "VocabGo" (56-64px on desktop, bold, black, centered)
- **Generous spacing**: 32px+ below heading
- **Subtitle** (18-20px, gray #6B7280, centered, max-width 500px): "Generate bilingual wordlists from your documents"
- **Massive spacing**: 48-64px between subtitle and button
- **Single primary black pill button**: "Generate Wordlist" (centered, large: 52-56px height)
- **Vertical spacing**: 120px+ top padding, 80px+ bottom padding on desktop
- **Clean white background** with no distractions
- **Minimal decoration** - focus entirely on the core message and action

**Visual Hierarchy:**
```
┌─────────────────────────────────────────┐
│                                         │
│              [120px+ space]             │
│                                         │
│              VocabGo                    │
│                                         │
│         [32px+ space]                   │
│                                         │
│    Generate bilingual wordlists from   │
│         your documents                  │
│                                         │
│         [48-64px space]                 │
│                                         │
│      ┌──────────────────────┐          │
│      │  Generate Wordlist   │          │
│      └──────────────────────┘          │
│                                         │
│         [80px+ space]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Key ElevenLabs Characteristics:**
- **Centered alignment** - all content centered horizontally
- **Massive whitespace** - generous vertical spacing throughout
- **Single focal point** - one clear call-to-action
- **No clutter** - no secondary links or navigation in hero
- **Large typography** - prominent, bold headings
- **Minimal header** - clean, unobtrusive navigation
- **Black button** - primary CTA in black pill shape
- **Narrow content width** - max-width 700px for readability

### 3. Upload Page (ElevenLabs Style)

**Page Layout:**
- Centered content, max-width: 700px
- Ultra-clean, focused design
- Generous whitespace (64px+ margins)

**Header Section:**
- Small label: "UPLOAD DOCUMENT" (uppercase, 12px, gray, letter-spacing)
- H1: "Upload Document" (36px, bold, black)
- Subtitle: "Extract vocabulary from your reading materials" (18px, gray)
- Margin bottom: 48px

**Drop Zone (Text Area Style):**
- Large, prominent area (min-height: 280px)
- Border: 1px solid #E5E7EB (subtle, not dashed)
- Border-radius: 12px
- Background: #FAFAFA (light gray, like ElevenLabs text inputs)
- Padding: 32px
- Centered content
- Clean, minimal aesthetic

**Drop Zone States:**
- Default: Subtle border, light background
- Hover: Border color darkens slightly to #D1D5DB
- Active (dragging): Border becomes #000000, no dramatic effects
- Error: Border #EF4444, very subtle red tint
- Disabled: Reduced opacity (0.5), cursor not-allowed

**Drop Zone Content:**
- Upload icon (40px, medium gray, simple line icon)
- Primary text: "Click to upload or drag and drop"
  - "Click to upload" in black, medium weight (not blue)
- Secondary text: "Supported formats: PDF, TXT, DOCX, XLSX" (14px, gray)
- Tertiary text: "Maximum file size: 50MB" (13px, light gray)
- All text centered, generous line-height

**Selected File Display:**
- Replaces upload instructions
- File name (16px, medium weight, black)
- File size (14px, gray)
- Small file icon (20px)
- Clean, minimal presentation

**Upload Button (Black Pill):**
- Full width
- Height: 48px
- Border-radius: 9999px (full pill)
- Background: #000000 (black, not blue)
- Color: white
- Font-weight: 600
- Font-size: 15px
- Margin-top: 24px
- Hover: #1A1A1A (subtle lighten)
- Disabled: #9CA3AF, reduced opacity
- No shadow, flat design

**Processing State:**
- Small spinner inside button
- Button text: "Processing..."
- No background color change
- Clean, minimal feedback

**Format Info Section:**
- Margin-top: 64px
- Border-top: 1px solid #F3F4F6 (very subtle)
- Padding-top: 32px
- Grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)
- Each format badge:
  - Background: #F9FAFB
  - Border: 1px solid #E5E7EB
  - Border-radius: 8px
  - Padding: 12px 16px
  - Format name: uppercase, bold, 11px
  - Description: 12px, gray

### 4. Results Page (ElevenLabs Style)

**Page Layout:**
- Max-width: 900px
- Centered
- Generous padding (48px)

**Header Section:**
- Small label: "WORDLIST RESULT" (uppercase, 11px, gray, letter-spacing)
- H1: "Wordlist Result" (32px, bold, black)
- Metadata row:
  - Filename (15px, medium weight, black)
  - Word count badge (black background, white text, rounded pill, 12px)
- Margin-bottom: 40px

**Wordlist Table (Ultra-Clean):**
- Clean, minimal design
- White background
- Border-radius: 12px
- Border: 1px solid #F3F4F6 (very subtle)
- No box-shadow (flat design)
- No outer heavy borders

**Table Structure:**
- Header row: White background (not gray), bottom border only
- Column headers: 
  - Uppercase, 11px, medium gray (#6B7280)
  - Letter-spacing: 0.05em
  - Font-weight: 600
  - Padding: 16px 20px
- Rows: 
  - All white background (no alternating)
  - Subtle border between rows: 1px solid #F9FAFB
  - Row hover: Very subtle gray tint (#FAFAFA)
- Cell padding: 16px 20px
- Clean, spacious feel

**Typography in Table:**
- English: 15px, font-weight: 500, black (#000000)
- Mandarin: 15px, font-weight: 400, dark gray (#1A1A1A)
- Generous line-height (1.6)

**Action Buttons:**
- Horizontal layout, gap: 12px
- Margin-top: 32px

**Button Styles (ElevenLabs):**
- Save button: Black background (#000000), white text, pill shape
- Export button: White background, black text, black border, pill shape
- Height: 44px
- Padding: 0 24px
- Border-radius: 9999px (full pill)
- Font-weight: 600
- Font-size: 14px
- Icon + text layout (icon 16px)
- Hover: Subtle color shift (no lift effect)

**Empty State:**
- Centered content
- No background color (just white)
- Padding: 80px 32px
- Icon (32px, medium gray, simple line icon)
- Message: "No words found" (20px, medium weight)
- Helpful subtext (14px, gray)
- CTA button: "Upload Another Document" (black pill)

### 5. Saved Wordlists Page

**Page Layout:**
- Max-width: 1000px
- Centered

**Header:**
- H1: "Saved Wordlists"
- Optional filter/search bar (clean, minimal)

**Wordlist Grid:**
- Grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop
- Gap: 24px

**Wordlist Card:**
- White background
- Border-radius: 16px
- Box-shadow: subtle elevation
- Padding: 24px
- Hover: Lift effect (translateY(-2px)), stronger shadow
- Transition: 250ms ease-out

**Card Content:**
- Filename (H3, truncate if long)
- Metadata row:
  - Document type badge
  - Word count
  - Date (small, gray)
- Action buttons row:
  - View button (primary)
  - Export button (secondary)
  - Delete button (ghost, red on hover)

### 6. Component Library

#### Button Component

**Variants (ElevenLabs Style):**

1. **Primary (Black Pill):**
   - Background: #000000
   - Color: white
   - Border-radius: 9999px (full pill shape)
   - Padding: 12px 24px
   - Font-weight: 600
   - Hover: #1A1A1A (subtle lighten)
   - No shadow, clean and flat

2. **Secondary (White/Outlined):**
   - Background: #FFFFFF
   - Color: #000000
   - Border: 1px solid #E5E7EB
   - Border-radius: 9999px
   - Hover: #F9FAFB background

3. **Text Link:**
   - Background: transparent
   - Color: #000000 or #6B7280
   - No border
   - Hover: slight opacity change
   - Used for "Log in" style links

4. **Voice Preset Pills:**
   - Background: #F9FAFB
   - Border: 1px solid #E5E7EB
   - Border-radius: 9999px
   - Padding: 8px 16px
   - Contains: avatar icon + text
   - Hover: border color darkens

**Sizes:**
- Small: height 36px, padding 0 16px, font-size 14px
- Medium: height 44px, padding 0 24px, font-size 15px
- Large: height 48px, padding 0 28px, font-size 16px

**States:**
- Loading: Spinner inside button, button stays same size
- Disabled: Opacity 0.4, cursor not-allowed
- Focus: Subtle outline, no dramatic effects

#### Input Component

**Base Style:**
- Height: 44px
- Padding: 0 16px
- Border: 1px solid #D1D5DB
- Border-radius: 12px
- Font-size: 16px
- Background: white
- Transition: border-color 150ms

**States:**
- Focus: Border #3B82F6, outline none, subtle shadow
- Error: Border #EF4444, red text
- Disabled: Background #F9FAFB, opacity 0.6

**With Label:**
- Label above input
- Font-size: 14px
- Font-weight: 500
- Color: #374151
- Margin-bottom: 8px

#### Card Component

**Base Style:**
- Background: white
- Border-radius: 16px
- Padding: 24px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.1)

**Interactive Card:**
- Cursor: pointer
- Hover: translateY(-2px), stronger shadow
- Transition: 250ms ease-out

#### Toast/Notification Component

**Position:** Top-right, fixed
**Animation:** Slide in from right, fade in

**Variants:**
- Success: Green accent, checkmark icon
- Error: Red accent, X icon
- Info: Blue accent, info icon
- Warning: Amber accent, warning icon

**Structure:**
- Icon on left
- Message text (medium weight)
- Close button on right
- Auto-dismiss after 5 seconds
- Progress bar at bottom

#### Modal Component

**Overlay:**
- Background: rgba(0, 0, 0, 0.5)
- Backdrop blur: 4px
- Animation: Fade in 250ms

**Modal Container:**
- Max-width: 500px
- Background: white
- Border-radius: 16px
- Padding: 32px
- Box-shadow: xl
- Animation: Scale up + fade in 250ms

**Modal Header:**
- H2 title
- Close button (top-right, ghost style)
- Margin-bottom: 24px

**Modal Footer:**
- Button group (right-aligned)
- Gap: 12px
- Margin-top: 24px

## Data Models

No changes to existing data models. The redesign is purely visual/UI focused.

## Error Handling

### Visual Error States

**Form Validation:**
- Red border on invalid inputs
- Error message below input (red text, 14px)
- Icon indicator (X in red)

**Upload Errors:**
- Error banner above drop zone
- Red background tint
- Clear error message
- Retry button

**Network Errors:**
- Toast notification (error variant)
- Retry action available
- Graceful degradation

### Empty States

**No Saved Wordlists:**
- Centered illustration/icon
- Friendly message: "No saved wordlists yet"
- Call-to-action: "Generate your first wordlist"
- Button to upload page

**No Results:**
- Centered content
- Message: "No words found in this document"
- Explanation text
- Button to try another document

## Testing Strategy

### Visual Regression Testing

1. **Component Screenshots:**
   - Capture all component states
   - Compare against baseline
   - Test across breakpoints

2. **Page Screenshots:**
   - Full page captures
   - Test all user flows
   - Mobile and desktop views

### Interaction Testing

1. **Animation Performance:**
   - Verify 60fps animations
   - Test on lower-end devices
   - Measure paint times

2. **Accessibility:**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast ratios (WCAG AA)
   - Focus indicators

3. **Responsive Behavior:**
   - Test breakpoints: 320px, 768px, 1024px, 1440px
   - Touch targets (minimum 44x44px)
   - Readable text sizes

### Browser Testing

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
mobile: 0-767px
tablet: 768px-1023px
desktop: 1024px+
wide: 1440px+
```

### Mobile Adaptations (< 768px)

**Layout:**
- Single column layouts
- Reduced padding (16px instead of 32px)
- Smaller font sizes (scale down 10-15%)
- Full-width buttons
- Stacked button groups

**Navigation:**
- Simplified header
- Hamburger menu if needed
- Bottom navigation bar (optional)

**Upload Page:**
- Smaller drop zone (min-height: 240px)
- Reduced padding in drop zone
- Format grid: 1 column

**Results Table:**
- Responsive table or card layout
- Stack columns vertically if needed
- Horizontal scroll with shadow indicators

### Tablet Adaptations (768px-1023px)

**Layout:**
- 2-column grids where applicable
- Medium padding (24px)
- Balanced spacing

**Wordlist Grid:**
- 2 columns

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: minimum 4.5:1
- Large text: minimum 3:1
- Interactive elements: minimum 3:1

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Skip links for main content

**Screen Readers:**
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Live regions for dynamic content

**Motion:**
- Respect prefers-reduced-motion
- Disable animations if requested
- Provide static alternatives

## Implementation Notes

### Tailwind Configuration

Update `tailwind.config.js` with custom design tokens:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          active: '#1D4ED8',
        },
        // ... other colors
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1)',
      },
    },
  },
}
```

### Vue Component Structure

**Composables:**
- `useAnimation.ts` - Animation utilities
- `useResponsive.ts` - Breakpoint detection
- `useTheme.ts` - Theme management (if dark mode added later)

**Component Organization:**
```
src/components/
├── ui/              # Base UI components
│   ├── Button.vue
│   ├── Input.vue
│   ├── Card.vue
│   ├── Modal.vue
│   └── Toast.vue
├── layout/          # Layout components
│   ├── Header.vue
│   ├── Container.vue
│   └── PageHeader.vue
└── features/        # Feature-specific components
    ├── UploadDropZone.vue
    ├── WordlistTable.vue
    └── WordlistCard.vue
```

### CSS Architecture

**Approach:** Utility-first with Tailwind, custom components for complex patterns

**Custom CSS:**
- Minimal custom CSS
- Use @apply for repeated patterns
- CSS variables for theme values
- Scoped styles in components

### Performance Considerations

1. **Image Optimization:**
   - Use SVG for icons
   - Lazy load images
   - Responsive images with srcset

2. **Animation Performance:**
   - Use transform and opacity for animations
   - Avoid animating layout properties
   - Use will-change sparingly

3. **Bundle Size:**
   - Tree-shake unused Tailwind classes
   - Code-split routes
   - Lazy load heavy components

## Migration Strategy

### Phase 1: Design System Setup
- Configure Tailwind with custom tokens
- Create base UI components
- Set up component library

### Phase 2: Layout & Navigation
- Implement new app shell
- Update header component
- Add responsive behavior

### Phase 3: Page-by-Page Migration
- Home page
- Upload page
- Results page
- Saved wordlists page

### Phase 4: Polish & Testing
- Animation refinement
- Accessibility audit
- Cross-browser testing
- Performance optimization

## Future Enhancements

### Dark Mode
- Add dark color palette
- Theme toggle component
- Respect system preference
- Persist user choice

### Advanced Animations
- Page transitions
- Micro-interactions
- Loading skeletons
- Success celebrations

### Additional Features
- Keyboard shortcuts
- Command palette
- Drag-to-reorder
- Bulk actions
