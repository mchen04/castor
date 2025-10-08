import { createClient } from 'jsr:@supabase/supabase-js@2'

const DIFY_API_URL = 'https://api.dify.ai/v1'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Verify Clerk JWT via Supabase (configured as third-party auth provider)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get Clerk user ID from JWT sub claim
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

    // Extract Clerk user ID from JWT (sub claim contains clerk_id)
    const clerkUserId = user.id

    // Verify user has paid subscription
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('has_paid, stripe_subscription_status')
      .eq('clerk_id', clerkUserId)
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

    // Parse query parameters
    const url = new URL(req.url)
    const conversationId = url.searchParams.get('conversationId')
    const limit = url.searchParams.get('limit') || '50'
    const firstId = url.searchParams.get('first_id')

    if (!conversationId) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: conversationId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build query parameters for Dify API
    const queryParams = new URLSearchParams({ limit })
    if (firstId) {
      queryParams.append('first_id', firstId)
    }

    // Call Dify API to get conversation history
    const difyResponse = await fetch(
      `${DIFY_API_URL}/conversations/${conversationId}/messages?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
        },
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

    const messages = await difyResponse.json()

    return new Response(JSON.stringify(messages), {
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
