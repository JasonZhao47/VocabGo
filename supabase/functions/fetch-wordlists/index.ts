/**
 * Fetch Wordlists Edge Function
 * 
 * Retrieves all saved wordlists for the authenticated user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WordlistRecord {
  id: string
  filename: string
  documentType: string
  wordCount: number
  words: Array<{ en: string; zh: string }>
  createdAt: string
}

interface FetchResponse {
  success: boolean
  wordlists?: WordlistRecord[]
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
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
      },
    })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get session ID from custom header
    const sessionId = req.headers.get('X-Session-ID')
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Session ID required',
          },
        } as FetchResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Fetch wordlists from database
    const { data, error } = await supabaseClient
      .from('wordlists')
      .select('id, filename, document_type, word_count, words, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to fetch wordlists: ${error.message}`,
          },
        } as FetchResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Transform data to match frontend interface
    const wordlists: WordlistRecord[] = (data || []).map((row) => ({
      id: row.id,
      filename: row.filename,
      documentType: row.document_type,
      wordCount: row.word_count,
      words: row.words,
      createdAt: row.created_at,
    }))

    console.log(`Fetched ${wordlists.length} wordlists for session ${sessionId}`)

    return new Response(
      JSON.stringify({
        success: true,
        wordlists,
      } as FetchResponse),
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
      } as FetchResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
