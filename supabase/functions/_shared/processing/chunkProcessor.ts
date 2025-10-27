/**
 * Chunk Processor
 * 
 * Processes individual document chunks through the clean → extract → translate pipeline.
 * Implements isolated error handling per chunk to ensure failures don't propagate.
 */

import { cleanText } from '../agents/cleaner.ts'
import { extract } from '../agents/extractor.ts'
import { translate } from '../agents/translator.ts'
import { getChunkingConfig } from '../config/chunkingConfig.ts'
import type { DocumentChunk } from '../chunking/documentChunker.ts'
import type { WordPair } from '../agents/types.ts'

export interface ChunkProcessingResult {
  chunkId: string
  success: boolean
  words?: WordPair[]
  error?: {
    code: string
    message: string
    stage: 'cleaning' | 'extraction' | 'translation'
  }
  metrics: {
    cleaningTimeMs: number
    extractionTimeMs: number
    translationTimeMs: number
    tokensUsed: number
  }
}

export interface ProcessChunkOptions {
  chunk: DocumentChunk
  maxWordsPerChunk?: number  // Up to 50 words per chunk (uses config default if not provided)
  documentType: string
  timeoutMs?: number         // Timeout per chunk (uses config default if not provided)
}

/**
 * Process a single chunk through the complete pipeline
 * Never throws exceptions - always returns a result object
 */
export async function processChunk(
  options: ProcessChunkOptions
): Promise<ChunkProcessingResult> {
  const config = getChunkingConfig()
  const { 
    chunk, 
    maxWordsPerChunk = config.maxWordsPerChunk, 
    documentType, 
    timeoutMs = config.chunkTimeoutMs 
  } = options
  
  const metrics = {
    cleaningTimeMs: 0,
    extractionTimeMs: 0,
    translationTimeMs: 0,
    tokensUsed: 0
  }
  
  console.log(`[ChunkProcessor] Starting processing for ${chunk.id} (${chunk.text.length} chars)`)
  
  try {
    // Wrap entire processing in timeout
    const result = await Promise.race([
      processChunkInternal(chunk, maxWordsPerChunk, documentType, metrics),
      createTimeoutPromise(timeoutMs, chunk.id)
    ])
    
    return result
  } catch (error) {
    // This should never happen due to internal error handling,
    // but catch any unexpected errors
    console.error(`[ChunkProcessor] Unexpected error in ${chunk.id}:`, error)
    
    return {
      chunkId: chunk.id,
      success: false,
      error: {
        code: 'CHUNK_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        stage: 'extraction'
      },
      metrics
    }
  }
}

/**
 * Internal processing logic with isolated error handling
 */
