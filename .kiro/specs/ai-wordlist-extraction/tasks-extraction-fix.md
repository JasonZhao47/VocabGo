# Implementation Plan - AI Wordlist Extraction Fix

- [x] 1. Enhance word parsing logic in ExtractorAgent
  - Implement flexible line cleaning (remove numbering, bullets, punctuation)
  - Add fallback regex extraction for when primary parsing fails
  - Improve word validation to handle mixed case and formatting
  - Add comprehensive logging at each parsing step
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Optimize LLM prompt construction
  - Simplify prompt to concise format with clear examples
  - Remove verbose instructions and redundant explanations
  - Add explicit output format examples in prompt
  - Reduce prompt character count by ~60%
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implement intelligent text sampling
  - Create sampleText() method to extract from beginning, middle, and end
  - Apply 40-30-30 distribution for text chunks
  - Add logging when sampling is applied
  - Limit sampled text to 20,000 characters maximum
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Add dynamic token calculation
  - Implement calculateMaxTokens() method based on word count
  - Use formula: min(wordCount * 2 + 50, 500)
  - Apply dynamic token limit to LLM calls
  - Log token usage for monitoring
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 5. Enhance debugging and logging
  - Log raw LLM response preview (first 500 chars)
  - Log line count before and after filtering
  - Log when fallback extraction is triggered
  - Log final extracted word samples
  - Add token usage and latency logging
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.5, 6.3, 6.4_

- [ ]* 6. Write unit tests for parsing logic
  - Test clean line-by-line format extraction
  - Test numbered list format handling
  - Test bulleted list format handling
  - Test mixed case word normalization
  - Test fallback regex extraction
  - Test stop word filtering
  - Test duplicate removal
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3_

- [ ]* 7. Write integration tests
  - Test with real documents containing English vocabulary
  - Verify extraction success rate > 95%
  - Measure token usage < 15,000 per request
  - Confirm response time < 10 seconds
  - Test text sampling with large documents
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_
