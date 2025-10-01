import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

async function processWebhookEvent(event: Stripe.Event) {
  const supabaseAdmin = createAdminClient()

  const { error: insertError } = await supabaseAdmin
    .from('processed_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    })

  if (insertError) {
    if (insertError.code === '23505') {
      console.log(`Event ${event.id} already processed, skipping`)
      return
    }
    console.error('Failed to insert event into processed_events:', {
      eventId: event.id,
      error: insertError.message,
    })
    throw new Error('Failed to log event')
  }

  console.log(`Processing webhook event: ${event.type} (${event.id})`)

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
          stripe_subscription_current_period_end: null,
          stripe_subscription_cancel_at_period_end: false,
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
        throw new Error('Failed to update user')
      }

      console.log('Checkout session processed successfully:', {
        eventId: event.id,
        userId,
        subscriptionId,
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string
    const eventCreated = event.created

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('updated_at')
      .eq('stripe_customer_id', stripeCustomerId)
      .single()

    if (existingUser?.updated_at) {
      const lastUpdate = new Date(existingUser.updated_at).getTime() / 1000
      if (eventCreated < lastUpdate) {
        console.log('Skipping stale event:', {
          eventId: event.id,
          eventCreated,
          lastUpdate,
        })
        return
      }
    }

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
      throw new Error('Failed to update subscription')
    }

    console.log('Subscription updated successfully:', {
      eventId: event.id,
      customerId: stripeCustomerId,
      status: subscription.status,
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        has_paid: false,
        stripe_subscription_id: null,
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
      throw new Error('Failed to update subscription')
    }

    console.log('Subscription deleted successfully:', {
      eventId: event.id,
      customerId: stripeCustomerId,
    })
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
      throw new Error('Failed to update user')
    }

    console.log('Invoice payment succeeded:', {
      eventId: event.id,
      invoiceId: invoice.id,
      customerId,
    })
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
      throw new Error('Failed to update user')
    }

    console.log('Invoice payment failed, grace period enabled:', {
      eventId: event.id,
      invoiceId: invoice.id,
      customerId,
    })
  }

  if (event.type === 'invoice.payment_action_required') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        stripe_subscription_status: 'incomplete',
        in_grace_period: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Invoice payment action required DB update failed:', {
        eventId: event.id,
        invoiceId: invoice.id,
        error: error.message,
      })
      throw new Error('Failed to update user')
    }

    console.log('Invoice requires payment action (3DS/SCA):', {
      eventId: event.id,
      invoiceId: invoice.id,
      customerId,
    })
  }
}

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

  try {
    await processWebhookEvent(event)
  } catch (error) {
    console.error('Webhook processing failed:', {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}