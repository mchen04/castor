import { MessagesSquare } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"

/**
 * Sidebar logo component that displays the Castor GEO icon
 * Shows tooltip with brand name when sidebar is collapsed
 */
export function SidebarLogo() {
  const { state } = useSidebar()

  const logoButton = (
    <Link
      href="/"
      className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
      aria-label="Castor GEO Home"
    >
      <MessagesSquare className="size-5" />
    </Link>
  )

  // Show tooltip only when sidebar is collapsed
  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{logoButton}</TooltipTrigger>
        <TooltipContent side="right">Castor GEO</TooltipContent>
      </Tooltip>
    )
  }

  return logoButton
}
