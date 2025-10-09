/**
 * Delete Wordlist Edge Function
 * 
 * Deletes a saved wordlist from the database
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DeleteRequest {
  wordlistId: string
}

interface DeleteResponse {
  success: boolean
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
        'Access-Control-Allow-Methods': 'POST, DELETE',
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
        } as DeleteResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Parse request
    const { wordlistId }: DeleteRequest = await req.json()

    if (!wordlistId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: wordlistId',
          },
        } as DeleteResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Delete wordlist from database (session-based filtering)
    const { error } = await supabaseClient
      .from('wordlists')
      .delete()
      .eq('id', wordlistId)
      .eq('session_id', sessionId)

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to delete wordlist: ${error.message}`,
          },
        } as DeleteResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    console.log(`Deleted wordlist ${wordlistId} for session ${sessionId}`)

    return new Response(
      JSON.stringify({
        success: true,
      } as DeleteResponse),
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
      } as DeleteResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
