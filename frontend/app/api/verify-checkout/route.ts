import { auth, currentUser } from '@clerk/nextjs/server'
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

    // Check if user exists and create if necessary
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from('users')
      .select('id, has_paid, stripe_subscription_status')
      .eq('clerk_id', userId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Failed to check user existence:', {
        userId,
        sessionId: session_id,
        error: selectError.message,
        errorCode: selectError.code,
      })
      return NextResponse.json(
        { error: 'Database connection error - please try again' },
        { status: 500 }
      )
    }

    // Idempotency check: skip if subscription is already active
    if (existingUser?.has_paid && existingUser.stripe_subscription_status === 'active') {
      console.log('Subscription already active, skipping duplicate processing:', {
        userId,
        sessionId: session_id,
        existingStatus: existingUser.stripe_subscription_status,
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
    }

    // Create user if they don't exist
    if (!existingUser) {
      const user = await currentUser()
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || ''

      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email: userEmail,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Failed to create user record:', {
          userId,
          sessionId: session_id,
          email: userEmail,
          error: insertError.message,
          errorCode: insertError.code,
          errorDetails: insertError.details,
        })
        return NextResponse.json(
          { error: 'Failed to create account - please contact support' },
          { status: 500 }
        )
      }

      console.log('Created new user record:', {
        userId,
        email: userEmail,
      })
    }

    // Now update the user with subscription details
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
        subscriptionId,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
      return NextResponse.json(
        { error: 'Failed to activate subscription - please contact support' },
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
