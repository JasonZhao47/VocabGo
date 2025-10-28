/**
 * Register Student Session Edge Function
 * 
 * Creates or retrieves a student session for practicing a shared wordlist.
 * Uses browser fingerprinting for lightweight identity without authentication.
 * 
 * Requirements: FR2, NFR3, NFR4
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateShareToken } from '../_shared/utils/shareToken.ts'
import { 
  generateSessionToken, 
  validateDeviceInfo, 
  type DeviceInfo 
} from '../_shared/utils/deviceFingerprint.ts'

interface RegisterStudentRequest {
  shareToken: string
  nickname: string
  deviceInfo: DeviceInfo
}

interface WordPair {
  en: string
  zh: string
}

interface RegisterStudentResponse {
  success: boolean
  sessionId?: string
  sessionToken?: string
  wordlist?: {
    id: string
    title: string
    words: WordPair[]
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Validate nickname format
 * - Must be 2-20 characters
 * - Supports Unicode (Chinese, emoji, etc.)
 * - Trims whitespace
 */
function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'Nickname is required' }
  }

  const trimmed = nickname.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Nickname must be at least 2 characters' }
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Nickname must be at most 20 characters' }
  }

  return { valid: true }
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

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request
    const { shareToken, nickname, deviceInfo }: RegisterStudentRequest = await req.json()

    // Validate share token format
    if (!validateShareToken(shareToken)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_SHARE_TOKEN',
            message: 'Invalid share token format',
          },
        } as RegisterStudentResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Validate nickname
    const nicknameValidation = validateNickname(nickname)
    if (!nicknameValidation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_NICKNAME',
            message: nicknameValidation.error,
          },
        } as RegisterStudentResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Validate device info
    console.log('Received deviceInfo:', JSON.stringify(deviceInfo))
    if (!validateDeviceInfo(deviceInfo)) {
      console.error('Device info validation failed:', deviceInfo)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_DEVICE_INFO',
            message: 'Device information is incomplete or invalid',
          },
        } as RegisterStudentResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Look up wordlist by share token
    const { data: wordlist, error: wordlistError } = await supabaseClient
      .from('wordlists')
      .select('id, filename, words, is_shared')
      .eq('share_token', shareToken)
      .eq('is_shared', true)
      .single()

    if (wordlistError || !wordlist) {
      console.error('Wordlist lookup error:', wordlistError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'WORDLIST_NOT_FOUND',
            message: 'Wordlist not found or sharing is disabled',
          },
        } as RegisterStudentResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Generate session token from device fingerprint
    const sessionToken = await generateSessionToken(deviceInfo)
    const trimmedNickname = nickname.trim()

    // Check for existing session (same wordlist + nickname + device)
    const { data: existingSession, error: sessionLookupError } = await supabaseClient
      .from('student_sessions')
      .select('id, session_token')
      .eq('wordlist_id', wordlist.id)
      .eq('nickname', trimmedNickname)
      .eq('session_token', sessionToken)
      .maybeSingle()

    if (sessionLookupError) {
      console.error('Session lookup error:', sessionLookupError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to check existing session: ${sessionLookupError.message}`,
          },
        } as RegisterStudentResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    let sessionId: string

    if (existingSession) {
      // Update last_active_at for existing session
      sessionId = existingSession.id

      const { error: updateError } = await supabaseClient
        .from('student_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', sessionId)

      if (updateError) {
        console.error('Session update error:', updateError)
        // Non-fatal - continue with existing session
      }

      console.log(`Reusing existing session ${sessionId} for ${trimmedNickname}`)
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabaseClient
        .from('student_sessions')
        .insert({
          wordlist_id: wordlist.id,
          nickname: trimmedNickname,
          session_token: sessionToken,
          device_info: deviceInfo,
        })
        .select('id')
        .single()

      if (createError || !newSession) {
        console.error('Session creation error:', createError)
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: `Failed to create session: ${createError?.message || 'Unknown error'}`,
            },
          } as RegisterStudentResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      sessionId = newSession.id
      console.log(`Created new session ${sessionId} for ${trimmedNickname}`)
    }

    // Return session data and wordlist
    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        sessionToken,
        wordlist: {
          id: wordlist.id,
          title: wordlist.filename,
          words: wordlist.words,
        },
      } as RegisterStudentResponse),
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
      } as RegisterStudentResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
