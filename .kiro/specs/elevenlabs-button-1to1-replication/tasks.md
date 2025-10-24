# Implementation Plan

- [x] 1. Update Tailwind configuration for ElevenLabs button specifications
  - Add custom border radius value (8px for 'lg')
  - Add custom font size (13px)
  - Add custom line height (20px)
  - Add custom transition duration (75ms)
  - _Requirements: 1.1, 2.1, 2.3, 5.1_

- [x] 2. Create ElevenLabs design tokens file
  - Create `src/config/elevenlabsDesignTokens.ts` with button-specific tokens
  - Define border radius, typography, sizing, and transition values
  - Export TypeScript types for design tokens
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 5.1, 5.2_

- [x] 3. Update Button component styling
- [x] 3.1 Update border radius styling
  - Replace `rounded-full` with `rounded-lg` (8px)
  - Apply to all button variants and sizes
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3.2 Update typography styling
  - Set font size to `text-[13px]`
  - Set font weight to `font-medium` (500)
  - Set line height to `leading-[20px]`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.3 Update button sizing and spacing
  - Small: Update to `h-8 px-[10px]` (32px height, 10px padding)
  - Medium: Update to `h-9 px-3` (36px height, 12px padding)
  - Large: Update to `h-10 px-4` (40px height, 16px padding)
  - Remove vertical padding classes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.4 Update button color variants
  - Secondary: Add `border-[rgba(0,0,29,0.1)]` for subtle border
  - Update text color to `text-[rgb(15,15,16)]` for secondary and ghost
  - Maintain primary variant black background
  - Maintain ghost variant transparent background
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.5 Update button transitions
  - Change transition duration to `duration-75` (75ms)
  - Remove hover scale transforms (`hover:scale-[1.02]`, `active:scale-[0.98]`)
  - Keep opacity and color transitions
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Update Upload page button integration
  - Change "Upload and Process" button from `size="lg"` to `size="md"`
  - Change "Select File" button from `size="lg"` to `size="md"`
  - Verify all buttons use updated Button component styling
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Reposition upload button to match ElevenLabs layout
  - Move button from fixed footer into the upload dropzone area
  - Position button at the bottom of the dropzone content
  - Remove fixed footer styling
  - Update button to be part of the dropzone's flex layout
  - Maintain proper spacing and alignment within dropzone
  - Reference: elevenlabs-speech-to-text.png
  - _Requirements: 6.1, 6.2_

- [x] 6. Visual verification and testing
- [ ] 6.1 Create visual comparison test
  - Compare rendered buttons with ElevenLabs reference
  - Verify border radius, typography, sizing, and colors
  - Test all variants (primary, secondary, ghost, destructive)
  - Test all sizes (sm, md, lg)
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 6.2 Test button states
  - Verify hover states with correct transitions
  - Test active states
  - Test focus states for accessibility
  - Test loading states
  - Test disabled states
  - _Requirements: 5.1, 5.2, 5.3, 6.3_

- [ ]* 6.3 Cross-browser testing
  - Test in Chrome/Edge (latest)
  - Test in Firefox (latest)
  - Test in Safari (latest)
  - Test in mobile browsers (iOS Safari, Chrome Android)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ]* 6.4 Accessibility verification
  - Verify WCAG AA contrast ratios for all variants
  - Test keyboard navigation
  - Verify focus indicators are visible
  - Test with screen readers
  - _Requirements: 6.3_
