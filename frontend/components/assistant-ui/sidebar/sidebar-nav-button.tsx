import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

interface SidebarNavButtonProps {
  onClick: () => void
}

/**
 * New Thread button using overlay pattern (matches logo/hamburger)
 * - Base layer: Fixed 40px icon button (always visible)
 * - Overlay layer: Full button with text (expanded only)
 * - Icon position is ALWAYS fixed, no transitions
 */
export function SidebarNavButton({ onClick }: SidebarNavButtonProps) {
  const { state } = useSidebar()

  const content = (
    <>
      {/* Base layer: Icon button - ALWAYS visible, ALWAYS 40px, NEVER moves */}
      <Button
        onClick={onClick}
        variant="ghost"
        className="size-10 p-0 hover:bg-muted/80 transition-colors"
      >
        <PlusIcon className="size-5" />
      </Button>

      {/* Overlay layer: Full button with text - only in expanded mode */}
      <Button
        onClick={onClick}
        variant="ghost"
        className="absolute inset-0 left-0 w-full justify-start pl-10 hover:bg-muted/80 transition-colors group-data-[collapsible=icon]:hidden"
      >
        <span className="text-sm">New Thread</span>
      </Button>
    </>
  )

  // Wrap in tooltip when collapsed
  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{content}</div>
        </TooltipTrigger>
        <TooltipContent side="right">New Thread</TooltipContent>
      </Tooltip>
    )
  }

  return content
}
