import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEmail = user.emailAddresses[0].emailAddress

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      client_reference_id: userId, // Clerk user ID
      customer_email: userEmail,
      metadata: {
        clerk_user_id: userId
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}