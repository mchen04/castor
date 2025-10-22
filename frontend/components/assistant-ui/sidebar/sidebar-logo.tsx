import { MessagesSquare } from "lucide-react"
import Link from "next/link"

/**
 * Sidebar logo component that displays the Castor GEO icon
 * Sized to match all other header elements (44px × 44px)
 * Properly centered in both expanded and collapsed states
 */
export function SidebarLogo() {
  return (
    <Link
      href="/"
      className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 ease-in-out shrink-0"
      aria-label="Castor GEO Home"
    >
      <MessagesSquare className="size-5" />
    </Link>
  )
}
