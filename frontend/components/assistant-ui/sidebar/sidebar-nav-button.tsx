import { PlusIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

interface SidebarNavButtonProps {
  onClick: () => void
}

/**
 * New Thread button using fixed container pattern
 * - Icon stays in fixed-width container (no movement)
 * - Text hidden with group-data selector when collapsed
 * - Matches conversation item styling for consistency
 */
export function SidebarNavButton({ onClick }: SidebarNavButtonProps) {
  const { state } = useSidebar()

  const button = (
    <button
      onClick={onClick}
      className="flex items-center w-full h-11 rounded-lg hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Fixed 44px icon container - matches button height exactly, never moves */}
      <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
        <PlusIcon className="w-5 h-5" />
      </div>
      {/* Text hidden when collapsed */}
      <span className="text-sm font-normal group-data-[collapsible=icon]:hidden">
        New Thread
      </span>
    </button>
  )

  // Wrap in tooltip when collapsed
  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right">New Thread</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
