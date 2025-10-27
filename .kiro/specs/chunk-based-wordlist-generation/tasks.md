# Implementation Plan: Chunk-Based Wordlist Generation

## Overview

Implement resilient chunk-based document processing that splits large documents into manageable chunks, processes each independently, and combines results into a single wordlist. This provides fault tolerance while maintaining the simple UX of a combined wordlist.

---

## Core Implementation Tasks

- [x] 1. Implement Document Chunker
  - Create `supabase/functions/_shared/chunking/documentChunker.ts` with chunking logic
  - Implement intelligent text splitting at paragraph/sentence boundaries
  - Add 200-character overlap between consecutive chunks for context
  - Handle edge cases: small documents (<8,000 chars), empty documents
  - Return chunk metadata (position, character ranges, total chunks)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Implement Chunk Processor
  - Create `supabase/functions/_shared/processing/chunkProcessor.ts` for individual chunk processing
  - Process each chunk through: clean → extract → translate pipeline
  - Implement isolated error handling per chunk (never throw exceptions)
  - Return structured results with success/error status
  - Collect timing and token usage metrics per chunk
  - Handle timeouts (30 seconds per chunk) and LLM rate limits
  - _Requirements: 3.1, 3.2, 7.2, 7.4_

- [x] 3. Implement Wordlist Combiner
  - Create `supabase/functions/_shared/combining/wordlistCombiner.ts` for merging results
  - Remove exact duplicates (case-insensitive English word matching)
  - Prioritize words from earlier chunks when duplicates exist
  - Enforce final word count limit (user-configurable 10-50)
  - Return metadata about combination process (duplicates removed, etc.)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.5_

- [x] 4. Update Process Document Function
  - Modify `supabase/functions/process-document/index.ts` to use chunk-based processing
  - Add chunking logic for documents > 8,000 characters
  - Implement concurrent chunk processing (max 3 concurrent)
  - Integrate chunk processor and wordlist combiner
  - Maintain existing API response format for backward compatibility
  - Add optional metadata fields (chunking info, warnings)
  - Handle partial success scenarios (some chunks fail)
  - _Requirements: 2.5, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 7.1, 7.3, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Add Configuration Support
  - Add chunking configuration to environment variables
  - Support configurable chunk sizes, overlap, and concurrency limits
  - Add feature flags for gradual rollout
  - Update `.env.example` with new variables
  - Add validation for configuration values
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implement Progress Tracking
  - Update processing state to track chunk-level progress
  - Emit progress events for each chunk completion
  - Display "Processing chunk X of Y" messages
  - Show which chunks succeeded/failed
  - Add progress percentage calculation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Add Warning Display for Partial Failures
  - Update response format to include warnings array
  - Generate warning messages when chunks fail (e.g., "3 of 5 sections processed")
  - Display warnings in ResultPage component
  - Show chunk success/failure summary in metadata
  - _Requirements: 5.2, 5.4_

---

## Testing Tasks

- [ ]* 8. Write Unit Tests for Document Chunker
  - Test small documents (<8,000 chars) → single chunk
  - Test large documents → multiple chunks with correct boundaries
  - Test chunk overlap verification
  - Test edge cases: empty document, very long document
  - Test paragraph and sentence boundary detection
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 9. Write Unit Tests for Chunk Processor
  - Test successful processing through all stages
  - Test cleaning failure handling
  - Test extraction failure handling
  - Test translation failure handling
  - Test timeout handling
  - Test metrics collection
  - _Requirements: 3.1, 3.2, 7.2, 7.4_

- [ ]* 10. Write Unit Tests for Wordlist Combiner
  - Test deduplication logic across chunks
  - Test word limit enforcement
  - Test priority strategy (first-chunk wins)
  - Test metadata accuracy
  - Test edge cases: no words, all duplicates
  - _Requirements: 2.2, 2.3, 2.4, 4.5_

