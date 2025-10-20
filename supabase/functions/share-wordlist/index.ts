/**
 * Share Wordlist Edge Function
 * 
 * Enables or disables sharing for a wordlist, generating secure share tokens
 * and managing share settings like anonymous mode.
 * 
 * Requirements: FR1, NFR3
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts'
import { generateShareToken, validateShareToken } from '../_shared/utils/shareToken.ts'

interface ShareWordlistRequest {
  wordlistId: string
  enable: boolean
  settings?: {
    anonymousMode?: boolean
  }
}

interface ShareWordlistResponse {
  success: boolean
  shareToken?: string
  shareUrl?: string
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

    // Get and validate session ID (authorization check)
    const auth = getSessionId(req)

    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error)
    }

    const sessionId = auth.sessionId

    // Parse request
    const { wordlistId, enable, settings }: ShareWordlistRequest = await req.json()

    // Validate input
    if (!wordlistId || typeof enable !== 'boolean') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: wordlistId, enable',
          },
        } as ShareWordlistResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Verify ownership: Check that the wordlist belongs to this session
    const { data: wordlist, error: fetchError } = await supabaseClient
      .from('wordlists')
      .select('id, session_id, share_token, is_shared')
      .eq('id', wordlistId)
      .single()

    if (fetchError || !wordlist) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'WORDLIST_NOT_FOUND',
            message: 'Wordlist not found',
          },
        } as ShareWordlistResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Authorization check: Only owner can share/unshare
    if (wordlist.session_id !== sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this wordlist',
          },
        } as ShareWordlistResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    if (enable) {
      // Enable sharing
      let shareToken = wordlist.share_token

      // Generate new token if one doesn't exist
      if (!shareToken) {
        shareToken = generateShareToken()
        
        // Validate the generated token (sanity check)
        if (!validateShareToken(shareToken)) {
          throw new Error('Failed to generate valid share token')
        }
      }

      // Prepare share settings
      const shareSettings = {
        anonymous_mode: settings?.anonymousMode ?? false,
      }

      // Update wordlist with sharing enabled
      const { error: updateError } = await supabaseClient
        .from('wordlists')
        .update({
          share_token: shareToken,
          is_shared: true,
          share_settings: shareSettings,
          shared_at: wordlist.is_shared ? undefined : new Date().toISOString(), // Only set on first share
        })
        .eq('id', wordlistId)
        .eq('session_id', sessionId) // Double-check ownership

      if (updateError) {
        console.error('Database error enabling sharing:', updateError)
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: `Failed to enable sharing: ${updateError.message}`,
            },
          } as ShareWordlistResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      // Generate share URL
      const baseUrl = Deno.env.get('PUBLIC_APP_URL') || 'http://localhost:5173'
      const shareUrl = `${baseUrl}/practice/${shareToken}`

      console.log(`Enabled sharing for wordlist ${wordlistId} with token ${shareToken}`)

      return new Response(
        JSON.stringify({
          success: true,
          shareToken,
          shareUrl,
        } as ShareWordlistResponse),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    } else {
      // Disable sharing
      const { error: updateError } = await supabaseClient
        .from('wordlists')
        .update({
          is_shared: false,
        })
        .eq('id', wordlistId)
        .eq('session_id', sessionId) // Double-check ownership

      if (updateError) {
        console.error('Database error disabling sharing:', updateError)
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: `Failed to disable sharing: ${updateError.message}`,
            },
          } as ShareWordlistResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      console.log(`Disabled sharing for wordlist ${wordlistId}`)

      return new Response(
        JSON.stringify({
          success: true,
        } as ShareWordlistResponse),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      } as ShareWordlistResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
