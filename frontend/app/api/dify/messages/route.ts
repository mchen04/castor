import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'

/**
 * GET /api/dify/messages
 * Get messages from a conversation
 */
export async function GET(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')
    const limit = searchParams.get('limit') || '20'
    const firstId = searchParams.get('first_id') || undefined

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: conversationId' },
        { status: 400 }
      )
    }

    // Get messages from Dify API
    const difyClient = new DifyClient()
    const difyResponse = await difyClient.getMessages({
      conversationId,
      userId: user.clerkId,
      limit: parseInt(limit),
      firstId,
    })

    // Parse and return JSON response
    const data = await difyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Messages endpoint error:', error)

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
 * OPTIONS /api/dify/messages
 * Handle CORS preflight (same-origin only)
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  })
}
