"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard } from "lucide-react"
import { useChatSettings } from "@/hooks/use-chat-settings"
import type { ChatSettings } from "@/lib/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your chat experience and manage your subscription</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chat Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Chat Preferences</h3>

            {/* Theme */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme</Label>
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

            {/* Send on Enter */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Send on Enter</Label>
              <Switch
                checked={settings.sendOnEnter}
                onCheckedChange={(checked) => updateSettings({ ...settings, sendOnEnter: checked })}
              />
            </div>

            {/* Voice Input */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Voice Input</Label>
              <Switch
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => updateSettings({ ...settings, voiceEnabled: checked })}
              />
            </div>
          </div>

          {/* Subscription */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold">Subscription</h3>
            <Button
              onClick={handleManageSubscription}
              className="w-full"
              variant="outline"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
            <p className="text-xs text-muted-foreground">
              Update payment method, view invoices, or cancel subscription
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
