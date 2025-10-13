import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts';

interface SharePracticeSetRequest {
  practiceSetId: string;
}

interface SharePracticeSetResponse {
  shareUrl: string;
  fullUrl: string;
}

/**
 * Generate a cryptographically secure URL slug for sharing
 */
function generateSecureSlug(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle health checks gracefully
  if (isHealthCheck(req)) {
    return createHealthCheckResponse();
  }

  try {
    // Get and validate session ID
    const auth = getSessionId(req);
    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error);
    }

    const sessionId = auth.sessionId;

    // Parse request body
    const { practiceSetId }: SharePracticeSetRequest = await req.json();

    if (!practiceSetId) {
      return new Response(
        JSON.stringify({ error: 'Practice set ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the practice set exists and belongs to the user
    const { data: practiceSet, error: fetchError } = await supabase
      .from('practice_sets')
      .select('id, wordlist_id, share_url, is_shared')
      .eq('id', practiceSetId)
      .single();

    if (fetchError || !practiceSet) {
      return new Response(
        JSON.stringify({ error: 'Practice set not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership through wordlist
    const { data: wordlist, error: wordlistError } = await supabase
      .from('wordlists')
      .select('session_id')
      .eq('id', practiceSet.wordlist_id)
      .single();

    if (wordlistError || !wordlist || wordlist.session_id !== sessionId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to practice set' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already shared, return existing URL
    if (practiceSet.is_shared && practiceSet.share_url) {
      const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || '';
      const fullUrl = `${baseUrl}/functions/v1/get-shared-practice/${practiceSet.share_url}`;
      
      return new Response(
        JSON.stringify({
          shareUrl: practiceSet.share_url,
          fullUrl
        } as SharePracticeSetResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new secure URL slug
    let shareUrl: string;
    let attempts = 0;
    const maxAttempts = 5;

    // Retry loop to handle potential collisions
    while (attempts < maxAttempts) {
      shareUrl = generateSecureSlug();
      
      // Check if URL already exists
      const { data: existing } = await supabase
        .from('practice_sets')
        .select('id')
        .eq('share_url', shareUrl)
        .single();

      if (!existing) {
        break;
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate unique share URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update practice set with share URL
    const { error: updateError } = await supabase
      .from('practice_sets')
      .update({
        share_url: shareUrl!,
        is_shared: true
      })
      .eq('id', practiceSetId);

    if (updateError) {
      console.error('Error updating practice set:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate share URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct full URL
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || '';
    const fullUrl = `${baseUrl}/functions/v1/get-shared-practice/${shareUrl!}`;

    return new Response(
      JSON.stringify({
        shareUrl: shareUrl!,
        fullUrl
      } as SharePracticeSetResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in share-practice-set:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
