# Implementation Plan - Adjustable Word Count Feature

- [ ] 1. Implement word count slider UI component
  - Add slider control to UploadPage.vue with range 10-200
  - Display current word count value in real-time
  - Add tick marks at key intervals (10, 50, 100, 150, 200)
  - Style slider with custom CSS (thumb, track, focus states)
  - Add dynamic helper text based on word count value
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2. Implement localStorage persistence
  - Load saved word count preference on page mount
  - Save word count to localStorage on slider change
  - Validate saved values are within 10-200 range
  - Default to 40 when no preference exists or value is invalid
  - Handle localStorage unavailable gracefully
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Update frontend composable to pass word count
  - Modify useUpload composable to accept wordCount ref parameter
  - Pass wordCount value to uploadService.processDocument()
  - Ensure wordCount is included in API request options
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4. Update uploadService to include maxWords parameter
  - Add maxWords to ProcessDocumentOptions interface
  - Include maxWords in fetch request body
  - Ensure maxWords is sent as integer type
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5. Update backend to accept and validate maxWords
  - Add maxWords to ProcessDocumentRequest interface
  - Extract maxWords from request body
  - Validate and clamp maxWords to 10-200 range
  - Default to 40 for backward compatibility
  - Pass validated maxWords to ExtractorAgent
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Add user guidance system
  - Implement getGuidanceText() function with three tiers
  - Show "Focused vocabulary" for count < 30
  - Show "Balanced learning" for count 30-80
  - Show "Comprehensive coverage" for count > 80
  - Update guidance text reactively as slider moves
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Implement accessibility features
  - Add proper ARIA labels to slider
  - Ensure keyboard navigation works (arrow keys)
  - Add visible focus indicators
  - Verify color contrast meets WCAG AA standards
  - Test with screen readers
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 8. Write unit tests for slider component
  - Test loading saved preference from localStorage
  - Test defaulting to 40 when no preference exists
  - Test clamping invalid values to valid range
  - Test saving to localStorage on change
  - Test guidance text updates at thresholds
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4_

- [ ]* 9. Write integration tests
  - Test slider interaction updates localStorage
  - Verify backend receives maxWords parameter
  - Confirm extraction respects word count limit
  - Test preference persistence across page reloads
  - Test with various word count values (10, 40, 100, 200)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
