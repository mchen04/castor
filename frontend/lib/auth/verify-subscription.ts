import { createAdminClient } from '@/lib/supabase/admin'
import { auth } from '@clerk/nextjs/server'

export interface VerifiedUser {
  clerkId: string
  hasPaid: boolean
  subscriptionStatus: string | null
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Verifies that the user has an active subscription
 * Throws AuthError with appropriate status code if verification fails
 */
export async function verifySubscription(): Promise<VerifiedUser> {
  // Get Clerk user ID from the request
  const { userId } = await auth()

  if (!userId) {
    throw new AuthError('Not authenticated', 401)
  }

  // Query Supabase to verify subscription status
  const supabaseAdmin = createAdminClient()
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('has_paid, stripe_subscription_status, clerk_id')
    .eq('clerk_id', userId)
    .single()

  if (userError || !userData) {
    console.error('User not found in database:', { userId, error: userError })
    throw new AuthError('User not found', 403)
  }

  // Check if user has active subscription
  const activeStatuses = ['active', 'trialing', 'past_due']
  const hasActiveSubscription =
    userData.has_paid &&
    userData.stripe_subscription_status &&
    activeStatuses.includes(userData.stripe_subscription_status)

  if (!hasActiveSubscription) {
    throw new AuthError('Active subscription required', 403)
  }

  return {
    clerkId: userData.clerk_id,
    hasPaid: userData.has_paid,
    subscriptionStatus: userData.stripe_subscription_status,
  }
}
