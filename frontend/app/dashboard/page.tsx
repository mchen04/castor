import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PaywallCard } from '@/components/paywall-card'
import { GracePeriodWarning } from '@/components/grace-period-warning'
import { AvatarMenu } from '@/components/avatar-menu'
import { DifyChatbot } from '@/components/dify-chatbot'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  if (!userId) {
    redirect('/login')
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('has_paid, stripe_subscription_status, in_grace_period')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user data:', error)
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