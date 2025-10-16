import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

interface SidebarNavButtonProps {
  onClick: () => void
}

/**
 * New Thread button that adapts to sidebar state
 * - Expanded: Shows icon + "New Thread" text
 * - Collapsed: Shows icon only with tooltip
 */
export function SidebarNavButton({ onClick }: SidebarNavButtonProps) {
  const { state } = useSidebar()

  const button = (
    <Button
      onClick={onClick}
      variant="ghost"
      className="w-full justify-start gap-2 px-3 py-2 text-sm hover:bg-muted/80 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
    >
      <PlusIcon className="size-4 shrink-0" />
      <span className="group-data-[collapsible=icon]:hidden">New Thread</span>
    </Button>
  )

  // Wrap in tooltip when collapsed
  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">New Thread</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
