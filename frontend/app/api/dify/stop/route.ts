import { NextResponse } from 'next/server'
import { verifySubscription, AuthError } from '@/lib/auth/verify-subscription'
import { DifyClient } from '@/lib/dify/client'

/**
 * POST /api/dify/stop
 * Stop a streaming chat response
 * Only supported in streaming mode
 */
export async function POST(req: Request) {
  try {
    // Verify user has active subscription
    const user = await verifySubscription()

    // Parse request body
    const body = await req.json()
    const { taskId } = body

    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: taskId' },
        { status: 400 }
      )
    }

    // Stop generation via Dify API
    const difyClient = new DifyClient()
    const difyResponse = await difyClient.stopGeneration({
      taskId,
      userId: user.clerkId,
    })

    // Parse and return JSON response
    const data = await difyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Stop endpoint error:', error)

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
 * OPTIONS /api/dify/stop
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
