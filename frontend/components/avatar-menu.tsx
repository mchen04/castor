'use client'

import { useClerk } from '@clerk/nextjs'
import { CreditCard, LogOut } from 'lucide-react'
import { UserMenu, UserMenuItem } from '@/components/user-menu'

export function AvatarMenu() {
  const { signOut } = useClerk()

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    }
  }

  const menuItems: UserMenuItem[] = [
    {
      label: "Manage Subscription",
      icon: CreditCard,
      onClick: handleManageSubscription,
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => signOut({ redirectUrl: '/' }),
      variant: 'destructive' as const,
      separator: true,
    },
  ]

  return <UserMenu menuItems={menuItems} position="dashboard" align="start" />
}