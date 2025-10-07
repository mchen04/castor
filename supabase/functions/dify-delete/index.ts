import { createClient } from 'jsr:@supabase/supabase-js@2'

const DIFY_API_URL = 'https://api.dify.ai/v1'

interface DifyDeleteRequest {
  conversationId: string
  userId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Get Dify API key from environment
    const DIFY_API_KEY = Deno.env.get('DIFY_API_KEY')
    if (!DIFY_API_KEY) {
      throw new Error('DIFY_API_KEY not configured')
    }

    // Verify user authentication via Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify user has paid subscription
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('has_paid, stripe_subscription_status')
      .eq('clerk_id', user.id)
      .single()

    if (
      userError ||
      !userData?.has_paid ||
      !['active', 'trialing', 'past_due'].includes(userData.stripe_subscription_status || '')
    ) {
      return new Response(JSON.stringify({ error: 'Subscription required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { conversationId, userId }: DifyDeleteRequest = await req.json()

    if (!conversationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: conversationId, userId' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Call Dify API to delete conversation
    const difyResponse = await fetch(
      `${DIFY_API_URL}/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
        }),
      }
    )

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text()
      console.error('Dify API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Dify API error', details: errorText }),
        {
          status: difyResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Dify returns 204 No Content on successful delete
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
