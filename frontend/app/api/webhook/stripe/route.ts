import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.client_reference_id
    const stripeCustomerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (userId) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          has_paid: true,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user payment status:', error)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string

    const hasPaidStatus = subscription.status === 'active' || subscription.status === 'trialing'

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        has_paid: hasPaidStatus,
        stripe_subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId)

    if (error) {
      console.error('Error updating subscription status:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        has_paid: false,
        stripe_subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId)

    if (error) {
      console.error('Error handling subscription deletion:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}