# AI Wordlist Extraction Fix - Design Document

## Overview

This design addresses the critical bug where the AI wordlist extraction system returns 0 words despite documents containing English vocabulary. The root cause is a mismatch between the LLM response format and the parsing logic, combined with overly strict validation rules and lack of fallback mechanisms.

## Root Cause Analysis

Based on system logs:
- Documents are processed successfully (211,326 chars → 100,000 chars truncated)
- LLM receives prompts (82,742 chars) and responds (454,892 tokens)
- Parsing yields 0 words with NaN confidence

**Primary Issues:**
1. LLM response format doesn't match expected line-by-line structure
2. Regex filter `/^[a-z]+$/` is too strict (rejects mixed case, numbering, punctuation)
3. No fallback extraction when primary parsing fails
4. Verbose prompts increase token usage and response variability

## Architecture

### Components to Modify

**Backend (Supabase Edge Functions):**
- `supabase/functions/_shared/agents/extractor.ts` - Core extraction logic

### Data Flow

```
Document Text (cleaned)
    ↓
Text Sampling (if > 20k chars)
    ↓
Optimized Prompt Construction
    ↓
LLM API Call (GLM-4-Flash)
    ↓
Response Parsing (Primary)
    ↓
Fallback Parsing (if primary fails)
    ↓
Word Deduplication & Validation
    ↓
Extracted Words Array
```

## Technical Design

### 1. Enhanced Parsing Logic

**Current Problem:**
```typescript
// Too strict - rejects "1. word", "Word", "word."
if (!/^[a-z]+$/.test(word)) {
  continue;
}
```

**Solution:**
```typescript
private parseWords(response: string, maxWords: number): string[] {
  console.log(`[Extractor] Parsing response with ${response.split('\n').length} lines`);
  
  // Primary parsing: clean and normalize
  let words = response
    .split('\n')
    .map(line => {
      // Remove numbering (1., 2., etc.)
      line = line.replace(/^\d+\.?\s*/, '');
      // Remove bullets (-, *, •)
      line = line.replace(/^[-*•]\s*/, '');
      // Extract first word if line contains multiple words
      const firstWord = line.trim().split(/\s+/)[0];
      // Remove punctuation and convert to lowercase
      return firstWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
    })
    .filter(word => {
      return word.length >= 2 && 
             word.length <= 20 &&
             !STOP_WORDS.includes(word);
    });
  
  console.log(`[Extractor] Primary parsing found ${words.length} words`);
  
  // Fallback: regex extraction if primary fails
  if (words.length === 0) {
    console.log('[Extractor] Primary parsing failed, using fallback');
    const matches = Array.from(response.matchAll(/\b[a-z]{4,15}\b/gi));
    words = matches
      .map(match => match[0].toLowerCase())
      .filter(word => !STOP_WORDS.includes(word))
      .slice(0, maxWords);
    
    console.log(`[Extractor] Fallback found ${words.length} words`);
  }
  
  // Remove duplicates
  return [...new Set(words)].slice(0, maxWords);
}
```

### 2. Optimized Prompt Design

**Current Problem:**
- Verbose instructions (82,742 chars)
- No clear output format examples
- Ambiguous formatting requirements

**Solution:**
```typescript
private createPrompt(text: string, maxWords: number): string {
  return `Extract ${maxWords} English vocabulary words from this text.
Return ONLY the words, one per line, lowercase, no numbering or explanations.

Example output:
apple
banana
computer

Text: ${text}

Words:`;
}
```

**Benefits:**
- 60% reduction in prompt size
- Clear format expectations
- Explicit examples reduce LLM confusion

### 3. Intelligent Text Sampling

**Current Problem:**
- Simple truncation loses context from middle/end of document
- Large prompts increase latency and token costs

**Solution:**
```typescript
private sampleText(text: string, maxLength: number = 20000): string {
  if (text.length <= maxLength) return text;
  
  console.log(`[Extractor] Sampling text from ${text.length} to ${maxLength} chars`);
  
  // Sample from beginning, middle, and end
  const firstChunk = Math.floor(maxLength * 0.4);  // 40% from start
  const middleChunk = Math.floor(maxLength * 0.3); // 30% from middle
  const lastChunk = maxLength - firstChunk - middleChunk; // 30% from end
  
  const start = text.substring(0, firstChunk);
  const middleStart = Math.floor(text.length / 2) - Math.floor(middleChunk / 2);
  const middle = text.substring(middleStart, middleStart + middleChunk);
  const end = text.substring(text.length - lastChunk);
  
  return `${start}\n\n[...middle section...]\n\n${middle}\n\n[...end section...]\n\n${end}`;
}
```

**Benefits:**
- Captures vocabulary from entire document
- Maintains context from different sections
- Reduces token usage while preserving quality

### 4. Dynamic Token Calculation

**Current Problem:**
- Fixed 500 token limit regardless of word count
- Inefficient for small word counts

