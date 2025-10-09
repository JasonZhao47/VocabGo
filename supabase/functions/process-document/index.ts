/**
 * Process Document Edge Function
 * 
 * Handles document upload and immediate processing through the AI pipeline:
 * 1. Parse document (PDF, TXT, DOCX, XLSX)
 * 2. Clean text (remove noise)
 * 3. Extract words (up to 40 English words)
 * 4. Translate words (to Mandarin)
 * 
 * Returns the wordlist directly (no queue, synchronous processing)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import parsers
import { parsePDF } from '../_shared/parsers/pdf.ts'
import { parseTXT } from '../_shared/parsers/txt.ts'
import { parseDOCX } from '../_shared/parsers/docx.ts'
import { parseXLSX } from '../_shared/parsers/xlsx.ts'

// Import AI services
import { cleanText } from '../_shared/agents/cleaner.ts'
import { extract } from '../_shared/agents/extractor.ts'
import { translate } from '../_shared/agents/translator.ts'

// Types
interface ProcessRequest {
  file: {
    name: string
    type: string
    data: string // base64 encoded
  }
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
      cleaning: number
      extraction: number
      translation: number
    }
  }
}

// Supported file types
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

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

  try {
    const startTime = Date.now()
    const stages = {
      parsing: 0,
      cleaning: 0,
      extraction: 0,
      translation: 0,
    }

    // Parse request
    const { file }: ProcessRequest = await req.json()

    if (!file || !file.name || !file.type || !file.data) {
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
    const documentType = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
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
    let rawText: string

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
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CLEANING_FAILED',
            message: `Failed to clean text: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        } as ProcessResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    stages.cleaning = Date.now() - cleanStart
    console.log(`Cleaned text in ${stages.cleaning}ms`)

    // Stage 3: Extract words
    const extractStart = Date.now()
    let words: string[]

    try {
      const extractResult = await extract({
        cleanedText,
        maxWords: 40,
      })
      words = extractResult.words
      console.log(`Extracted ${words.length} words (confidence: ${extractResult.confidence.toFixed(2)})`)
    } catch (error) {
      console.error('Extraction error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'EXTRACTION_FAILED',
            message: `Failed to extract words: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        } as ProcessResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
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
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'TRANSLATION_FAILED',
            message: `Failed to translate words: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        } as ProcessResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    stages.translation = Date.now() - translateStart
    console.log(`Translated words in ${stages.translation}ms`)

    const totalTime = Date.now() - startTime
    console.log(`Total processing time: ${totalTime}ms`)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        wordlist: {
          words: wordPairs,
          filename: file.name,
          documentType,
          wordCount: wordPairs.length,
        },
        metadata: {
          processingTimeMs: totalTime,
          stages,
        },
      } as ProcessResponse),
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
