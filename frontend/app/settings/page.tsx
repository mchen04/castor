import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from '@/components/settings-content'
import { AvatarMenu } from '@/components/avatar-menu'

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const supabase = await createClient()

  const { data: userData } = await supabase
    .from('users')
    .select('has_paid, stripe_subscription_status, stripe_customer_id')
    .eq('clerk_id', userId)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <AvatarMenu />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <SettingsContent
          email={user?.emailAddresses?.[0]?.emailAddress || ''}
          hasSubscription={!!userData?.stripe_customer_id}
          subscriptionStatus={userData?.stripe_subscription_status}
        />
      </div>
    </div>
  )
}
