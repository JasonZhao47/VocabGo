/**
 * Process Document Edge Function
 * 
 * Handles document upload and immediate processing through the AI pipeline:
 * 1. Parse document (PDF, TXT, DOCX, XLSX)
 * 2. Chunk document (if > 8,000 characters)
 * 3. Process each chunk: clean → extract → translate
 * 4. Combine chunk results into single wordlist
 * 
 * Returns the wordlist directly (no queue, synchronous processing)
 * Supports chunk-based processing for resilience and large document handling
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isHealthCheck, createHealthCheckResponse } from '../_shared/auth.ts'

// Import parsers
import { parsePDF } from '../_shared/parsers/pdf.ts'
import { parseTXT } from '../_shared/parsers/txt.ts'
import { parseDOCX } from '../_shared/parsers/docx.ts'
import { parseXLSX } from '../_shared/parsers/xlsx.ts'

// Import AI services (legacy single-pass processing)
import { cleanText } from '../_shared/agents/cleaner.ts'
import { extract } from '../_shared/agents/extractor.ts'
import { translate } from '../_shared/agents/translator.ts'

// Import chunk-based processing
import { chunkDocument } from '../_shared/chunking/documentChunker.ts'
import { processChunk } from '../_shared/processing/chunkProcessor.ts'
import { combineWordlists } from '../_shared/combining/wordlistCombiner.ts'
import { getChunkingConfig } from '../_shared/config/chunkingConfig.ts'
import type { ChunkProcessingResult } from '../_shared/processing/chunkProcessor.ts'

// Types
interface ProcessRequest {
  // Option 1: Binary file (existing)
  file?: {
    name: string
    type: string
    data: string // base64 encoded
  }
  // Option 2: Pre-extracted text (new)
  extractedText?: {
    text: string
    filename: string
    documentType: 'docx'
    metadata: {
      characterCount: number
      extractionTimeMs: number
    }
  }
  // Optional: Maximum words in final wordlist (10-50, default 40)
  maxWords?: number
}

interface ChunkProgress {
  chunkId: string
  position: number
  totalChunks: number
  status: 'processing' | 'completed' | 'failed'
  wordsExtracted?: number
  error?: string
}

interface ProcessResponse {
  success: boolean
  wordlist?: {
    words: Array<{ en: string; zh: string }>
    filename: string
    documentType: string
    wordCount: number
  }
  error?: {
    code: string
    message: string
  }
  metadata?: {
    processingTimeMs: number
    stages: {
      parsing: number
      chunking?: number
      cleaning?: number
      extraction?: number
      translation?: number
      processing?: number  // Total chunk processing time
      combining?: number
    }
    chunking?: {
      totalChunks: number
      successfulChunks: number
      failedChunks: number
      averageChunkSize: number
      duplicatesRemoved: number
    }
    chunkProgress?: ChunkProgress[]  // Track individual chunk progress
  }
  warnings?: string[]
}

// Supported file types
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_CONCURRENT_CHUNKS = 3 // Process up to 3 chunks concurrently

/**
 * Process document using chunk-based approach for large documents
 */
