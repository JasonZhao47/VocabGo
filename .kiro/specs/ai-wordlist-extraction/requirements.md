# Requirements Document

## Introduction

The AI wordlist extraction system is failing to extract English words from documents that clearly contain English vocabulary. The system processes a 211,326 character document, truncates it to 100,000 characters, sends it to the GLM-4-Flash LLM, receives a response (454,892 tokens), but extracts 0 words. This indicates a critical failure in the word extraction pipeline that needs immediate diagnosis and repair.

## Glossary

- **Extractor Agent**: The AI agent responsible for identifying and extracting English vocabulary words from cleaned text
- **GLM-4-Flash**: The Large Language Model API used for text processing
- **LLM Response**: The text content returned by the GLM-4-Flash API
- **Word Parsing Logic**: The code that processes the LLM response to extract individual words
- **Stop Words**: Common English words that should be filtered out (e.g., "the", "and", "is")

## Requirements

### Requirement 1: Diagnose LLM Response Format Issue

**User Story:** As a developer, I want to understand why the LLM is returning content that doesn't match the expected format, so that I can fix the extraction logic.

#### Acceptance Criteria

1. WHEN the extractor agent receives an LLM response, THE System SHALL log the first 500 characters of the raw response content for debugging
2. WHEN the extractor agent parses the LLM response, THE System SHALL log the count of lines found before filtering
3. WHEN the extractor agent applies the regex filter `/^[a-z]+$/`, THE System SHALL log how many words were rejected by this filter
4. WHEN the extractor agent completes processing, THE System SHALL log the final word count and confidence score

### Requirement 2: Fix Word Extraction Logic

**User Story:** As a system, I want to correctly parse English words from the LLM response regardless of formatting variations, so that valid vocabulary is extracted.

#### Acceptance Criteria

1. WHEN the LLM response contains words with mixed case, THE Extractor Agent SHALL convert them to lowercase before validation
2. WHEN the LLM response contains numbered lists (e.g., "1. word"), THE Extractor Agent SHALL strip numbering and extract the word
3. WHEN the LLM response contains punctuation or special characters, THE Extractor Agent SHALL remove them and extract the alphabetic word
4. WHEN the LLM response contains explanations or definitions, THE Extractor Agent SHALL extract only the vocabulary word itself
5. WHEN the LLM response is empty or contains no valid words, THE Extractor Agent SHALL return an empty array with confidence 0.0

### Requirement 3: Improve LLM Prompt Clarity

**User Story:** As a system, I want the LLM to understand exactly what format to return words in, so that parsing is reliable and consistent.

#### Acceptance Criteria

1. WHEN the extractor agent constructs the system prompt, THE System SHALL include explicit examples of the expected output format
2. WHEN the extractor agent constructs the system prompt, THE System SHALL emphasize returning ONLY words without any numbering, bullets, or explanations
3. WHEN the extractor agent constructs the system prompt, THE System SHALL specify that words should be in lowercase
4. WHEN the extractor agent constructs the system prompt, THE System SHALL request one word per line with no additional formatting

### Requirement 4: Add Fallback Extraction Strategy

**User Story:** As a system, I want to have a backup method for extracting words if the LLM doesn't follow the expected format, so that extraction doesn't completely fail.

#### Acceptance Criteria

1. WHEN the primary parsing method yields zero words, THE Extractor Agent SHALL attempt a fallback extraction using regex pattern matching
2. WHEN using fallback extraction, THE Extractor Agent SHALL search for English words using pattern `/\b[a-z]{4,15}\b/gi`
3. WHEN using fallback extraction, THE Extractor Agent SHALL filter out stop words and duplicates
4. WHEN using fallback extraction, THE Extractor Agent SHALL log that fallback mode was used
5. WHEN fallback extraction is used, THE Extractor Agent SHALL set confidence to 0.7 or lower to indicate reduced reliability

### Requirement 5: Optimize Input Text Size for Fast Response

**User Story:** As a user, I want word extraction to complete in under 3 seconds, so that document processing feels responsive.

#### Acceptance Criteria

1. WHEN the cleaned text exceeds 20,000 characters, THE Extractor Agent SHALL use intelligent sampling instead of sending the full text
2. WHEN sampling text, THE Extractor Agent SHALL extract the first 8,000 characters, middle 6,000 characters, and last 6,000 characters
3. WHEN sampling text, THE Extractor Agent SHALL log that sampling was used and the original text length
4. WHEN constructing the LLM prompt, THE System SHALL limit the total prompt size to 25,000 characters maximum
5. WHEN the LLM call completes, THE System SHALL log the token count and latency for monitoring

### Requirement 6: Reduce LLM Token Consumption

**User Story:** As a system operator, I want to minimize LLM token usage while maintaining extraction quality, so that API costs remain low.

#### Acceptance Criteria

1. WHEN calling the LLM for extraction, THE Extractor Agent SHALL set max_tokens to 200 (sufficient for 40 words plus formatting)
2. WHEN constructing the system prompt, THE Extractor Agent SHALL use concise instructions without redundant explanations
3. WHEN the LLM response exceeds expected length, THE System SHALL log a warning about unexpected response format
4. WHEN extraction completes, THE System SHALL track tokens-per-word ratio for quality monitoring
5. WHERE token consumption exceeds 10,000 tokens for a single extraction, THE System SHALL log a warning for investigation
