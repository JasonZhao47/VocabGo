# ElevenLabs Design Reference - 1:1 Replication Guide

This document provides exact specifications for replicating the ElevenLabs UI design, based on analysis of their Speech-to-Text and Sound Effects pages.

## Screenshots Captured
- `screenshots/speech-to-text-empty.png` - Empty state view
- `screenshots/sound-effects-full.png` - Full page with content
- `screenshots/sound-effects-prompt-area.png` - Bottom prompt/input area

---

## 1. LAYOUT STRUCTURE

### Page Layout
```
┌─────────────────────────────────────────────────────┐
│ Header (Fixed Top)                                   │
│ [Sidebar Toggle] [Page Title] [Explore] [User Menu] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Main Content Area                                    │
│ - Search bar (if applicable)                         │
│ - Content cards/list                                 │
│ - Empty state (centered)                             │
│                                                      │
│                                                      │
├─────────────────────────────────────────────────────┤
│ Footer Action Bar (Fixed Bottom)                     │
│ [Primary CTA Button - Full Width]                   │
└─────────────────────────────────────────────────────┘
```

### Spacing & Dimensions
- **Page padding**: 16px on mobile, 24px on desktop
- **Header height**: ~64px
- **Footer height**: ~72px (with padding)
- **Content max-width**: ~1200px centered
- **Card spacing**: 16px gap between items

---

## 2. HEADER DESIGN

### Structure
```html
<header class="fixed top-0 w-full bg-white border-b border-gray-200">
  <div class="flex items-center justify-between px-4 h-16">
    <!-- Left Section -->
    <div class="flex items-center gap-3">
      <button><!-- Sidebar Toggle Icon --></button>
      <h3>Page Title</h3>
      <button>Explore ▼</button> <!-- Optional -->
    </div>
    
    <!-- Right Section -->
    <div class="flex items-center gap-3">
      <button><!-- Notification Bell --></button>
      <button><!-- User Avatar --></button>
    </div>
  </div>
</header>
```

### Specifications
- **Background**: Pure white `#FFFFFF`
- **Border**: Bottom border `1px solid #E5E7EB` (gray-200)
- **Height**: 64px
- **Title font**: 18px, font-weight: 600, color: #111827 (gray-900)
- **Icons**: 20px × 20px, color: #6B7280 (gray-500)
- **Icon buttons**: 40px × 40px, rounded-full on hover
- **Hover state**: Background `#F3F4F6` (gray-100)

---

## 3. SEARCH BAR (Speech-to-Text Style)

### Design
```html
<input 
  type="text" 
  placeholder="Search transcripts..."
  class="search-input"
/>
```

### Specifications
- **Width**: Full width with max-width constraint
- **Height**: 44px
- **Padding**: 12px 16px
- **Border**: 1px solid #E5E7EB (gray-200)
- **Border-radius**: 8px
- **Background**: White #FFFFFF
- **Placeholder color**: #9CA3AF (gray-400)
- **Font-size**: 14px
- **Focus state**: 
  - Border: 2px solid #3B82F6 (blue-500)
  - Box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

---

## 4. EMPTY STATE (Speech-to-Text Style)

### Structure
```html
<div class="empty-state">
  <div class="icon-container">
    <svg><!-- Icon --></svg>
  </div>
  <h4>No transcribed files</h4>
  <p>Try uploading a file for transcription.</p>
  <button class="primary-button">
    <svg><!-- Icon --></svg>
    Transcribe files
  </button>
</div>
```

### Specifications
- **Container**: Centered, max-width: 400px
- **Background**: Light gray card `#F9FAFB` (gray-50)
- **Border**: 1px solid #E5E7EB (gray-200)
- **Border-radius**: 12px
- **Padding**: 48px 32px
- **Icon container**: 
  - Size: 64px × 64px
  - Background: White
  - Border: 1px solid #E5E7EB
  - Border-radius: 12px
  - Icon size: 32px, color: #6B7280 (gray-500)
- **Heading (h4)**:
  - Font-size: 18px
  - Font-weight: 600
  - Color: #111827 (gray-900)
  - Margin-top: 16px
- **Description (p)**:
  - Font-size: 14px
  - Color: #6B7280 (gray-500)
  - Margin-top: 8px
- **Button**: See Primary Button specs below

---

## 5. PRIMARY BUTTON (Black CTA)

### Specifications
```css
.primary-button {
  background: #000000;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.primary-button:hover {
  background: #1F2937; /* gray-800 */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.primary-button:active {
  transform: translateY(0);
}
```

