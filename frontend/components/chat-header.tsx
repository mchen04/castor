"use client"

import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

interface ChatHeaderProps {
  onToggleSidebar: () => void
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="md:hidden flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