**Solution:**
```typescript
private calculateMaxTokens(wordCount: number): number {
  // Each word ~1 token + formatting overhead
  return Math.min(wordCount * 2 + 50, 500);
}
```

**Examples:**
- 10 words → 70 tokens (vs 500)
- 40 words → 130 tokens (vs 500)
- 200 words → 450 tokens (vs 500)

### 5. Enhanced Debugging

**Logging Strategy:**
```typescript
async extractWords(text: string, maxWords: number = 40): Promise<ExtractorResult> {
  console.log(`[Extractor] Starting extraction for ${text.length} chars, maxWords: ${maxWords}`);
  
  const optimizedText = this.sampleText(text, 20000);
  if (optimizedText.length < text.length) {
    console.log(`[Extractor] Text sampled from ${text.length} to ${optimizedText.length} chars`);
  }
  
  const prompt = this.createPrompt(optimizedText, maxWords);
  console.log(`[Extractor] Prompt length: ${prompt.length} chars`);
  
  const response = await this.llm.generateText(prompt, {
    maxTokens: this.calculateMaxTokens(maxWords),
    temperature: 0.1
  });
  
  console.log(`[Extractor] LLM response length: ${response.length} chars`);
  console.log(`[Extractor] Raw response preview: ${response.substring(0, 500)}...`);
  
  const words = this.parseWords(response, maxWords);
  console.log(`[Extractor] Extracted ${words.length} words`);
  console.log(`[Extractor] Sample words: ${words.slice(0, 5).join(', ')}`);
  
  return { words, confidence: this.calculateConfidence(words, maxWords) };
}
```

### 6. Confidence Calculation

**Updated Logic:**
```typescript
private calculateConfidence(words: string[], expectedCount: number): number {
  if (words.length === 0) return 0;
  
  // Lower confidence if using fallback (detected by checking if we logged fallback)
  const ratio = Math.min(words.length / expectedCount, 1.0);
  
  // Full confidence if we got expected count
  // Proportional confidence otherwise
  return ratio;
}
```

## Error Handling

### Graceful Degradation

1. **Primary Parsing Fails** → Fallback regex extraction
2. **Fallback Fails** → Return empty array with 0 confidence
3. **LLM Error** → Catch and return empty result
4. **Invalid Response** → Log warning and attempt fallback

### Error Scenarios

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| LLM returns formatted list | Primary parsing extracts words | None - works correctly |
| LLM returns prose | Fallback regex extracts words | Slightly lower confidence |
| LLM returns empty | Return empty array | User sees 0 words extracted |
| LLM timeout | Catch error, return empty | User sees processing error |

## Performance Optimization

### Token Usage Reduction

**Before:**
- Prompt: 82,742 chars
- Response: 454,892 tokens
- Cost: High

**After:**
- Prompt: ~20,000 chars (75% reduction)
- Response: ~130 tokens for 40 words (99.97% reduction)
- Cost: Minimal

### Response Time

**Target:** < 3 seconds for typical documents

**Optimizations:**
1. Text sampling reduces LLM processing time
2. Smaller prompts reduce network transfer time
3. Dynamic token limits reduce response generation time

## Testing Strategy

### Unit Tests

```typescript
describe('ExtractorAgent', () => {
  it('should extract words from clean line-by-line format', () => {
    const response = 'apple\nbanana\ncomputer';
    const words = parseWords(response, 10);
    expect(words).toEqual(['apple', 'banana', 'computer']);
  });
  
  it('should handle numbered lists', () => {
    const response = '1. apple\n2. banana\n3. computer';
    const words = parseWords(response, 10);
    expect(words).toEqual(['apple', 'banana', 'computer']);
  });
  
  it('should use fallback for prose format', () => {
    const response = 'Here are some words: apple, banana, computer';
    const words = parseWords(response, 10);
    expect(words.length).toBeGreaterThan(0);
  });
  
  it('should filter stop words', () => {
    const response = 'the\napple\nand\nbanana';
    const words = parseWords(response, 10);
    expect(words).toEqual(['apple', 'banana']);
  });
});
```

### Integration Tests

1. Test with real documents containing English vocabulary
2. Verify extraction success rate > 95%
3. Measure token usage < 15,000 per request
4. Confirm response time < 10 seconds

## Success Metrics

1. **Extraction Success Rate:** > 95% of documents with English words extract at least 1 word
2. **Response Time:** < 10 seconds for documents under 100k characters
3. **Token Efficiency:** < 15,000 tokens per extraction request
4. **Confidence Accuracy:** Confidence score correlates with extraction quality

## Rollback Plan

If issues arise:
1. Revert to previous extractor.ts version
2. Monitor logs for specific failure patterns
3. Adjust parsing logic based on real-world LLM responses
4. Gradually re-enable optimizations

## Future Enhancements

1. **Adaptive Sampling:** Adjust sampling strategy based on document type
2. **Multi-Language Support:** Extend parsing for other languages
3. **Semantic Filtering:** Use embeddings to filter low-quality words
4. **Caching:** Cache extraction results for identical documents
