import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'

/**
 * POST /api/dify/chat
 * Send a chat message and stream the response
 */
export async function POST(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Parse request body
    const body = await req.json()
    const { query, conversationId } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: query' },
        { status: 400 }
      )
    }

    // Send message to Dify API
    const difyClient = new DifyClient()
    const difyResponse = await difyClient.sendChatMessage({
      query,
      userId: user.clerkId,
      conversationId: conversationId || undefined,
    })

    // Forward the SSE stream from Dify to client
    return new Response(difyResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in Nginx
      },
    })
  } catch (error) {
    console.error('Chat endpoint error:', error)

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
 * OPTIONS /api/dify/chat
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
