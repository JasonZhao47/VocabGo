/**
 * Translator Agent
 * AI-powered English to Mandarin translation
 */

import { callLLM } from '../llm/service.ts'
import { withRetry } from '../llm/retry.ts'
import type { TranslatorInput, TranslatorOutput, WordPair } from './types.ts'

/**
 * Translate English words to Mandarin Chinese
 */
export async function translate(input: TranslatorInput): Promise<TranslatorOutput> {
  const { words, context } = input

  if (words.length === 0) {
    return {
      translations: [],
      confidence: 1.0,
      fallbackUsed: [],
    }
  }

  // Build prompt for translation
  const systemPrompt = `You are an expert English-to-Mandarin translator specializing in vocabulary learning. Your task is to provide accurate, contextually appropriate Mandarin Chinese translations for English words.

Rules:
1. Provide the most common and useful Mandarin translation for each word
2. For polysemous words (words with multiple meanings), use the context to determine the most appropriate translation
3. Use simplified Chinese characters (简体中文)
4. For rare or specialized words, provide the best available translation
5. Return ONLY the translations in the exact format specified below
6. Maintain the same order as the input words

Output format (one per line):
english_word|中文翻译`

  // Build word list
  const wordList = words.join('\n')

  // Build user prompt with optional context
  let userPrompt = `Translate these English words to Mandarin Chinese:\n\n${wordList}`
  
  if (context && context.trim().length > 0) {
    // Limit context to avoid token overflow
    const truncatedContext = context.slice(0, 500)
    userPrompt += `\n\nDocument context (for polysemous words):\n${truncatedContext}`
  }

  try {
    // Call LLM with retry logic
    const response = await withRetry(() =>
      callLLM({
        prompt: userPrompt,
        systemPrompt,
        maxTokens: words.length * 20, // Estimate ~20 tokens per translation
        temperature: 0.2, // Low temperature for consistent translations
      })
    )

    // Parse response
    const lines = response.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const translations: WordPair[] = []
    const fallbackUsed: string[] = []

    // Process each line
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      
      if (i < lines.length) {
        const line = lines[i]
        const parts = line.split('|')
        
        if (parts.length === 2) {
          const [en, zh] = parts.map(p => p.trim())
          
          // Validate that English word matches (case-insensitive)
          if (en.toLowerCase() === word.toLowerCase()) {
            // Validate Chinese translation (should contain Chinese characters)
            if (/[\u4e00-\u9fff]/.test(zh)) {
              translations.push({ en: word, zh })
              continue
            }
          }
        }
      }

      // Fallback: use the word itself if translation failed
      translations.push({ en: word, zh: word })
      fallbackUsed.push(word)
    }

    // Calculate confidence based on successful translations
    const successRate = (translations.length - fallbackUsed.length) / translations.length
    const confidence = Math.max(0.85, Math.min(0.99, successRate))

    return {
      translations,
      confidence,
      fallbackUsed,
    }
  } catch (error) {
    console.error('Translator agent error:', error)
    
    // Fallback: return words without translation
    const fallbackTranslations: WordPair[] = words.map(word => ({
      en: word,
      zh: word,
    }))

    return {
      translations: fallbackTranslations,
      confidence: 0.5,
      fallbackUsed: words,
    }
  }
}
