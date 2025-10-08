import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'

/**
 * POST /api/dify/delete
 * Delete a conversation
 */
export async function POST(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Parse request body
    const body = await req.json()
    const { conversationId } = body

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: conversationId' },
        { status: 400 }
      )
    }

    // Delete conversation via Dify API
    const difyClient = new DifyClient()
    await difyClient.deleteConversation({
      conversationId,
      userId: user.clerkId,
    })

    // Return success (Dify returns 204 No Content)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete endpoint error:', error)

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
 * OPTIONS /api/dify/delete
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