async function processChunkInternal(
  chunk: DocumentChunk,
  maxWordsPerChunk: number,
  documentType: string,
  metrics: ChunkProcessingResult['metrics']
): Promise<ChunkProcessingResult> {
  const chunkId = chunk.id
  
  // Stage 1: Clean chunk text
  let cleanedText: string
  try {
    const cleaningStart = Date.now()
    console.log(`[ChunkProcessor] ${chunkId}: Starting cleaning stage`)
    
    const cleanResult = cleanText({
      rawText: chunk.text,
      documentType
    })
    
    cleanedText = cleanResult.cleanedText
    metrics.cleaningTimeMs = Date.now() - cleaningStart
    
    console.log(`[ChunkProcessor] ${chunkId}: Cleaning completed in ${metrics.cleaningTimeMs}ms`)
    console.log(`[ChunkProcessor] ${chunkId}: Text length: ${chunk.text.length} → ${cleanedText.length}`)
    
    // Validate cleaned text
    if (!cleanedText || cleanedText.trim().length === 0) {
      console.warn(`[ChunkProcessor] ${chunkId}: Cleaning produced empty text`)
      return {
        chunkId,
        success: false,
        error: {
          code: 'CHUNK_CLEANING_FAILED',
          message: 'Cleaning produced empty text',
          stage: 'cleaning'
        },
        metrics
      }
    }
  } catch (error) {
    console.error(`[ChunkProcessor] ${chunkId}: Cleaning failed:`, error)
    return {
      chunkId,
      success: false,
      error: {
        code: 'CHUNK_CLEANING_FAILED',
        message: error instanceof Error ? error.message : 'Cleaning failed',
        stage: 'cleaning'
      },
      metrics
    }
  }
  
  // Stage 2: Extract words from cleaned text
  let extractedWords: string[]
  try {
    const extractionStart = Date.now()
    console.log(`[ChunkProcessor] ${chunkId}: Starting extraction stage (max ${maxWordsPerChunk} words)`)
    
    const extractResult = await extract({
      cleanedText,
      maxWords: maxWordsPerChunk
    })
    
    extractedWords = extractResult.words
    metrics.extractionTimeMs = Date.now() - extractionStart
    
    console.log(`[ChunkProcessor] ${chunkId}: Extraction completed in ${metrics.extractionTimeMs}ms`)
    console.log(`[ChunkProcessor] ${chunkId}: Extracted ${extractedWords.length} words`)
    
    // Validate extracted words
    if (!extractedWords || extractedWords.length === 0) {
      console.warn(`[ChunkProcessor] ${chunkId}: Extraction produced no words`)
      return {
        chunkId,
        success: false,
        error: {
          code: 'CHUNK_EXTRACTION_FAILED',
          message: 'No words extracted from chunk',
          stage: 'extraction'
        },
        metrics
      }
    }
  } catch (error) {
    console.error(`[ChunkProcessor] ${chunkId}: Extraction failed:`, error)
    return {
      chunkId,
      success: false,
      error: {
        code: 'CHUNK_EXTRACTION_FAILED',
        message: error instanceof Error ? error.message : 'Extraction failed',
        stage: 'extraction'
      },
      metrics
    }
  }
  
  // Stage 3: Translate extracted words
  let translations: WordPair[]
  try {
    const translationStart = Date.now()
    console.log(`[ChunkProcessor] ${chunkId}: Starting translation stage (${extractedWords.length} words)`)
    
    const translateResult = await translate({
      words: extractedWords,
      context: cleanedText.slice(0, 500) // Provide context for polysemous words
    })
    
    translations = translateResult.translations
    metrics.translationTimeMs = Date.now() - translationStart
    
    console.log(`[ChunkProcessor] ${chunkId}: Translation completed in ${metrics.translationTimeMs}ms`)
    console.log(`[ChunkProcessor] ${chunkId}: Translated ${translations.length} word pairs`)
    
    // Validate translations
    if (!translations || translations.length === 0) {
      console.warn(`[ChunkProcessor] ${chunkId}: Translation produced no results`)
      return {
        chunkId,
        success: false,
        error: {
          code: 'CHUNK_TRANSLATION_FAILED',
          message: 'Translation produced no results',
          stage: 'translation'
        },
        metrics
      }
    }
  } catch (error) {
    console.error(`[ChunkProcessor] ${chunkId}: Translation failed:`, error)
    return {
      chunkId,
      success: false,
      error: {
        code: 'CHUNK_TRANSLATION_FAILED',
        message: error instanceof Error ? error.message : 'Translation failed',
        stage: 'translation'
      },
      metrics
    }
  }
  
  // Calculate total token usage (estimate from extraction + translation)
  // Note: Actual token usage would come from LLM responses
  metrics.tokensUsed = estimateTokenUsage(cleanedText.length, extractedWords.length)
  
  const totalTime = metrics.cleaningTimeMs + metrics.extractionTimeMs + metrics.translationTimeMs
  console.log(`[ChunkProcessor] ${chunkId}: ✅ Processing completed successfully in ${totalTime}ms`)
  console.log(`[ChunkProcessor] ${chunkId}: Metrics - cleaning: ${metrics.cleaningTimeMs}ms, extraction: ${metrics.extractionTimeMs}ms, translation: ${metrics.translationTimeMs}ms, tokens: ${metrics.tokensUsed}`)
  
  // Log performance warnings using configured thresholds
  const chunkConfig = getChunkingConfig()
  const warningThreshold = chunkConfig.processingWarningMs
  const tokenWarningThreshold = chunkConfig.tokenUsageWarningThreshold
  
  if (metrics.extractionTimeMs > warningThreshold) {
    console.warn(`[ChunkProcessor] ${chunkId}: ⚠️ Extraction took ${metrics.extractionTimeMs}ms (>${warningThreshold}ms threshold)`)
  }
  
  if (metrics.translationTimeMs > warningThreshold) {
    console.warn(`[ChunkProcessor] ${chunkId}: ⚠️ Translation took ${metrics.translationTimeMs}ms (>${warningThreshold}ms threshold)`)
  }
  
  if (metrics.tokensUsed > tokenWarningThreshold) {
    console.warn(`[ChunkProcessor] ${chunkId}: ⚠️ High token usage: ${metrics.tokensUsed} tokens (>${tokenWarningThreshold} threshold)`)
  }
  
  return {
    chunkId,
    success: true,
    words: translations,
    metrics
  }
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(
  timeoutMs: number,
  chunkId: string
): Promise<ChunkProcessingResult> {
  return new Promise<ChunkProcessingResult>((_, reject) => {
    setTimeout(() => {
      console.error(`[ChunkProcessor] ${chunkId}: ⏱️ Timeout after ${timeoutMs}ms`)
      reject(new Error(`Chunk processing timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  }).catch((): ChunkProcessingResult => {
    // Convert timeout rejection to error result
    return {
      chunkId,
      success: false,
      error: {
        code: 'CHUNK_TIMEOUT',
        message: `Processing timeout after ${timeoutMs}ms`,
        stage: 'extraction' as const
      },
      metrics: {
        cleaningTimeMs: 0,
        extractionTimeMs: 0,
        translationTimeMs: 0,
        tokensUsed: 0
      }
    }
  })
}

/**
 * Estimate token usage based on text length and word count
 * This is a rough estimate; actual usage comes from LLM responses
 */
function estimateTokenUsage(textLength: number, wordCount: number): number {
  // Rough estimates:
  // - Extraction: ~1 token per 4 characters of input + output tokens
  // - Translation: ~20 tokens per word pair
  const extractionTokens = Math.ceil(textLength / 4) + (wordCount * 2)
  const translationTokens = wordCount * 20
  
  return extractionTokens + translationTokens
}
