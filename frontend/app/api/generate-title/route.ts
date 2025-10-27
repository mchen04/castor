import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { generateConversationTitle } from '@/lib/openrouter/title-generator'

/**
 * POST /api/generate-title
 * Generate a conversation title from query and response using LLM
 */
export async function POST(req: Request) {
  try {
    // Verify user has active subscription
    await verifySubscription()

    // Parse request body
    const body = await req.json()
    const { query, response } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: query' },
        { status: 400 }
      )
    }

    if (!response || typeof response !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: response' },
        { status: 400 }
      )
    }

    // Generate title using OpenRouter with fallback cascade
    const title = await generateConversationTitle({ query, response })

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Generate title endpoint error:', error)

    // Handle authentication errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/generate-title
 * Handle CORS preflight (same-origin only)
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  })
}
