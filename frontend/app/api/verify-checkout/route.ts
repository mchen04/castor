import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { session_id } = await req.json()

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    // Verify the session belongs to the authenticated user
    if (session.client_reference_id !== userId) {
      return NextResponse.json(
        { error: 'Session does not belong to user' },
        { status: 403 }
      )
    }

    // Verify payment was successful
    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const stripeCustomerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    // Retrieve full subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const currentPeriodEnd =
      'current_period_end' in subscription &&
      typeof subscription.current_period_end === 'number'
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null

    // Update the user in Supabase
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        has_paid: true,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: subscription.status,
        stripe_subscription_current_period_end: currentPeriodEnd,
        stripe_subscription_cancel_at_period_end:
          subscription.cancel_at_period_end || false,
        in_grace_period: false,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', userId)

    if (error) {
      console.error('Failed to update user after checkout verification:', {
        userId,
        sessionId: session_id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to activate subscription' },
        { status: 500 }
      )
    }

    console.log('Checkout verified and user updated successfully:', {
      userId,
      sessionId: session_id,
      subscriptionId,
      subscriptionStatus: subscription.status,
      currentPeriodEnd,
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        status: subscription.status,
        current_period_end:
          'current_period_end' in subscription
            ? subscription.current_period_end
            : null,
      },
    })
  } catch (error) {
    console.error('Error verifying checkout:', error)
    return NextResponse.json(
      { error: 'Failed to verify checkout' },
      { status: 500 }
    )
  }
}
