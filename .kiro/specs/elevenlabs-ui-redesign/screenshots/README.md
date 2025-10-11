# ElevenLabs Interface Screenshots

## Overview

This directory contains screenshots captured from ElevenLabs' actual interface during research. These screenshots serve as visual references for implementing the ElevenLabs-inspired design aesthetic in VocabGo.

## Screenshot Inventory

### 1. elevenlabs-upload-modal.png
**Location:** `/tmp/playwright-mcp-output/1760092557137/elevenlabs-upload-modal.png`

**Page:** Speech-to-Text Upload Modal  
**URL:** https://elevenlabs.io/app/speech-to-text

**Key Features Captured:**
- Large centered modal with clean white background
- Drag-and-drop upload zone with light gray background (#F8F9FA)
- Simple download icon in center
- Text hierarchy: "Click or drag files here to upload" / "Audio & video files, up to 1000MB"
- Radio button option cards (AI Transcript vs Human Transcript)
- Form controls: dropdown for "Primary language", toggles for options
- Disabled "Upload files" button styling

**Use Cases:**
- Upload page drop zone design
- Modal layout and styling
- Form control patterns
- Button disabled states

---

### 2. elevenlabs-music-page.png
**Location:** `/tmp/playwright-mcp-output/1760092557137/elevenlabs-music-page.png`

**Page:** Music Generation Interface  
**URL:** https://elevenlabs.io/app/music

**Key Features Captured:**
- Centered layout with "Begin your musical journey" heading
- Large text area with placeholder "Describe your song..."
- Light gray background for input area (#F8F9FA)
- Control row with buttons ("2", "Auto") and settings
- Credits display with progress bar
- Black "Generate" button (disabled state)
- Clean, minimal design with generous whitespace

**Use Cases:**
- Long text input styling
- Centered page layouts
- Control row patterns
- Credits/quota display design

---

### 3. elevenlabs-music-long-input.png
**Location:** `/tmp/playwright-mcp-output/1760092557137/elevenlabs-music-long-input.png`

**Page:** Music Generation with Long Text  
**URL:** https://elevenlabs.io/app/music

**Key Features Captured:**
- Same music page with 400+ character input
- Text area expanded vertically to show full content
- Maintains clean styling with longer text
- Demonstrates how ElevenLabs handles text overflow
- Good line-height and readability

**Use Cases:**
- Text area expansion behavior
- Long content handling
- Typography for extended text
- Responsive text input design

---

### 4. elevenlabs-text-to-speech.png
**Location:** `/tmp/playwright-mcp-output/1760092557137/elevenlabs-text-to-speech.png`

**Page:** Text-to-Speech Playground  
**URL:** https://elevenlabs.io/app/speech-synthesis/text-to-speech

**Key Features Captured:**
- Two-column layout: large text area on left, settings panel on right
- Suggestion pills below text area: "Get started with" + action buttons
- Settings panel with tabs (Settings/History)
- Voice selector dropdown with avatar and name "Rachel"
- Model selector: "Eleven Multilingual v2"
- Sliders for: Speed, Stability, Similarity, Style Exaggeration
- Toggle switch for "Speaker boost"
- "Reset values" link
- Colorful gradient promotional card for "Try Studio 3.0"

**Use Cases:**
- Two-column layout patterns
- Settings panel design
- Suggestion pills/chips
- Slider controls
- Toggle switches
- Promotional cards

---

### 5. elevenlabs-studio.png
**Location:** `/tmp/playwright-mcp-output/1760092557137/elevenlabs-studio.png`

**Page:** Studio Dashboard  
**URL:** https://elevenlabs.io/app/studio

**Key Features Captured:**
- Page header with "Studio" title
- Action buttons: "Upload" (outlined) and "New blank project" (black)
- Two sections: "Audio" and "Video"
- Feature cards in grid layout:
  - Audio: 2x2 grid (4 cards)
  - Video: 2x3 grid (6 cards)
- Each card has:
  - Colorful circular icon (blue, purple, orange, pink)
  - Bold title
  - Descriptive subtitle in gray
- "Recent Projects" section with search bar
- Table with columns: Title, Created at, Actions

**Use Cases:**
- Dashboard layout
- Feature card grid design
- Colorful gradient icons
- Section organization
- Search bar styling
- Table design

---

### 6. elevenlabs-voice-library.png
**Location:** `/tmp/playwright-mcp-output/1760092557137/elevenlabs-voice-library.png`

**Page:** Voice Library  
**URL:** https://elevenlabs.io/app/voice-library

**Key Features Captured:**
- Navigation tabs: Explore, My Voices, Default Voices, Collections
- Large search bar with placeholder "Search library voices..."
- "Search with audio sample" button with microphone icon
- "Trending" dropdown filter
- "Filters" button
- "Create or Clone a Voice" prominent button (blue background)
- "Trending voices" section with 3-column card grid
- Voice cards showing:
  - Avatar/profile image
  - Name and category
  - Language badges (e.g., "English +9")
- "Handpicked for your use case" horizontal scroll section
- Large promotional cards with images
- "Weekly Spotlight" section with detailed voice cards

**Use Cases:**
- Search and filter bar design
- Navigation tabs
- Card grid layouts (3-column)
- Avatar/profile styling
- Badge design
- Horizontal scroll sections
- Promotional card design

---

## Screenshot Locations

All screenshots are currently stored in the temporary Playwright output directory:
```
/tmp/playwright-mcp-output/1760092557137/
```

**Note:** These screenshots should be copied to a permanent location for long-term reference:
```bash
# Recommended permanent location
mkdir -p .kiro/specs/elevenlabs-ui-redesign/screenshots
cp /tmp/playwright-mcp-output/1760092557137/*.png .kiro/specs/elevenlabs-ui-redesign/screenshots/
```

## Usage Guidelines

### For Designers
- Use these screenshots as visual references when creating mockups
- Pay attention to spacing, typography, and color choices
- Note the subtle details like shadows, borders, and hover states

### For Developers
- Reference these when implementing UI components
- Match the exact styling details (colors, spacing, border-radius)
- Use the Beautification Guide alongside these screenshots

### For QA/Testing
- Compare implemented features against these screenshots
- Verify that the aesthetic matches ElevenLabs' design
- Check for consistency across different pages

## Key Design Patterns Observed

### Color Palette
- **Backgrounds:** Pure white (#FFFFFF) for main areas
- **Input backgrounds:** Light gray (#F8F9FA, #F9FAFB)
- **Borders:** Subtle gray (#E5E7EB, #F3F4F6)
- **Text primary:** Black (#000000)
- **Text secondary:** Medium gray (#6B7280)
- **Text tertiary:** Light gray (#9CA3AF)

### Typography
- **Font:** Clean sans-serif (system fonts)
- **Headings:** Bold (600-700), tight letter-spacing (-0.02em)
- **Body:** Regular (400), generous line-height (1.6)
- **Sizes:** 13-20px range, responsive scaling

### Spacing
- **Generous whitespace:** 32px+, 48px+, 64px+ between sections
- **Consistent padding:** 16px, 20px, 24px, 32px
- **8px grid system:** All spacing in multiples of 8

### Interactive Elements
- **Buttons:** Pill-shaped (border-radius: 9999px), 48-56px height
- **Hover effects:** Subtle lift (translateY(-2px)), shadow increase
- **Transitions:** Fast and smooth (150ms ease-out)
- **Focus states:** Black border, no dramatic effects

### Components
- **Cards:** White background, subtle shadow, 12-16px border-radius
- **Inputs:** Light gray background, 12px border-radius, 48px height
- **Badges:** Pill-shaped, light background, 13px font
- **Icons:** Colorful gradients, 48px size, circular or rounded

## Maintenance

This directory should be updated whenever:
- New ElevenLabs interface screenshots are captured
- Design patterns change or evolve
- Additional pages are researched
- Screenshots need to be refreshed

## Related Documents

- **Beautification Guide:** `.kiro/specs/elevenlabs-ui-redesign/BEAUTIFICATION_GUIDE.md`
- **Design Document:** `.kiro/specs/elevenlabs-ui-redesign/design.md`
- **Tasks:** `.kiro/specs/elevenlabs-ui-redesign/tasks.md`
- **Requirements:** `.kiro/specs/elevenlabs-ui-redesign/requirements.md`

## Copyright Notice

These screenshots are used for research and design reference purposes only. All rights to the ElevenLabs interface design belong to ElevenLabs. These materials are not for redistribution or commercial use.
