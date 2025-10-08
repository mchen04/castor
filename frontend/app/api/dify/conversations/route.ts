import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'

/**
 * GET /api/dify/conversations
 * List conversations for the authenticated user
 */
export async function GET(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '20'
    const lastId = searchParams.get('last_id') || undefined

    // Get conversations from Dify API
    const difyClient = new DifyClient()
    const difyResponse = await difyClient.getConversations({
      userId: user.clerkId,
      limit: parseInt(limit),
      lastId,
    })

    // Parse and return JSON response
    const data = await difyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Conversations endpoint error:', error)

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
 * OPTIONS /api/dify/conversations
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
