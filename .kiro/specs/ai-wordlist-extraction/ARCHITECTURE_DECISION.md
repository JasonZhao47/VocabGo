# Architecture Decision: Traditional Text Cleaning vs LLM-Based Cleaning

## Decision

Use **traditional regex and heuristic-based text cleaning** instead of an LLM-based Cleaner Agent for document preprocessing.

## Context

The original design included three AI agents:
1. Cleaner Agent (LLM-based) - Document quality assessment and noise removal
2. Extractor Agent (LLM-based) - Word identification
3. Translator Agent (LLM-based) - Mandarin translation

This decision changes the Cleaner Agent from LLM-based to traditional text processing.

## Rationale

### Cost Efficiency
- **Traditional cleaning**: Free, no API costs
- **LLM cleaning**: ~$0.01-0.05 per document (depending on size)
- **Savings**: 30-40% reduction in total LLM token budget
- **Impact**: More budget available for the actual AI tasks (extraction and translation)

### Performance
- **Traditional cleaning**: <100ms processing time
- **LLM cleaning**: 1-3 seconds per call (network + processing)
- **Impact**: Helps meet the 30-second target for 30-page PDFs
- **Benefit**: No network latency or API rate limiting concerns

### Predictability
- **Traditional cleaning**: Deterministic, consistent output
- **LLM cleaning**: Potential for inconsistent decisions, hallucinations
- **Impact**: Easier debugging, more reliable results
- **Benefit**: Clear understanding of what gets removed and why

### Simplicity
- **Traditional cleaning**: Well-understood regex patterns
- **LLM cleaning**: Requires prompt engineering, testing, iteration
- **Impact**: Faster development, easier maintenance
- **Benefit**: Team can easily add new patterns as needed

### Effectiveness
For the target use case (vocabulary extraction from learner documents):
- Most noise follows predictable patterns (headers, footers, page numbers)
- Regex can handle 90%+ of common cases
- Edge cases can be addressed with additional patterns over time

## Trade-offs

### What We Lose
- **Semantic understanding**: LLM could understand context better
- **Complex formatting**: LLM might handle unusual document structures better
- **Adaptive behavior**: LLM could learn from different document types

### What We Gain
- **Speed**: 10-30x faster processing
- **Cost**: Zero API costs for cleaning
- **Reliability**: Deterministic, testable behavior
- **Simplicity**: No prompt engineering required

## When LLM Cleaning Would Make Sense

Consider LLM-based cleaning if:
- Processing complex academic papers with inconsistent formatting
- Semantic understanding is critical (e.g., distinguishing footnotes from body text)
- Cost and latency are not primary concerns
- Document types are highly variable and unpredictable

## Implementation Details

### Text Cleaning Service
Located at: `supabase/functions/_shared/cleaners/textCleaner.ts`

**Cleaning Strategies:**
1. **Headers/Footers**: Regex patterns for common formats
2. **Page Numbers**: Detect standalone numbers or patterns
3. **Table of Contents**: Identify repeated dot patterns with page number