/**
 * Extractor Agent
 * AI-powered English word extraction from cleaned text
 */

import { callLLM } from '../llm/service.ts'
import { withRetry } from '../llm/retry.ts'
import type { ExtractorInput, ExtractorOutput } from './types.ts'

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
  'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had',
  'were', 'said', 'did', 'having', 'may', 'should', 'am', 'being',
])

/**
 * Extract key English words from cleaned text
 */
export async function extract(input: ExtractorInput): Promise<ExtractorOutput> {
  const { cleanedText, maxWords } = input

  // Build prompt for word extraction
  const systemPrompt = `You are an expert English vocabulary extraction assistant. Your task is to identify the most important and useful English vocabulary words from a given text for language learners.

Rules:
1. Extract ONLY valid English words (nouns, verbs, adjectives, adverbs)
2. Prioritize words that are:
   - Academically or professionally useful
   - Not too common (avoid basic words like "the", "is", "and")
   - Not too rare (avoid highly specialized jargon unless contextually important)
3. Return EXACTLY ${maxWords} words or fewer if the text doesn't contain enough suitable words
4. Return words in their base form (e.g., "run" not "running", "analysis" not "analyses")
5. Avoid duplicates
6. Return ONLY the words, one per line, no numbering, no explanations

Output format:
word1
word2
word3
...`

  const userPrompt = `Extract the most important English vocabulary words from this text:\n\n${cleanedText}`

  try {
    // Call LLM with retry logic
    const response = await withRetry(() =>
      callLLM({
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 500,
        temperature: 0.3, // Lower temperature for more consistent extraction
      })
    )

    // Parse response - split by newlines and clean
    const rawWords = response.content
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => line.length > 0)
      .filter(word => /^[a-z]+$/.test(word)) // Only alphabetic characters

    // Filter out stop words and duplicates
    const uniqueWords = new Set<string>()
    const filteredWords: string[] = []

    for (const word of rawWords) {
      if (!STOP_WORDS.has(word) && !uniqueWords.has(word)) {
        uniqueWords.add(word)
        filteredWords.push(word)
      }
    }

    // Limit to maxWords
    const finalWords = filteredWords.slice(0, maxWords)

    // Calculate confidence based on word quality
    const validWordRatio = finalWords.length / Math.min(rawWords.length, maxWords)
    const confidence = Math.max(0.85, Math.min(0.99, validWordRatio))

    return {
      words: finalWords,
      confidence,
      filteredCount: rawWords.length - finalWords.length,
    }
  } catch (error) {
    console.error('Extractor agent error:', error)
    throw new Error(`Failed to extract words: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