async function processWithChunks(
  rawText: string,
  documentType: string,
  maxWords: number,
  stages: NonNullable<ProcessResponse['metadata']>['stages']
): Promise<{
  success: boolean
  wordPairs: Array<{ en: string; zh: string }>
  chunkingMetadata?: {
    totalChunks: number
    successfulChunks: number
    failedChunks: number
    averageChunkSize: number
    duplicatesRemoved: number
  }
  chunkProgress?: ChunkProgress[]
  warnings: string[]
  error?: { code: string; message: string }
}> {
  const warnings: string[] = []
  
  // Stage 1: Chunk the document
  const chunkingStart = Date.now()
  let chunks
  
  try {
    const chunkingResult = chunkDocument(rawText)
    chunks = chunkingResult.chunks
    stages.chunking = Date.now() - chunkingStart
    
    console.log(`Chunked document into ${chunks.length} chunks (avg size: ${chunkingResult.metadata.averageChunkSize} chars)`)
  } catch (error) {
    console.error('Chunking error:', error)
    return {
      success: false,
      wordPairs: [],
      warnings: [],
      error: {
        code: 'CHUNKING_FAILED',
        message: `Failed to chunk document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
  
  // Stage 2: Process chunks concurrently (max 3 at a time)
  const processingStart = Date.now()
  const chunkResults: ChunkProcessingResult[] = []
  const chunkProgress: ChunkProgress[] = []
  
  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_CHUNKS) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_CHUNKS)
    console.log(`Processing chunk batch ${Math.floor(i / MAX_CONCURRENT_CHUNKS) + 1} (chunks ${i + 1}-${Math.min(i + MAX_CONCURRENT_CHUNKS, chunks.length)} of ${chunks.length})`)
    
    const batchResults = await Promise.allSettled(
      batch.map(chunk => processChunk({
        chunk,
        maxWordsPerChunk: 50, // Allow up to 50 words per chunk
        documentType,
        timeoutMs: 30000
      }))
    )
    
    // Convert settled promises to results
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j]
      const chunk = batch[j]
      
      if (result.status === 'fulfilled') {
        chunkResults.push(result.value)
        
        if (result.value.success) {
          console.log(`✅ Chunk ${chunk.id} processed successfully: ${result.value.words?.length || 0} words, ${result.value.metrics.tokensUsed} tokens`)
          
          // Track progress for successful chunk
          chunkProgress.push({
            chunkId: chunk.id,
            position: chunk.position,
            totalChunks: chunks.length,
            status: 'completed',
            wordsExtracted: result.value.words?.length || 0
          })
        } else {
          console.error(`❌ Chunk ${chunk.id} failed: ${result.value.error?.message}`)
          
          // Track progress for failed chunk
          chunkProgress.push({
            chunkId: chunk.id,
            position: chunk.position,
            totalChunks: chunks.length,
            status: 'failed',
            error: result.value.error?.message
          })
        }
      } else {
        // Promise rejected - create error result
        console.error(`❌ Chunk ${chunk.id} promise rejected:`, result.reason)
        chunkResults.push({
          chunkId: chunk.id,
          success: false,
          error: {
            code: 'CHUNK_PROCESSING_ERROR',
            message: result.reason?.message || 'Unknown error',
            stage: 'extraction'
          },
          metrics: {
            cleaningTimeMs: 0,
            extractionTimeMs: 0,
            translationTimeMs: 0,
            tokensUsed: 0
          }
        })
        
        // Track progress for rejected chunk
        chunkProgress.push({
          chunkId: chunk.id,
          position: chunk.position,
          totalChunks: chunks.length,
          status: 'failed',
          error: result.reason?.message || 'Unknown error'
        })
      }
    }
  }
  
  stages.processing = Date.now() - processingStart
  console.log(`Processed all chunks in ${stages.processing}ms`)
  
  // Calculate total token usage and log warning if excessive
  const totalTokens = chunkResults.reduce((sum, r) => sum + r.metrics.tokensUsed, 0)
  console.log(`Total tokens used: ${totalTokens}`)
  
  if (totalTokens > 50000) {
    console.warn(`⚠️ High token usage detected: ${totalTokens} tokens (threshold: 50,000)`)
  }
  
  // Check if all chunks failed
  const successfulResults = chunkResults.filter(r => r.success)
  const failedResults = chunkResults.filter(r => !r.success)
  
  if (successfulResults.length === 0) {
    console.error('All chunks failed to process')
    return {
      success: false,
      wordPairs: [],
      warnings: [],
      error: {
        code: 'ALL_CHUNKS_FAILED',
        message: `All ${chunks.length} chunks failed to process. First error: ${failedResults[0]?.error?.message || 'Unknown error'}`,
      }
    }
  }
  
  // Stage 3: Combine results
  const combiningStart = Date.now()
  
  const chunkWordlists = successfulResults.map(result => ({
    chunkId: result.chunkId,
    words: result.words || [],
    position: parseInt(result.chunkId.split('-')[1]) // Extract position from "chunk-N"
  }))
  
  const combinedResult = combineWordlists({
    chunkResults: chunkWordlists,
    maxWords,
    priorityStrategy: 'first-chunk'
  })
  
  stages.combining = Date.now() - combiningStart
  console.log(`Combined wordlists in ${stages.combining}ms: ${combinedResult.words.length} words (removed ${combinedResult.metadata.duplicatesRemoved} duplicates)`)
  
  // Generate warnings for partial failures
  if (failedResults.length > 0) {
    const warningMsg = `${successfulResults.length} of ${chunks.length} sections processed successfully`
    warnings.push(warningMsg)
    console.warn(`⚠️ ${warningMsg}`)
  }
  
  // Check if we got any words
  if (combinedResult.words.length === 0) {
    return {
      success: false,
      wordPairs: [],
      warnings,
      error: {
        code: 'NO_WORDS_EXTRACTED',
        message: 'No words could be extracted from any chunk',
      }
    }
  }
  
  // Build chunking metadata
  const chunkingMetadata = {
    totalChunks: chunks.length,
    successfulChunks: successfulResults.length,
    failedChunks: failedResults.length,
    averageChunkSize: Math.round(chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length),
    duplicatesRemoved: combinedResult.metadata.duplicatesRemoved
  }
  
  return {
    success: true,
    wordPairs: combinedResult.words,
    chunkingMetadata,
    chunkProgress,
    warnings
  }
}

/**
 * Process document using legacy single-pass approach for small documents
 */
async function processSinglePass(
  rawText: string,
  documentType: string,
  maxWords: number,
  stages: NonNullable<ProcessResponse['metadata']>['stages']
): Promise<{
  success: boolean
  wordPairs: Array<{ en: string; zh: string }>
  error?: { code: string; message: string }
}> {
  // Stage 2: Clean text
  const cleanStart = Date.now()
  let cleanedText: string

  try {
    const cleanResult = cleanText({
      rawText,
      documentType,
    })
    cleanedText = cleanResult.cleanedText
    console.log(`Cleaned text: ${cleanResult.removedSections.length} pattern types removed`)
  } catch (error) {
    console.error('Cleaning error:', error)
    return {
      success: false,
      wordPairs: [],
      error: {
        code: 'CLEANING_FAILED',
        message: `Failed to clean text: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  stages.cleaning = Date.now() - cleanStart
  console.log(`Cleaned text in ${stages.cleaning}ms`)

  // Stage 3: Extract words
  const extractStart = Date.now()
  let words: string[]

  try {
    const extractResult = await extract({
      cleanedText,
      maxWords,
    })
    words = extractResult.words
    console.log(`Extracted ${words.length} words (confidence: ${extractResult.confidence.toFixed(2)})`)
  } catch (error) {
    console.error('Extraction error:', error)
    return {
      success: false,
      wordPairs: [],
      error: {
        code: 'EXTRACTION_FAILED',
        message: `Failed to extract words: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  stages.extraction = Date.now() - extractStart
  console.log(`Extracted words in ${stages.extraction}ms`)

  // Stage 4: Translate words
  const translateStart = Date.now()
  let wordPairs: Array<{ en: string; zh: string }>

  try {
    const translateResult = await translate({
      words,
      context: cleanedText.slice(0, 500), // First 500 chars for context
    })
    wordPairs = translateResult.translations
    console.log(`Translated ${wordPairs.length} words (confidence: ${translateResult.confidence.toFixed(2)})`)
    
    if (translateResult.fallbackUsed.length > 0) {
      console.warn(`Fallback used for ${translateResult.fallbackUsed.length} words:`, translateResult.fallbackUsed)
    }
  } catch (error) {
    console.error('Translation error:', error)
    return {
      success: false,
      wordPairs: [],
      error: {
        code: 'TRANSLATION_FAILED',
        message: `Failed to translate words: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  stages.translation = Date.now() - translateStart
  console.log(`Translated words in ${stages.translation}ms`)

  return {
    success: true,
    wordPairs
  }
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  // Handle health checks gracefully
  if (isHealthCheck(req)) {
    return createHealthCheckResponse()
  }

  try {
    const startTime = Date.now()
    const stages: ProcessResponse['metadata']['stages'] = {
      parsing: 0,
    }

    // Parse request
    const { file, extractedText, maxWords = 40 }: ProcessRequest = await req.json()
    
    // Validate maxWords parameter
    if (maxWords !== undefined && (maxWords < 10 || maxWords > 50)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_WORD_COUNT',
            message: `maxWords must be between 10 and 50 (received: ${maxWords})`,
          },
        } as ProcessResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Validate that exactly one option is provided
    if (!file && !extractedText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Must provide either file or extractedText',
          },
        } as ProcessResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    if (file && extractedText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Cannot provide both file and extractedText',
          },
        } as ProcessResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    let documentType = ''
    let filename = ''
    let rawText = ''

    // Detect request type and process accordingly
    if (extractedText) {
      // Client-side extraction path
      console.log(`Processing pre-extracted text from ${extractedText.filename} (${extractedText.metadata.characterCount} characters, extracted in ${extractedText.metadata.extractionTimeMs}ms)`)
      
      documentType = extractedText.documentType
      filename = extractedText.filename
      rawText = extractedText.text
      
      // Set parsing time to 0 for client-side extraction
      stages.parsing = 0
    } else if (file) {
      // Server-side extraction path (existing logic)
      if (!file.name || !file.type || !file.data) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Missing required fields: file.name, file.type, file.data',
            },
          } as ProcessResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      // Validate file type
      documentType = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
      if (!documentType) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: `Unsupported file type: ${file.type}. Supported types: PDF, TXT, DOCX, XLSX`,
            },
          } as ProcessResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      filename = file.name

      // Decode base64 file data
      const fileData = Uint8Array.from(atob(file.data), c => c.charCodeAt(0))

      // Validate file size
      if (fileData.length > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds maximum of 50MB`,
            },
          } as ProcessResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      console.log(`Processing ${file.name} (${documentType}, ${fileData.length} bytes)`)

      // Stage 1: Parse document
      const parseStart = Date.now()

      try {
        switch (documentType) {
          case 'pdf':
            rawText = (await parsePDF(fileData.buffer)).text
            break
          case 'txt':
            rawText = (await parseTXT(fileData.buffer)).text
            break
          case 'docx':
            rawText = (await parseDOCX(fileData.buffer)).text
            break
          case 'xlsx':
            rawText = (await parseXLSX(fileData.buffer)).text
            break
          default:
            throw new Error(`Unsupported document type: ${documentType}`)
        }
      } catch (error) {
        console.error('Parse error:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'PARSE_FAILED',
              message: `Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          } as ProcessResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      stages.parsing = Date.now() - parseStart
      console.log(`Parsed document in ${stages.parsing}ms, extracted ${rawText.length} characters`)
    }

    // Truncate extremely large documents to prevent memory issues
    const MAX_TEXT_LENGTH = 100000 // 100k characters (~50 pages)
    if (rawText.length > MAX_TEXT_LENGTH) {
      console.warn(`Document too large (${rawText.length} chars), truncating to ${MAX_TEXT_LENGTH} chars`)
      rawText = rawText.slice(0, MAX_TEXT_LENGTH)
    }

    // Determine if we should use chunk-based processing
    const CHUNK_THRESHOLD = 8000
    const useChunking = rawText.length > CHUNK_THRESHOLD
    
    console.log(`Document length: ${rawText.length} chars, using ${useChunking ? 'chunk-based' : 'single-pass'} processing`)

    let wordPairs: Array<{ en: string; zh: string }>
    const warnings: string[] = []
    let chunkingMetadata: ProcessResponse['metadata']['chunking'] | undefined
    let chunkProgress: ChunkProgress[] | undefined

    if (useChunking) {
      // Chunk-based processing for large documents
      const result = await processWithChunks(rawText, documentType, maxWords, stages)
      
      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error,
          } as ProcessResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }
      
      wordPairs = result.wordPairs
      chunkingMetadata = result.chunkingMetadata
      chunkProgress = result.chunkProgress
      
      // Add warnings if some chunks failed
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings)
      }
    } else {
      // Legacy single-pass processing for small documents
      const result = await processSinglePass(rawText, documentType, maxWords, stages)
      
      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error,
          } as ProcessResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }
      
      wordPairs = result.wordPairs
    }

    const totalTime = Date.now() - startTime
    console.log(`Total processing time: ${totalTime}ms`)

    // Build response
    const response: ProcessResponse = {
      success: true,
      wordlist: {
        words: wordPairs,
        filename,
        documentType,
        wordCount: wordPairs.length,
      },
      metadata: {
        processingTimeMs: totalTime,
        stages,
        ...(chunkingMetadata && { chunking: chunkingMetadata }),
        ...(chunkProgress && { chunkProgress })
      },
      ...(warnings.length > 0 && { warnings })
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      } as ProcessResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
