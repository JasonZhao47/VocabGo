/**
 * Cleanup Practice Cache Edge Function
 * 
 * Removes expired practice sets that are not shared
 * Runs periodically to maintain database hygiene
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isHealthCheck, createHealthCheckResponse } from '../_shared/auth.ts'

const CACHE_DURATION_HOURS = 24

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate expiration threshold
    const expirationThreshold = new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000)

    console.log(`Cleaning up practice sets older than ${expirationThreshold.toISOString()}`)

    // Delete expired practice sets that are not shared
    const { data, error } = await supabase
      .from('practice_sets')
      .delete()
      .eq('is_shared', false)
      .lt('created_at', expirationThreshold.toISOString())
      .select('id')

    if (error) {
      console.error('Cleanup error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CLEANUP_FAILED',
            message: error.message,
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    const deletedCount = data?.length || 0
    console.log(`Cleaned up ${deletedCount} expired practice sets`)

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        threshold: expirationThreshold.toISOString(),
      }),
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
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