- [ ]* 11. Write Integration Tests
  - Test single chunk document → combined wordlist
  - Test multi-chunk document → combined wordlist
  - Test partial failure (some chunks fail) → partial results
  - Test total failure (all chunks fail) → error response
  - Test concurrent processing behavior
  - Test backward compatibility with existing API format
  - _Requirements: 2.1, 2.5, 3.3, 3.4, 3.5, 7.1, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 12. Write Performance Tests
  - Test processing time for various document sizes
  - Verify concurrent processing benefits (3 chunks in parallel)
  - Test memory usage with large documents
  - Verify 30-page PDF processes in <45 seconds
  - Monitor token usage per chunk
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

---

## Deployment Tasks

- [ ] 13. Deploy to Staging
  - Deploy updated edge functions to staging environment
  - Configure environment variables for chunking
  - Enable feature flag for testing
  - Verify all tests pass in staging
  - Test with real documents of various sizes
  - Monitor error rates and performance metrics
  - _Requirements: All_

- [ ] 14. Production Rollout
  - Deploy to production with feature flag disabled
  - Enable for 10% of traffic initially
  - Monitor error rates and performance metrics
  - Gradually increase to 50%, then 100%
  - Set up alerts for chunk processing failures
  - Document rollback procedure
  - _Requirements: All_

---

## Documentation Tasks

- [ ]* 15. Write Technical Documentation
  - Document architecture and design decisions
  - Create API documentation for new functions
  - Document configuration options
  - Create troubleshooting guide
  - Document monitoring and alerting setup
  - _Requirements: All_

- [ ]* 16. Update User Documentation
  - Update user guide with information about large document support
  - Document new warning messages for partial failures
  - Update FAQ with chunk processing information
  - Create user-friendly explanation of resilient processing
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

---

## Task Dependencies

```
Task 1 (Chunker) → Task 4 (Process Document)
Task 2 (Processor) → Task 4 (Process Document)
Task 3 (Combiner) → Task 4 (Process Document)
Task 4 (Process Document) → Task 5 (Configuration)
Task 4 (Process Document) → Task 6 (Progress Tracking)
Task 4 (Process Document) → Task 7 (Warning Display)

Task 1 → Task 8 (Chunker Tests)
Task 2 → Task 9 (Processor Tests)
Task 3 → Task 10 (Combiner Tests)
Task 4 → Task 11 (Integration Tests)
Task 4 → Task 12 (Performance Tests)

Task 4 + Task 11 + Task 12 → Task 13 (Staging)
Task 13 → Task 14 (Production)

Task 4 → Task 15 (Technical Docs)
Task 14 → Task 16 (User Docs)
```

---

## Implementation Timeline

**Week 1: Core Implementation**
- Days 1-2: Task 1 (Document Chunker)
- Days 3-4: Task 2 (Chunk Processor)
- Day 5: Task 3 (Wordlist Combiner)

**Week 2: Integration & Features**
- Days 1-2: Task 4 (Update Process Document)
- Day 3: Task 5 (Configuration)
- Day 4: Task 6 (Progress Tracking)
- Day 5: Task 7 (Warning Display)

**Week 3: Testing**
- Days 1-2: Tasks 8-10 (Unit Tests)
- Days 3-4: Task 11 (Integration Tests)
- Day 5: Task 12 (Performance Tests)

**Week 4: Deployment & Documentation**
- Days 1-2: Task 13 (Staging Deployment)
- Days 3-4: Task 14 (Production Rollout)
- Day 5: Tasks 15-16 (Documentation)

---

## Success Metrics

- **Resilience**: System continues processing when individual chunks fail
- **Performance**: Large documents (>20 pages) process in <60 seconds
- **Accuracy**: Combined wordlists maintain quality equivalent to single-pass processing
- **Compatibility**: Existing frontend code works without modifications
- **Reliability**: <5% failure rate for chunk processing
- **User Experience**: Users receive partial results even when some chunks fail

---

## Rollback Plan

If issues arise during deployment:
1. Disable chunking via feature flag (immediate)
2. System falls back to current single-pass processing
3. No data loss or corruption (stateless processing)
4. Investigate and fix issues in staging
5. Re-enable chunking after verification

---

## Monitoring & Alerts

- Alert when >50% of chunks fail for a document
- Alert when average chunk processing time >15 seconds
- Alert when token usage per chunk >5,000 tokens
- Monitor deduplication rates and word count distributions
- Track partial success rates and user satisfaction
