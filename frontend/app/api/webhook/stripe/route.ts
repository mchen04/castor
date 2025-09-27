import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

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
    console.error('Webhook signature verification failed:', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: existingEvent } = await supabaseAdmin
    .from('processed_events')
    .select('id')
    .eq('event_id', event.id)
    .single()

  if (existingEvent) {
    console.log(`Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.client_reference_id
    const stripeCustomerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (userId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        const { error } = await supabaseAdmin
          .from('users')
          .update({
            has_paid: true,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscriptionId,
            stripe_subscription_status: subscription.status,
            stripe_subscription_current_period_end:
              'current_period_end' in subscription
                ? new Date((subscription.current_period_end as number) * 1000).toISOString()
                : null,
            stripe_subscription_cancel_at_period_end:
              subscription.cancel_at_period_end,
            in_grace_period: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (error) {
          console.error('Checkout session DB update failed:', {
            eventId: event.id,
            userId,
            error: error.message,
          })
          return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          )
        }
      } catch (err) {
        console.error('Error processing checkout session:', {
          eventId: event.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
        return NextResponse.json(
          { error: 'Failed to process checkout' },
          { status: 500 }
        )
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string

    const activeStatuses = ['active', 'trialing', 'past_due']
    const hasPaidStatus = activeStatuses.includes(subscription.status)
    const inGracePeriod = subscription.status === 'past_due'

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        has_paid: hasPaidStatus,
        stripe_subscription_status: subscription.status,
        stripe_subscription_current_period_end:
          'current_period_end' in subscription
            ? new Date((subscription.current_period_end as number) * 1000).toISOString()
            : null,
        stripe_subscription_cancel_at_period_end:
          subscription.cancel_at_period_end,
        in_grace_period: inGracePeriod,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId)

    if (error) {
      console.error('Subscription update DB operation failed:', {
        eventId: event.id,
        customerId: stripeCustomerId,
        error: error.message,
      })
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
        stripe_subscription_current_period_end: null,
        stripe_subscription_cancel_at_period_end: false,
        in_grace_period: false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId)

    if (error) {
      console.error('Subscription deletion DB operation failed:', {
        eventId: event.id,
        customerId: stripeCustomerId,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        has_paid: true,
        stripe_subscription_status: 'active',
        in_grace_period: false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Invoice payment success DB update failed:', {
        eventId: event.id,
        invoiceId: invoice.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        in_grace_period: true,
        stripe_subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Invoice payment failed DB update failed:', {
        eventId: event.id,
        invoiceId: invoice.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
  }

  await supabaseAdmin.from('processed_events').insert({
    event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  })

  return NextResponse.json({ received: true })
}