"use client"

import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

interface ChatHeaderProps {
  onToggleSidebar: () => void
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
          <PanelLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-medium text-foreground">GSO Strategy for E-commerce</h2>
      </div>
    </header>
  )
}
