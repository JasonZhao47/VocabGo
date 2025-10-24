# Typography Improvements - ElevenLabs Inspired

## Overview
Applied typography improvements to HomePage, UploadPage, and SavedWordlistsPage based on ElevenLabs Audio Native design patterns.

## Key Changes

### Font Sizing & Hierarchy
- **Body text**: 15px (was 16px) - matches ElevenLabs standard
- **H1 headings**: 32px with font-weight: 600
- **H2 headings**: 24px with font-weight: 600  
- **H3 headings**: 18px with font-weight: 600
- **Subtitle text**: 16px with line-height: 1.6

### Letter Spacing
- **Headings**: -0.02em (tighter, more modern)
- **Body text**: -0.005em (subtle tightening)
- **Buttons**: -0.01em
- **Uppercase labels**: 0.08em (wider for readability)

### Line Height
- **Body text**: 1.6 (generous, readable)
- **Headings**: 1.2 (tighter, more impactful)
- **Descriptions**: 1.5-1.6 (comfortable reading)

### Font Weights
- **Headings**: 600 (semibold, not bold)
- **Body text**: 400 (regular)
- **Buttons**: 600 (semibold)
- **Labels**: 600 (semibold)

## Page-Specific Changes

### HomePage
- Main heading: 56px → cleaner, less overwhelming
- Subtitle: 16px with improved line-height (1.6)
- Better max-width (600px) for readability

### UploadPage
- Removed uppercase eyebrow label
- Main heading: 32px (was 40px)
- Resource card titles: 16px with letter-spacing
- Resource descriptions: 14px with improved spacing
- Upload instructions: 17px for primary text
- Error messages: 15px with line-height 1.5

### SavedWordlistsPage
- Page title: 28-32px with letter-spacing -0.02em
- Search input: 15px with letter-spacing
- Table cells: 15px with line-height 1.5
- Empty state: Improved hierarchy and spacing
- Modal text: 18px heading, 15px body with proper spacing

### Global CSS
- Base font-size: 15px (was 16px)
- Added default letter-spacing: -0.005em
- Improved heading defaults with letter-spacing
- Better line-height defaults

## Design Principles Applied

1. **Tighter letter-spacing** for modern, clean look
2. **Generous line-height** for readability
3. **Consistent font-weight** (600 for emphasis, 400 for body)
4. **Proper hierarchy** through size and weight, not just size
5. **Subtle refinements** that add up to professional polish

## Result
The typography now feels more refined, professional, and aligned with modern SaaS design standards like ElevenLabs, Stripe, and Linear.
