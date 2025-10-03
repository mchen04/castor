import type Stripe from 'stripe'

export interface User {
  id: string
  email: string
  has_paid: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: SubscriptionStatus | null
  stripe_subscription_current_period_end: string | null
  stripe_subscription_cancel_at_period_end: boolean | null
  in_grace_period: boolean
  created_at: string
  updated_at: string
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface ProcessedEvent {
  id: number
  event_id: string
  event_type: string
  processed_at: string
}

export type StripeWebhookEvent =
  | Stripe.CheckoutSessionCompletedEvent
  | Stripe.CustomerSubscriptionUpdatedEvent
  | Stripe.CustomerSubscriptionDeletedEvent
  | Stripe.InvoicePaymentSucceededEvent
  | Stripe.InvoicePaymentFailedEvent

export type DbResult<T> = {
  data: T | null
  error: Error | null
}

// Chat types
export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
  messageCount: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface ChatSettings {
  theme: "light" | "dark" | "system"
  fontSize: "small" | "medium" | "large"
  sendOnEnter: boolean
  voiceEnabled: boolean
}