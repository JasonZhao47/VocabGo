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
 * Clean a line by removing numbering, bullets, and punctuation
 * Handles various formatting patterns from LLM responses
 */
function cleanLine(line: string): string {
  // Step 1: Remove leading numbering (e.g., "1.", "1)", "1-", "1:", "1 -", "1 .")
  let cleaned = line.replace(/^\s*\d+[\.\)\-:\s]+/, '')
  
  // Step 2: Remove leading bullets (•, -, *, +, >, etc.)
  cleaned = cleaned.replace(/^\s*[•\-\*\+>]+\s*/, '')
  
  // Step 3: Remove markdown formatting (**, __, `, etc.)
  cleaned = cleaned.replace(/[\*_`]/g, '')
  
  // Step 4: Remove parentheses and brackets
  cleaned = cleaned.replace(/[\(\)\[\]]/g, '')
  
  // Step 5: Remove trailing punctuation and special characters
  cleaned = cleaned.replace(/[^\w\s]/g, '')
  
  // Step 6: Trim whitespace
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Fallback extraction using regex pattern matching
 * Used when primary parsing fails to extract words
 */
function fallbackExtraction(text: string, maxWords: number): string[] {
  console.log('[Extractor] ⚠️ Using fallback regex extraction')
  console.log(`[Extractor] Fallback input text length: ${text.length}`)
  
  // Extract words using pattern: 3-15 letter words (lowered minimum from 4 to 3)
  const wordPattern = /\b[a-z]{3,15}\b/gi
  const matches = text.match(wordPattern) || []
  
  console.log(`[Extractor] Fallback found ${matches.length} potential words`)
  
  // Convert to lowercase and remove duplicates
  const uniqueWords = new Set<string>()
  const words: string[] = []
  
  for (const word of matches) {
    const normalized = word.toLowerCase()
    if (!STOP_WORDS.has(normalized) && !uniqueWords.has(normalized) && normalized.length >= 3) {
      uniqueWords.add(normalized)
      words.push(normalized)
      
      if (words.length >= maxWords) {
        break
      }
    }
  }
  
  console.log(`[Extractor] Fallback extracted ${words.length} words after filtering`)
  
  return words
}

/**
 * Sample text intelligently from beginning, middle, and end
 */
function sampleText(text: string, maxChars: number = 20000): { sampled: string; wasSampled: boolean } {
  if (text.length <= maxChars) {
    return { sampled: text, wasSampled: false }
  }
  
  console.log(`[Extractor] Sampling text: original length ${text.length}, target ${maxChars}`)
  
  // 40-30-30 distribution
  const beginChars = Math.floor(maxChars * 0.4)
  const middleChars = Math.floor(maxChars * 0.3)
  const endChars = maxChars - beginChars - middleChars
  
  const beginning = text.slice(0, beginChars)
  const middleStart = Math.floor((text.length - middleChars) / 2)
  const middle = text.slice(middleStart, middleStart + middleChars)
  const end = text.slice(-endChars)
  
  return {
    sampled: `${beginning}\n...\n${middle}\n...\n${end}`,
    wasSampled: true
  }
}

/**
 * Calculate dynamic max tokens based on word count
 */
function calculateMaxTokens(wordCount: number): number {
  return Math.min(wordCount * 2 + 50, 500)
}

/**
 * Extract key English words from cleaned text
 */
export async function extract(input: ExtractorInput): Promise<ExtractorOutput> {
  const { cleanedText, maxWords } = input

  // Sample text if too long
  const { sampled: textToProcess, wasSampled } = sampleText(cleanedText, 20000)
  
  if (wasSampled) {
    console.log(`[Extractor] ✂️ Text sampling applied: original ${cleanedText.length} chars → ${textToProcess.length} chars`)
  }
  
  // Calculate dynamic token limit
  const maxTokens = calculateMaxTokens(maxWords)
  console.log(`[Extractor] Using max_tokens: ${maxTokens} for ${maxWords} words`)

  // Build ultra-concise prompt for word extraction (optimized for token efficiency)
  const systemPrompt = `Extract ${maxWords} vocabulary words. Output format:

algorithm
database
network

Rules: lowercase, base form, one per line, no numbers/bullets`

  const userPrompt = textToProcess

  try {
    const startTime = Date.now()
    
    // Call LLM with retry logic
    const response = await withRetry(() =>
      callLLM({
        prompt: userPrompt,
        systemPrompt,
        maxTokens,
        temperature: 0.3,
      })
    )
    
    const latency = Date.now() - startTime
    console.log(`[Extractor] LLM call completed in ${latency}ms, tokens: ${response.tokensUsed}`)
    console.log(`[Extractor] Raw response preview: ${response.content.slice(0, 500)}`)
    
    // Log warning if response exceeds expected length
    const expectedMaxLength = maxWords * 20 // Rough estimate: ~20 chars per word line
    if (response.content.length > expectedMaxLength * 2) {
      console.warn(`[Extractor] ⚠️ LLM response length (${response.content.length}) exceeds expected (${expectedMaxLength}). Possible unexpected format.`)
    }

    // Parse response with flexible line cleaning
    const lines = response.content.split('\n')
    console.log(`[Extractor] 📋 Parsing ${lines.length} lines from LLM response`)
    console.log(`[Extractor] 📝 Raw response preview (first 500 chars):\n${response.content.slice(0, 500)}`)
    
    const rawWords: string[] = []
    let rejectedByRegex = 0
    let emptyLines = 0
    let successfulExtractions = 0
    
    // Log first few lines for debugging
    const sampleSize = Math.min(5, lines.length)
    console.log(`[Extractor] 🔍 Sample of first ${sampleSize} lines:`)
    for (let i = 0; i < sampleSize; i++) {
      console.log(`[Extractor]   Line ${i + 1}: "${lines[i]}"`)
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Skip empty lines
      if (line.trim().length === 0) {
        emptyLines++
        continue
      }
      
      const cleaned = cleanLine(line)
      
      if (cleaned.length === 0) {
        emptyLines++
        continue
      }
      
      // Convert to lowercase for validation
      const normalized = cleaned.toLowerCase()
      
      // Strategy 1: Check if it's a pure alphabetic word
      const alphabeticMatch = normalized.match(/^[a-z]+$/)
      if (alphabeticMatch) {
        rawWords.push(normalized)
        successfulExtractions++
        if (i < 10) { // Log first 10 successful extractions
          console.log(`[Extractor] ✅ Line ${i + 1}: "${line}" → "${normalized}" (pure word)`)
        }
        continue
      }
      
      // Strategy 2: Try to extract first word if line contains multiple words or remaining punctuation
      const words = normalized.split(/\s+/)
      let extracted = false
      
      for (const word of words) {
        // Remove any remaining non-alphabetic characters
        const cleanWord = word.replace(/[^a-z]/g, '')
        
        // Accept words with 3+ characters
        if (cleanWord.length >= 3 && /^[a-z]+$/.test(cleanWord)) {
          rawWords.push(cleanWord)
          extracted = true
          successfulExtractions++
          if (i < 10) { // Log first 10 successful extractions
            console.log(`[Extractor] ✅ Line ${i + 1}: "${line}" → "${cleanWord}" (extracted from multi-word)`)
          }
          break // Only take first valid word from the line
        }
      }
      
      if (!extracted) {
        rejectedByRegex++
        if (rejectedByRegex <= 5) { // Log first 5 rejections
          console.log(`[Extractor] ❌ Line ${i + 1}: "${line}" → rejected (no valid word found)`)
        }
      }
    }
    
    console.log(`[Extractor] 📊 Line parsing summary:`)
    console.log(`[Extractor]   - Total lines: ${lines.length}`)
    console.log(`[Extractor]   - Empty/whitespace lines: ${emptyLines}`)
    console.log(`[Extractor]   - Successfully extracted: ${successfulExtractions}`)
    console.log(`[Extractor]   - Rejected by validation: ${rejectedByRegex}`)
    console.log(`[Extractor]   - Raw words collected: ${rawWords.length}`)

    // Filter out stop words and duplicates
    console.log(`[Extractor] 🔍 Starting word filtering process...`)
    const uniqueWords = new Set<string>()
    const filteredWords: string[] = []
    let stopWordsFiltered = 0
    let duplicatesFiltered = 0
    let tooShortFiltered = 0

    for (const word of rawWords) {
      // Skip very short words
      if (word.length < 3) {
        tooShortFiltered++
        continue
      }
      
      // Skip stop words
      if (STOP_WORDS.has(word)) {
        stopWordsFiltered++
        continue
      }
      
      // Skip duplicates
      if (uniqueWords.has(word)) {
        duplicatesFiltered++
        continue
      }
      
      uniqueWords.add(word)
      filteredWords.push(word)
    }
    
    console.log(`[Extractor] 📊 Filtering summary:`)
    console.log(`[Extractor]   - Input words: ${rawWords.length}`)
    console.log(`[Extractor]   - Too short (<3 chars): ${tooShortFiltered}`)
    console.log(`[Extractor]   - Stop words filtered: ${stopWordsFiltered}`)
    console.log(`[Extractor]   - Duplicates filtered: ${duplicatesFiltered}`)
    console.log(`[Extractor]   - Valid unique words: ${filteredWords.length}`)

    // Limit to maxWords
    let finalWords = filteredWords.slice(0, maxWords)
    let confidence = 0.95
    let usedFallback = false

    // Fallback extraction if primary method yields zero words
    if (finalWords.length === 0) {
      console.log('[Extractor] ⚠️ Primary extraction yielded 0 words, triggering fallback extraction')
      finalWords = fallbackExtraction(textToProcess, maxWords)
      confidence = 0.7
      usedFallback = true
      
      if (finalWords.length === 0) {
        console.log('[Extractor] ❌ Fallback extraction also yielded 0 words')
        confidence = 0.0
      }
    } else {
      // Calculate confidence based on word quality
      const validWordRatio = finalWords.length / Math.min(rawWords.length || 1, maxWords)
      confidence = Math.max(0.85, Math.min(0.99, validWordRatio))
    }
    
    console.log(`[Extractor] ✨ Final extraction results:`)
    console.log(`[Extractor]   - Word count: ${finalWords.length}/${maxWords}`)
    console.log(`[Extractor]   - Confidence: ${confidence.toFixed(2)}`)
    console.log(`[Extractor]   - Used fallback: ${usedFallback}`)
    console.log(`[Extractor]   - Filtered count: ${rawWords.length - finalWords.length}`)
    
    if (finalWords.length > 0) {
      console.log(`[Extractor]   - Sample words: ${finalWords.slice(0, 5).join(', ')}${finalWords.length > 5 ? '...' : ''}`)
    }
    
    // Log token usage metrics
    const tokensPerWord = finalWords.length > 0 ? response.tokensUsed / finalWords.length : 0
    console.log(`[Extractor] Tokens per word: ${tokensPerWord.toFixed(2)}`)
    
    if (response.tokensUsed > 10000) {
      console.warn(`[Extractor] High token usage: ${response.tokensUsed} tokens`)
    }

    return {
      words: finalWords,
      confidence: usedFallback ? 0.7 : confidence,
      filteredCount: rawWords.length - finalWords.length,
    }
  } catch (error) {
    console.error('Extractor agent error:', error)
    throw new Error(`Failed to extract words: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
