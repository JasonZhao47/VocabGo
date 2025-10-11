# VocabGo Beautification Guide - ElevenLabs Aesthetic

## Overview

This guide provides detailed beautification recommendations based on actual ElevenLabs interface screenshots captured during research. Use this as a reference for enhancing VocabGo's visual design to match ElevenLabs' premium aesthetic.

## Screenshot Reference

All screenshots are saved in: `.kiro/specs/elevenlabs-ui-redesign/screenshots/`

1. `elevenlabs-upload-modal.png` - Upload interface with drag-and-drop
2. `elevenlabs-music-page.png` - Music page with long text input
3. `elevenlabs-music-long-input.png` - Music page with expanded text area
4. `elevenlabs-text-to-speech.png` - Text-to-Speech interface with settings panel
5. `elevenlabs-studio.png` - Studio dashboard with feature cards
6. `elevenlabs-voice-library.png` - Voice library with card grid

## Key Visual Patterns from Screenshots

### 1. Upload Modal Design (Speech-to-Text)

**Observed Elements:**
- Large centered modal with clean white background
- Drag-and-drop zone with light gray background (#F8F9FA)
- Simple download icon in center (medium gray)
- Text hierarchy:
  - Primary: "Click or drag files here to upload" (black, medium weight)
  - Secondary: "Audio & video files, up to 1000MB" (gray, smaller)
- Radio button cards for options (AI Transcript vs Human Transcript)
- Clean form controls (dropdowns, toggles) with proper labels
- Disabled button state with subtle gray styling

**Apply to VocabGo:**
```vue
<!-- Upload Drop Zone -->
<div class="upload-zone">
  <div class="upload-icon">
    <!-- Simple download/upload icon -->
    <svg>...</svg>
  </div>
  <p class="upload-primary">Click or drag files here to upload</p>
  <p class="upload-secondary">PDF, TXT, DOCX, XLSX files, up to 50MB</p>
</div>

<style scoped>
.upload-zone {
  min-height: 280px;
  background: #F8F9FA; /* Light gray like ElevenLabs */
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  transition: all 150ms ease-out;
}

.upload-zone:hover {
  border-color: #D1D5DB;
  background: #F3F4F6;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #9CA3AF; /* Medium gray */
  margin-bottom: 16px;
}

.upload-primary {
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  margin: 0 0 8px 0;
}

.upload-secondary {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  margin: 0;
}
</style>
```

### 2. Long Text Input (Music Page)

**Observed Elements:**
- Large textarea with light gray background (#F8F9FA)
- Placeholder text: "Describe your song..."
- Expands vertically to accommodate longer text (tested with 400+ characters)
- Control row below with buttons and settings
- Credits display with progress bar
- Black "Generate" button (disabled state shown)

**Apply to VocabGo:**
```vue
<!-- Long Text Input for Future Features -->
<textarea 
  class="long-input"
  placeholder="Describe your requirements..."
  rows="6"
></textarea>

<style scoped>
.long-input {
  width: 100%;
  min-height: 160px;
  padding: 20px;
  background: #F8F9FA; /* Light gray background */
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  color: #000000;
  resize: vertical; /* Allow vertical expansion */
  transition: all 150ms ease-out;
}

.long-input:focus {
  outline: none;
  border-color: #000000;
  background: #FFFFFF;
}

.long-input::placeholder {
  color: #9CA3AF;
}
</style>
```

### 3. Text-to-Speech Interface (Two-Column Layout)

**Observed Elements:**
- Large text area on left with suggestion pills below
- Settings panel on right with tabs (Settings/History)
- Voice selector dropdown with avatar and name
- Model selector with description
- Sliders for various parameters (Speed, Stability, Similarity, Style Exaggeration)
- Toggle switches for options
- "Reset values" link in subtle gray
- Colorful gradient promotional card

**Apply to VocabGo:**
```vue
<!-- Two-Column Layout for Advanced Features -->
<div class="two-column-layout">
  <div class="main-content">
    <textarea class="main-input" placeholder="Enter your text..."></textarea>
    
    <!-- Suggestion Pills -->
    <div class="suggestions">
      <span class="suggestion-label">Get started with</span>
      <button class="suggestion-pill">Upload PDF</button>
      <button class="suggestion-pill">Upload DOCX</button>
      <button class="suggestion-pill">Upload TXT</button>
    </div>
  </div>
  
  <div class="settings-panel">
    <div class="tabs">
      <button class="tab active">Settings</button>
      <button class="tab">History</button>
    </div>
    
    <div class="settings-content">
      <!-- Settings controls -->
    </div>
  </div>
</div>

<style scoped>
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

@media (max-width: 1023px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

.main-input {
  width: 100%;
  min-height: 300px;
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
}

.suggestion-label {
  font-size: 14px;
  color: #6B7280;
  margin-right: 8px;
}

.suggestion-pill {
  padding: 8px 16px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.suggestion-pill:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.settings-panel {
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  padding: 24px;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 150ms ease-out;
}

.tab.active {
  color: #000000;
  border-bottom-color: #000000;
}
</style>
```

### 4. Studio Dashboard (Feature Cards Grid)

**Observed Elements:**
- Page header with title and action buttons
- Two sections: "Audio" and "Video"
- Feature cards in grid layout (2x2 for Audio, 2x3 for Video)
- Each card has:
  - Colorful circular icon (blue, purple, orange, pink, etc.)
  - Bold title
  - Descriptive subtitle in gray
  - Clean white background
  - Subtle hover effect
- "Recent Projects" section with search bar and table

**Apply to VocabGo:**
```vue
<!-- Feature Cards Grid -->
<div class="feature-section">
  <h2 class="section-title">Quick Actions</h2>
  
  <div class="feature-grid">
    <button class="feature-card">
      <div class="feature-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <svg>...</svg>
      </div>
      <div class="feature-content">
        <h3 class="feature-title">Upload Document</h3>
        <p class="feature-description">Extract vocabulary from your files</p>
      </div>
    </button>
    
    <button class="feature-card">
      <div class="feature-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <svg>...</svg>
      </div>
      <div class="feature-content">
        <h3 class="feature-title">View Wordlists</h3>
        <p class="feature-description">Browse your saved vocabulary</p>
      </div>
    </button>
    
    <!-- More cards... -->
  </div>
</div>

<style scoped>
.feature-section {
  margin: 48px 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 24px 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.feature-card:hover {
  border-color: #E5E7EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 4px 0;
}

.feature-description {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
}
</style>
```

### 5. Voice Library (Card Grid with Search)

**Observed Elements:**
- Navigation tabs at top (Explore, My Voices, Default Voices, Collections)
- Large search bar with icon
- Filter buttons (Trending dropdown, Filters button)
- Prominent "Create or Clone a Voice" button (blue background)
- Voice cards in 3-column grid
- Each card shows: avatar, name, category, language badges
- Horizontal scroll sections for curated collections
- Large promotional cards with images

**Apply to VocabGo:**
```vue
<!-- Search and Filter Bar -->
<div class="search-bar-container">
  <div class="search-bar">
    <svg class="search-icon">...</svg>
    <input 
      type="text" 
      placeholder="Search wordlists..."
      class="search-input"
    />
  </div>
  
  <button class="filter-button">
    <svg>...</svg>
    Filters
  </button>
  
  <button class="primary-action-button">
    <svg>...</svg>
    Create Wordlist
  </button>
</div>

<!-- Card Grid -->
<div class="card-grid">
  <div class="wordlist-card">
    <div class="card-header">
      <div class="card-avatar">
        <svg>...</svg>
      </div>
      <div class="card-info">
        <h3 class="card-title">Business English</h3>
        <p class="card-category">Professional</p>
      </div>
    </div>
    <div class="card-meta">
      <span class="card-badge">40 words</span>
      <span class="card-date">2 days ago</span>
    </div>
  </div>
  
  <!-- More cards... -->
</div>

<style scoped>
.search-bar-container {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  align-items: center;
}

.search-bar {
  flex: 1;
  position: relative;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9CA3AF;
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 48px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  color: #000000;
  transition: all 150ms ease-out;
}

.search-input:focus {
  outline: none;
  border-color: #000000;
  background: #FFFFFF;
}

.filter-button {
  height: 48px;
  padding: 0 20px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.filter-button:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
}

.primary-action-button {
  height: 48px;
  padding: 0 24px;
  background: #3B82F6; /* Blue accent for primary actions */
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.primary-action-button:hover {
  background: #2563EB;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.wordlist-card {
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.wordlist-card:hover {
  border-color: #E5E7EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-category {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  margin: 0;
}

.card-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.card-badge {
  padding: 4px 12px;
  background: #F3F4F6;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.card-date {
  font-size: 13px;
  color: #9CA3AF;
}
</style>
```

## Additional Beautification Recommendations

### 1. Color Gradients for Icons

ElevenLabs uses vibrant gradients for feature icons:

```css
/* Purple gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Pink gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Blue gradient */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Orange gradient */
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

/* Green gradient */
background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
```

### 2. Subtle Animations

```css
/* Smooth hover lift */
.interactive-element {
  transition: all 150ms ease-out;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Fade in animation */
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
  animation: fadeIn 250ms ease-out;
}
```

### 3. Typography Refinements

```css
/* Tight letter spacing for headings */
h1, h2, h3 {
  letter-spacing: -0.02em;
}

/* Generous line height for body text */
p {
  line-height: 1.6;
}

/* Subtle text colors */
.text-primary { color: #000000; }
.text-secondary { color: #6B7280; }
.text-tertiary { color: #9CA3AF; }
```

### 4. Form Control Styling

```css
/* Consistent form controls */
input, select, textarea {
  height: 48px;
  padding: 0 16px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  transition: all 150ms ease-out;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #000000;
  background: #FFFFFF;
}

/* Toggle switches */
.toggle {
  width: 44px;
  height: 24px;
  background: #E5E7EB;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background 150ms ease-out;
}

.toggle.active {
  background: #000000;
}

.toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 150ms ease-out;
}

.toggle.active::after {
  transform: translateX(20px);
}
```

### 5. Badge and Pill Styling

```css
/* Pill badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #F3F4F6;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* Black pill badge */
.badge-black {
  background: #000000;
  color: #FFFFFF;
}

/* Colored badges */
.badge-blue { background: #DBEAFE; color: #1E40AF; }
.badge-green { background: #D1FAE5; color: #065F46; }
.badge-red { background: #FEE2E2; color: #991B1B; }
```

## Implementation Priority

1. **High Priority** (Immediate visual impact):
   - Update upload drop zone with light gray background
   - Implement feature card grid for homepage
   - Add search bar with filters to wordlists page
   - Update button styling to match ElevenLabs exactly

2. **Medium Priority** (Enhanced functionality):
   - Add suggestion pills to upload page
   - Implement two-column layout for advanced features
   - Add colorful gradient icons
   - Enhance card hover effects

3. **Low Priority** (Polish):
   - Add subtle animations
   - Implement toggle switches
   - Add promotional cards
   - Create loading skeletons

## Testing Checklist

After applying beautifications:

- [ ] Upload zone has light gray background (#F8F9FA)
- [ ] Text inputs have proper focus states
- [ ] Buttons have smooth hover effects
- [ ] Cards have subtle lift on hover
- [ ] Search bar is prominent and functional
- [ ] Feature cards have colorful gradient icons
- [ ] Typography matches ElevenLabs (clean, readable)
- [ ] Spacing is generous and consistent
- [ ] Colors match the design system
- [ ] All interactions feel smooth (150ms transitions)

## Resources

- Screenshots: `.kiro/specs/elevenlabs-ui-redesign/screenshots/`
- Design tokens: `src/assets/design-system.md`
- Component library: `src/components/ui/`

## Notes

- Always prioritize clean, minimal design over decoration
- Use generous whitespace - don't be afraid of empty space
- Keep transitions subtle and fast (150ms)
- Maintain consistent spacing using 8px grid
- Test on multiple screen sizes
- Ensure accessibility (contrast, focus states, keyboard navigation)