### Icon in Button
- **Size**: 16px × 16px
- **Color**: White
- **Position**: Left of text with 8px gap

---

## 6. FIXED FOOTER CTA (Bottom Action Bar)

### Structure
```html
<footer class="fixed bottom-0 w-full bg-white border-t">
  <div class="container px-4 py-4">
    <button class="w-full primary-button-large">
      <svg><!-- Icon --></svg>
      Transcribe files
    </button>
  </div>
</footer>
```

### Specifications
- **Background**: White #FFFFFF
- **Border-top**: 1px solid #E5E7EB (gray-200)
- **Padding**: 16px
- **Button**:
  - Width: 100%
  - Height: 48px
  - Background: #000000
  - Border-radius: 8px
  - Font-size: 15px
  - Font-weight: 500
  - Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

---

## 7. SOUND EFFECTS PROMPT AREA (Bottom Input)

### Structure
```html
<div class="prompt-container">
  <div class="prompt-input-wrapper">
    <textarea 
      placeholder="Describe a sound..."
      class="prompt-textarea"
    ></textarea>
    
    <div class="prompt-controls">
      <!-- Left: Duration controls -->
      <div class="duration-controls">
        <button>∞ Off</button>
        <button>⏱ Auto</button>
        <button>⏱ 30%</button>
      </div>
      
      <!-- Right: Character count & submit -->
      <div class="submit-area">
        <span class="char-count">200 / 30,154</span>
        <button class="submit-button">↑</button>
      </div>
    </div>
  </div>
  
  <p class="disclaimer">
    Generations may be shared to Explore page for other users to download.
    <button>Disable</button>
  </p>
</div>
```

### Specifications

#### Container
- **Position**: Fixed bottom or sticky
- **Background**: White #FFFFFF
- **Border-top**: 1px solid #E5E7EB
- **Padding**: 16px
- **Box-shadow**: 0 -2px 12px rgba(0, 0, 0, 0.05)

#### Textarea
- **Min-height**: 56px
- **Max-height**: 200px (scrollable)
- **Padding**: 16px
- **Border**: 1px solid #E5E7EB
- **Border-radius**: 12px
- **Font-size**: 14px
- **Line-height**: 1.5
- **Resize**: vertical
- **Focus state**: Border #3B82F6, box-shadow

#### Duration Control Buttons
- **Display**: Inline-flex
- **Padding**: 8px 12px
- **Border**: 1px solid #E5E7EB
- **Border-radius**: 6px
- **Font-size**: 13px
- **Gap**: 8px between buttons
- **Active state**: Background #F3F4F6, border #D1D5DB

#### Submit Button (Arrow Up)
- **Size**: 40px × 40px
- **Background**: #000000
- **Border-radius**: 50% (circle)
- **Icon**: White arrow up, 20px
- **Hover**: Background #1F2937, scale(1.05)
- **Disabled**: Background #E5E7EB, cursor not-allowed

#### Character Count
- **Font-size**: 12px
- **Color**: #6B7280 (gray-500)
- **Margin-right**: 12px

---

## 8. DATA TABLE/LIST (Sound Effects Style)

### Table Header
```css
.table-header {
  display: grid;
  grid-template-columns: 1fr 100px 100px 120px;
  padding: 12px 16px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Table Row
```css
.table-row {
  display: grid;
  grid-template-columns: 1fr 100px 100px 120px;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
  transition: background 0.15s;
}

