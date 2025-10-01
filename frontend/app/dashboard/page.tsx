import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PaywallCard } from '@/components/paywall-card'
import { GracePeriodWarning } from '@/components/grace-period-warning'
import { AvatarMenu } from '@/components/avatar-menu'
import { DifyChatbot } from '@/components/dify-chatbot'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = await createClient()

  // Query by clerk_id instead of UUID
  let { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('has_paid, stripe_subscription_status, in_grace_period')
    .eq('clerk_id', userId)
    .single()

  // Create user record if doesn't exist (first login)
  if (fetchError?.code === 'PGRST116') {
    const user = await currentUser()
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        clerk_id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress || ''
      })

    if (!insertError) {
      userData = { has_paid: false, stripe_subscription_status: null, in_grace_period: false }
    }
  }

  const hasAccess =
    userData?.has_paid &&
    ['active', 'trialing', 'past_due'].includes(
      userData?.stripe_subscription_status || ''
    )

  if (!hasAccess) {
    return <PaywallCard />
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Grace Period Warning (if applicable) */}
      {userData?.in_grace_period && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <GracePeriodWarning />
        </div>
      )}

      {/* Fullscreen Chatbot */}
      <DifyChatbot userId={userId} />

      {/* Avatar Menu */}
      <AvatarMenu />
    </div>
  )
}