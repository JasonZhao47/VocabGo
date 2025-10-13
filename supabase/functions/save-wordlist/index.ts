/**
 * Save Wordlist Edge Function
 * 
 * Saves a wordlist to the database for later retrieval
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts'

interface SaveRequest {
  filename: string
  documentType: string
  words: Array<{ en: string; zh: string }>
}

interface SaveResponse {
  success: boolean
  wordlistId?: string
  error?: {
    code: string
    message: string
  }
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
      },
    })
  }

  // Handle health checks gracefully
  if (isHealthCheck(req)) {
    return createHealthCheckResponse()
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get and validate session ID
    const auth = getSessionId(req)

    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error)
    }

    const sessionId = auth.sessionId

    // Parse request
    const { filename, documentType, words }: SaveRequest = await req.json()

    // Validate input
    if (!filename || !documentType || !words || !Array.isArray(words)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: filename, documentType, words',
          },
        } as SaveResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Validate word count
    if (words.length === 0 || words.length > 40) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_WORD_COUNT',
            message: 'Word count must be between 1 and 40',
          },
        } as SaveResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Validate word structure
    for (const word of words) {
      if (!word.en || !word.zh || typeof word.en !== 'string' || typeof word.zh !== 'string') {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_WORD_FORMAT',
              message: 'Each word must have "en" and "zh" string properties',
            },
          } as SaveResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }
    }

    // Insert wordlist into database
    const { data, error } = await supabaseClient
      .from('wordlists')
      .insert({
        session_id: sessionId,
        filename,
        document_type: documentType,
        word_count: words.length,
        words,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to save wordlist: ${error.message}`,
          },
        } as SaveResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    console.log(`Saved wordlist ${data.id} for session ${sessionId}`)

    return new Response(
      JSON.stringify({
        success: true,
        wordlistId: data.id,
      } as SaveResponse),
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
      } as SaveResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
