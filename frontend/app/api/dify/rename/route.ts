import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'

/**
 * POST /api/dify/rename
 * Rename a conversation
 */
export async function POST(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Parse request body
    const body = await req.json()
    const { conversationId, name, autoGenerate } = body

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: conversationId' },
        { status: 400 }
      )
    }

    if (!name && !autoGenerate) {
      return NextResponse.json(
        { error: 'Either name or autoGenerate must be provided' },
        { status: 400 }
      )
    }

    // Rename conversation via Dify API
    const difyClient = new DifyClient()
    const difyResponse = await difyClient.renameConversation({
      conversationId,
      userId: user.clerkId,
      name: name || undefined,
      autoGenerate: autoGenerate || false,
    })

    // Parse and return JSON response
    const data = await difyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Rename endpoint error:', error)

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
 * OPTIONS /api/dify/rename
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