.table-row:hover {
  background: #F9FAFB;
}
```

### Row Content Specifications
- **Play button**: 
  - Size: 40px × 40px
  - Background: #F3F4F6
  - Border-radius: 50%
  - Icon: 16px, color #111827
  - Hover: Background #E5E7EB
- **Description text**:
  - Font-size: 14px
  - Color: #111827
  - Line-height: 1.5
  - Max-lines: 2 (truncate with ellipsis)
- **Category tags**:
  - Display: inline-flex
  - Padding: 4px 8px
  - Background: #F3F4F6
  - Border-radius: 4px
  - Font-size: 12px
  - Color: #6B7280
  - Gap: 4px between tags
- **Duration/Downloads**:
  - Font-size: 14px
  - Color: #6B7280
  - Text-align: right
- **Action icons**:
  - Size: 32px × 32px
  - Color: #6B7280
  - Hover: Background #F3F4F6, color #111827

---

## 9. CATEGORY CARDS (Horizontal Scroll)

### Container
```css
.category-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 16px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.category-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
```

### Card Specifications
```css
.category-card {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: scale(1.05);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-card .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.category-card .label {
  color: white;
  font-size: 13px;
  font-weight: 500;
}
```

---

## 10. COLOR PALETTE

### Primary Colors
```css
--black: #000000;
--white: #FFFFFF;
```

### Gray Scale (Tailwind-based)
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Accent Colors
```css
--blue-500: #3B82F6; /* Focus states */
--blue-100: rgba(59, 130, 246, 0.1); /* Focus ring */
```

---

## 11. TYPOGRAPHY

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes
```css
--text-xs: 12px;    /* Labels, captions */
--text-sm: 13px;    /* Secondary text */
--text-base: 14px;  /* Body text */
--text-md: 15px;    /* Emphasized body */
--text-lg: 16px;    /* Subheadings */
--text-xl: 18px;    /* Headings */
--text-2xl: 20px;   /* Page titles */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## 12. SPACING SYSTEM (8px base)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## 13. BORDER RADIUS

```css
--radius-sm: 4px;   /* Tags, small elements */
--radius-md: 6px;   /* Buttons, inputs */
--radius-lg: 8px;   /* Cards, modals */
--radius-xl: 12px;  /* Large cards */
--radius-full: 9999px; /* Pills, circles */
```

---

## 14. SHADOWS

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.2);
```

---

## 15. TRANSITIONS

```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

### Common Transitions
```css
/* Hover effects */
transition: all 0.2s ease;

/* Transform only */
transition: transform 0.2s ease;

/* Background only */
transition: background-color 0.15s ease;
```

---

## 16. RESPONSIVE BREAKPOINTS

```css
/* Mobile first approach */
--mobile: 0px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

### Usage
```css
/* Mobile (default) */
.container {
  padding: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 17. ANIMATION PATTERNS

### Hover Lift
```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Button Press
```css
.button-press:active {
  transform: scale(0.98);
}
```

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}
```

---

## 18. ICON SPECIFICATIONS

### Sizes
- **Small**: 16px × 16px (inline with text)
- **Medium**: 20px × 20px (buttons, headers)
- **Large**: 24px × 24px (prominent actions)
- **XLarge**: 32px × 32px (empty states)

### Style
- **Stroke width**: 1.5px - 2px
- **Style**: Outline/line icons (not filled)
- **Color**: Inherit from parent or use gray-500

---

## 19. ACCESSIBILITY

### Focus States
```css
.focusable:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Or custom ring */
.focusable:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: #3B82F6;
}
```

### Minimum Touch Targets
- **Buttons**: Minimum 44px × 44px
- **Links**: Minimum 44px height with padding
- **Interactive elements**: Minimum 40px × 40px

### Color Contrast
- **Body text**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **UI components**: Minimum 3:1 ratio

---

## 20. KEY DESIGN PRINCIPLES

1. **Minimalism**: Clean, uncluttered interfaces with ample white space
2. **Consistency**: Uniform spacing, colors, and component styles
3. **Hierarchy**: Clear visual hierarchy using size, weight, and color
4. **Feedback**: Immediate visual feedback for all interactions
5. **Performance**: Smooth animations and transitions (60fps)
6. **Accessibility**: WCAG AA compliant, keyboard navigable
7. **Mobile-first**: Responsive design that works on all devices
8. **Dark on Light**: Black text/buttons on white backgrounds for primary actions

---

## IMPLEMENTATION CHECKLIST

### For Upload Page (VocabGo)
- [ ] Implement fixed header with sidebar toggle and title
- [ ] Add search bar (if needed for filtering)
- [ ] Create empty state card with icon, heading, description, and CTA
- [ ] Implement fixed footer with full-width black CTA button
- [ ] Add bottom prompt area with textarea and controls (like Sound Effects)
- [ ] Ensure proper spacing and padding throughout
- [ ] Add hover states and transitions to all interactive elements
- [ ] Test responsive behavior on mobile, tablet, and desktop
- [ ] Verify accessibility (keyboard navigation, focus states, ARIA labels)
- [ ] Optimize for performance (smooth animations, fast load times)

### Component Mapping
- **HomePage** → Speech-to-Text empty state style
- **UploadPage** → Sound Effects prompt area style
- **SavedWordlistsPage** → Sound Effects table/list style
- **All pages** → Consistent header and footer

---

## NOTES

- All measurements are in pixels unless otherwise specified
- Use CSS custom properties (variables) for maintainability
- Prefer flexbox and grid for layouts
- Use semantic HTML elements
- Implement proper loading states and error handling
- Test on multiple browsers and devices
- Optimize images and assets for web
- Use SVG icons for scalability
- Implement proper form validation and feedback
- Consider dark mode support for future enhancement
