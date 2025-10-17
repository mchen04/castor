import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

interface SidebarNavButtonProps {
  onClick: () => void
}

/**
 * New Thread button that adapts to sidebar state
 * - Expanded: Shows 40px icon + "New Thread" text in full-width button
 * - Collapsed: Shows 40px square icon button with tooltip
 * - Icon never changes size or position
 */
export function SidebarNavButton({ onClick }: SidebarNavButtonProps) {
  const { state } = useSidebar()

  const button = (
    <Button
      onClick={onClick}
      variant="ghost"
      className="w-full justify-start gap-2 px-2 py-2 text-sm hover:bg-muted/80 transition-colors group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
    >
      <PlusIcon className="size-5 shrink-0" />
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
