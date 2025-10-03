"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ChatSettings } from "@/lib/types"

interface SettingsDialogProps {
  settings: ChatSettings
  onSettingsChange: (settings: ChatSettings) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ settings, onSettingsChange, open, onOpenChange }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your chat experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme</Label>
            <RadioGroup
              value={localSettings.theme}
              onValueChange={(value: string) => setLocalSettings({ ...localSettings, theme: value as ChatSettings["theme"] })}
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
              value={localSettings.fontSize}
              onValueChange={(value: string) =>
                setLocalSettings({ ...localSettings, fontSize: value as ChatSettings["fontSize"] })
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
              <p className="text-sm text-muted-foreground">Press Enter to send messages</p>
            </div>
            <Switch
              checked={localSettings.sendOnEnter}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, sendOnEnter: checked })}
            />
          </div>

          {/* Voice Input */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Voice Input</Label>
              <p className="text-sm text-muted-foreground">Enable voice recording for messages</p>
            </div>
            <Switch
              checked={localSettings.voiceEnabled}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, voiceEnabled: checked })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
