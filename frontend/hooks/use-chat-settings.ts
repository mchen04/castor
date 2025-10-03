import { useState, useEffect } from "react"
import type { ChatSettings } from "@/lib/types"

const DEFAULT_SETTINGS: ChatSettings = {
  theme: "dark",
  fontSize: "medium",
  sendOnEnter: true,
  voiceEnabled: true,
}

const STORAGE_KEY = "castor-chat-settings"

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse stored settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: ChatSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  }

  return { settings, updateSettings }
}
