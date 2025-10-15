import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit'

/**
 * POST /api/dify/chat
 * Send a chat message and stream the response
 */
export async function POST(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Rate limiting (best practice: prevent abuse)
    const rateLimit = checkRateLimit(user.clerkId, {
      maxRequests: 30,     // 30 messages
      windowMs: 60 * 1000, // per minute
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const { query, conversationId } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: query' },
        { status: 400 }
      )
    }

    // Generate trace ID for distributed tracing (best practice)
    const traceId = crypto.randomUUID()
    console.log(`[${traceId}] Chat request from user ${user.clerkId}`)

    // Send message to Dify API
    const difyClient = new DifyClient()
    const difyResponse = await difyClient.sendChatMessage({
      query,
      userId: user.clerkId,
      conversationId: conversationId || undefined,
      traceId,
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
