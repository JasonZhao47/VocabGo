# Requirements Document - Chunk-Based Wordlist Generation

## Introduction

The current document processing system generates a single wordlist per document with a maximum of 40 words (soon to be adjustable up to 50). This approach has limitations: (1) it doesn't scale well for large documents with diverse vocabulary, (2) LLM failures result in complete processing failure, and (3) users cannot see partial results if processing fails midway. The new system should process documents in chunks internally for resilience, then combine successful results into a single wordlist, with error handling that allows partial success when some chunks fail.

## Glossary

- **Chunk**: A segment of a document's text, typically 5,000-10,000 characters, processed independently
- **Chunk Wordlist**: An internal wordlist generated from a single chunk, containing up to 50 words
- **Combined Wordlist**: The final merged wordlist containing words from all successful chunks
- **Partial Success**: When some chunks succeed and others fail, returning a combined wordlist from successful chunks
- **Chunk Metadata**: Internal information about each chunk including position, character range, and processing status
- **Resilient Processing**: Error handling strategy that isolates failures to individual chunks
- **Extractor Agent**: The AI agent responsible for extracting English vocabulary from a chunk
- **Translator Agent**: The AI agent responsible for generating Mandarin translations
- **Word Count Limit**: User-configurable maximum total words in the final combined wordlist (10-50)

## Requirements

### Requirement 1: Implement Intelligent Document Chunking

**User Story:** As a system, I want to split large documents into manageable chunks, so that each chunk can be processed independently and efficiently.

#### Acceptance Criteria

1. WHEN a document exceeds 8,000 characters, THE System SHALL split it into multiple chunks
2. WHEN splitting text into chunks, THE System SHALL target 8,000 characters per chunk with a maximum of 10,000 characters
3. WHEN splitting text, THE System SHALL attempt to break at paragraph boundaries to preserve context
4. WHEN no paragraph boundary is found within 1,000 characters of the target split point, THE System SHALL split at the nearest sentence boundary
5. WHEN creating chunks, THE System SHALL include 200 characters of overlap between consecutive chunks to maintain context continuity

### Requirement 2: Combine Chunk Wordlists Into Single Result

**User Story:** As a user, I want to receive one combined wordlist from my document, so that I have a unified vocabulary list regardless of document size.

#### Acceptance Criteria

1. WHEN processing a chunked document, THE System SHALL generate internal wordlists for each chunk
2. WHEN all chunks complete processing, THE System SHALL merge successful chunk wordlists into a single combined wordlist
3. WHEN merging wordlists, THE System SHALL remove duplicate words across chunks
4. WHEN the word count limit is reached, THE System SHALL prioritize words from earlier chunks
5. WHEN displaying results, THE System SHALL show a single wordlist to the user without exposing chunk boundaries

### Requirement 3: Implement Resilient Chunk Processing

**User Story:** As a user, I want to receive a wordlist even if some chunks fail, so that I don't lose all results due to a single failure.

#### Acceptance Criteria

1. WHEN processing multiple chunks, THE System SHALL process each chunk independently with isolated error handling
2. WHEN a chunk fails to process, THE System SHALL log the error and continue processing remaining chunks
3. WHEN chunk processing completes, THE System SHALL combine all successful chunk wordlists into a single result
4. WHEN at least one chunk succeeds, THE System SHALL return a success response with the combined wordlist
5. WHEN all chunks fail, THE System SHALL return an error response with detailed failure information for each chunk

### Requirement 4: Support Configurable Total Word Count

**User Story:** As a user, I want to set how many total words are in my final wordlist (up to 50), so that I can control the size of my vocabulary list.

#### Acceptance Criteria

1. WHEN the user uploads a document, THE System SHALL accept a maxWords parameter between 10 and 50
2. WHEN maxWords is not provided, THE System SHALL default to 40 words total
3. WHEN maxWords is provided, THE System SHALL validate it is within the valid range (10-50)
4. WHEN maxWords is invalid, THE System SHALL return an error with code INVALID_WORD_COUNT
5. WHEN combining chunk wordlists, THE System SHALL limit the final result to maxWords total words

### Requirement 5: Display Combined Wordlist with Metadata

**User Story:** As a user, I want to see my wordlist with information about how it was processed, so that I understand if any issues occurred.

#### Acceptance Criteria

1. WHEN a document is processed successfully, THE System SHALL display a single combined wordlist
2. WHEN some chunks failed during processing, THE System SHALL display a warning message indicating partial results
3. WHEN displaying the wordlist, THE System SHALL show the total word count
4. WHEN chunks failed, THE System SHALL indicate how many chunks succeeded vs failed (e.g., "3 of 5 sections processed")
5. WHEN viewing results, THE System SHALL provide standard download options for the combined wordlist

### Requirement 6: Implement Chunk-Level Progress Tracking

**User Story:** As a user, I want to see which chunks are being processed, so that I understand the progress of my document.

#### Acceptance Criteria

1. WHEN processing begins, THE System SHALL display the total number of chunks detected
2. WHEN each chunk completes, THE System SHALL update the progress indicator (e.g., "Processing chunk 2 of 5")
3. WHEN a chunk succeeds, THE System SHALL mark it as complete in the progress display
4. WHEN a chunk fails, THE System SHALL mark it as failed in the progress display
5. WHEN all chunks complete, THE System SHALL show a summary of successful and failed chunks

### Requirement 7: Optimize Chunk Processing for Performance

**User Story:** As a system, I want to process chunks efficiently, so that large documents complete in reasonable time.

#### Acceptance Criteria

1. WHEN processing multiple chunks, THE System SHALL process up to 3 chunks concurrently to maximize throughput
2. WHEN a chunk LLM call exceeds 10 seconds, THE System SHALL log a warning for performance monitoring
3. WHEN calculating total processing time, THE System SHALL track per-chunk timing and overall duration
4. WHEN chunk processing completes, THE System SHALL log token usage per chunk for cost monitoring
5. WHEN total token usage exceeds 50,000 tokens, THE System SHALL log a warning for investigation

### Requirement 8: Handle Edge Cases in Chunking

**User Story:** As a system, I want to handle small documents and edge cases gracefully, so that chunking doesn't add unnecessary complexity.

#### Acceptance Criteria

1. WHEN a document is less than 8,000 characters, THE System SHALL process it as a single chunk without splitting
2. WHEN a document splits into chunks, THE System SHALL ensure no chunk is smaller than 2,000 characters unless it's the final chunk
3. WHEN the final chunk is smaller than 2,000 characters, THE System SHALL merge it with the previous chunk
4. WHEN a document contains only whitespace or no extractable text, THE System SHALL return an error without attempting to chunk
5. WHEN chunk overlap would exceed chunk boundaries, THE System SHALL adjust overlap to fit within available text

### Requirement 9: Maintain Backward Compatibility

**User Story:** As a developer, I want the new chunking system to work with existing frontend code, so that migration is smooth.

#### Acceptance Criteria

1. WHEN the API response contains a combined wordlist, THE System SHALL use the same structure as the current single-wordlist format
2. WHEN the frontend receives the response, THE System SHALL include a metadata field indicating if chunking was used
3. WHEN saving wordlists, THE System SHALL use the existing single-wordlist format
4. WHEN exporting wordlists, THE System SHALL use the existing export format for the combined wordlist
5. WHEN displaying results, THE System SHALL use the existing ResultPage component without modifications
