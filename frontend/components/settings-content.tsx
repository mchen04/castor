'use client'

import { CreditCard, User, ArrowLeft, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useChatSettings } from '@/hooks/use-chat-settings'
import type { ChatSettings } from '@/lib/types'

interface SettingsContentProps {
  email: string
  hasSubscription: boolean
  subscriptionStatus: string | null
}

export function SettingsContent({ email, hasSubscription, subscriptionStatus }: SettingsContentProps) {
  const router = useRouter()
  const { settings, updateSettings } = useChatSettings()

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
      alert('Failed to open billing portal. Please try again.')
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
      case 'trialing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Trial</span>
      case 'past_due':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Past Due</span>
      case 'canceled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Canceled</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No Subscription</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Account Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Account</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-gray-900">{email}</p>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Subscription</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              {getStatusBadge(subscriptionStatus)}
            </div>
          </div>

          {hasSubscription && (
            <div>
              <button
                onClick={handleManageSubscription}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <CreditCard className="h-4 w-4" />
                Manage Subscription
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Update payment method, view invoices, or cancel subscription
              </p>
            </div>
          )}

          {!hasSubscription && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                You don&apos;t have an active subscription. Subscribe to access the GSO Chatbot.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Preferences Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Chat Preferences</h2>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme</Label>
            <RadioGroup
              value={settings.theme}
              onValueChange={(value: string) => updateSettings({ ...settings, theme: value as ChatSettings["theme"] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="font-normal">
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="font-normal">
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="font-normal">
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Font Size</Label>
            <RadioGroup
              value={settings.fontSize}
              onValueChange={(value: string) =>
                updateSettings({ ...settings, fontSize: value as ChatSettings["fontSize"] })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="font-normal">
                  Small
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="font-normal">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="font-normal">
                  Large
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Send on Enter */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Send on Enter</Label>
              <p className="text-sm text-gray-500">Press Enter to send messages</p>
            </div>
            <Switch
              checked={settings.sendOnEnter}
              onCheckedChange={(checked) => updateSettings({ ...settings, sendOnEnter: checked })}
            />
          </div>

          {/* Voice Input */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Voice Input</Label>
              <p className="text-sm text-gray-500">Enable voice recording for messages</p>
            </div>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(checked) => updateSettings({ ...settings, voiceEnabled: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
