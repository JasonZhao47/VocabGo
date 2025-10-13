import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { isHealthCheck, createHealthCheckResponse } from '../_shared/auth.ts';

/**
 * Retrieve a shared practice set by its URL slug
 * This endpoint is publicly accessible and does not require authentication
 */
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
    // Extract share URL from path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const shareUrl = pathParts[pathParts.length - 1];

    if (!shareUrl) {
      return new Response(
        JSON.stringify({ error: 'Share URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the shared practice set
    const { data: practiceSet, error: fetchError } = await supabase
      .from('practice_sets')
      .select(`
        id,
        questions,
        created_at,
        wordlists (
          name,
          word_pairs
        )
      `)
      .eq('share_url', shareUrl)
      .eq('is_shared', true)
      .single();

    if (fetchError || !practiceSet) {
      return new Response(
        JSON.stringify({ error: 'Practice set not found or not shared' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the practice set data
    return new Response(
      JSON.stringify({
        id: practiceSet.id,
        questions: practiceSet.questions,
        wordlistName: practiceSet.wordlists?.name || 'Untitled Wordlist',
        createdAt: practiceSet.created_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-shared-practice:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
