# Implementation Plan

- [x] 1. Create HTML generation service and core infrastructure
  - Create `src/services/practiceHtmlGenerator.ts` with main generation class
  - Implement HTML template structure with proper DOCTYPE and meta tags
  - Add TypeScript interfaces for generation options and output
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement ElevenLabs CSS design system
  - Create CSS custom properties for colors, spacing, typography, and transitions
  - Implement base styles for body, container, and layout components
  - Add responsive breakpoints and mobile-first media queries
  - Create button styles (primary, secondary, navigation) with pill shapes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 3. Build matching question interface and styling
  - Create CSS for two-column matching layout with clean cards
  - Implement hover, selected, correct, and incorrect states
  - Add mobile responsive stacking for single-column layout
  - Style SVG connection lines with smooth drawing animations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.2, 10.3_

- [x] 4. Build fill-in-the-blank question interface and styling
  - Create CSS for sentence display and input field styling
  - Implement ElevenLabs-style input with light gray background and focus states
  - Add correct/incorrect feedback styling with color transitions
  - Style feedback text display below input field
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Build multiple choice question interface and styling
  - Create CSS for practice sentence and option cards layout
  - Implement hover, selected, correct, and incorrect states for options
  - Add responsive full-width cards for mobile devices
  - Style option cards with consistent spacing and typography
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Implement progress tracking and navigation controls
  - Create CSS for progress indicator text and progress bar
  - Style navigation buttons with proper disabled and hover states
  - Implement responsive navigation (stacked on mobile)
  - Add progress bar animation with smooth width transitions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 7. Build results view interface and styling
  - Create CSS for centered results layout with score display
  - Style results breakdown card with clean borders and padding
  - Implement high score styling with green color accent
  - Add results statistics grid with responsive columns
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 8. Implement core JavaScript application logic
  - Create main PracticeApp class with question navigation
  - Implement session state management (answers, progress, scoring)
  - Add question rendering methods for all three question types
  - Create utility methods for progress updates and score calculation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 9. Build matching question JavaScript functionality
  - Implement click-to-connect logic with selection state management
  - Create SVG line drawing functionality with smooth animations
  - Add connection validation and visual feedback (correct/incorrect)
  - Implement answer checking and scoring for matching pairs
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 10. Build fill-in-the-blank JavaScript functionality
  - Implement input validation with fuzzy matching for acceptable variations
  - Add real-time feedback on answer submission
  - Create answer checking logic with correct/incorrect styling
  - Handle input focus and submission (Enter key support)
  - _Requirements: 4.3, 4.5, 4.6, 4.7_

- [x] 11. Build multiple choice JavaScript functionality
  - Implement option selection with single-choice logic
  - Add immediate feedback on selection with visual state changes
  - Create answer validation and correct answer highlighting
  - Handle option clicking and keyboard navigation
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 12. Implement CSS animations and transitions
  - Add fade-in animations for question transitions (250ms ease-out)
  - Implement button hover effects and color transitions (150ms)
  - Create smooth progress bar width animations (300ms)
  - Add SVG stroke animation for matching question connection lines
  - Implement reduced motion support with @media (prefers-reduced-motion: reduce)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 13. Add download integration to existing results view
  - Update `src/components/practice/ResultsView.vue` to include download button
  - Implement download functionality using Blob API and URL.createObjectURL
  - Add proper filename generation with wordlist name and timestamp
  - Create download button styling consistent with existing design
  - _Requirements: 1.1, 1.5, 1.6_

- [x] 14. Implement HTML template generation
  - Create complete HTML document template with proper structure
  - Embed all CSS styles inline within <style> tags
  - Embed all JavaScript code inline within <script> tags
  - Add proper meta tags for viewport and character encoding
  - Include wordlist name in title and header
  - _Requirements: 1.3, 1.4, 2.1, 2.7_

- [x] 15. Add error handling and browser compatibility
  - Implement global JavaScript error handler with user-friendly messages
  - Add browser feature detection for SVG and CSS Grid support
  - Create fallback styles for older browsers
  - Add graceful degradation for missing JavaScript features
  - _Requirements: 12.7_

- [x] 16. Optimize performance and file size
  - Minify CSS and JavaScript code in generated HTML
  - Remove unused styles and optimize CSS custom properties
  - Implement efficient DOM update patterns with requestAnimationFrame
  - Add memory management for event listeners and references
  - Ensure target file size remains under 500KB
  - _Requirements: 1.7_

- [x] 17. Test cross-browser compatibility and responsiveness
  - Test generated HTML files in Chrome, Firefox, Safari, and Edge
  - Verify responsive design on mobile devices (iOS Safari, Chrome Mobile)
  - Test all question types and interactions across browsers
  - Validate HTML structure and CSS compatibility
  - Check animation performance and smooth transitions

- [ ] 18. Implement accessibility features and validation
  - Add proper ARIA labels and semantic HTML structure
  - Ensure keyboard navigation works for all interactive elements
  - Verify color contrast ratios meet WCAG AA standards
  - Test screen reader compatibility with question content
  - Add focus indicators for all interactive elements

- [-] 19. Add comprehensive testing suite
  - Create unit tests for HTML generation service
  - Test CSS generation and inline embedding
  - Validate JavaScript functionality in generated HTML
  - Test download mechanism and file generation
  - Verify question data embedding and parsing

- [x] 20. Final integration and polish
  - Integrate HTML generator with existing practice question generation flow
  - Add success messaging and user feedback for download completion
  - Implement final UI polish and animation refinements
  - Create user documentation for the download feature
  - Perform end-to-end testing of complete workflow