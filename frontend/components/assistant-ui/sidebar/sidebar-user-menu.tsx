import { LogOut, Home, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import type { UserProfile } from "@/lib/types"

interface SidebarUserMenuProps {
  user: UserProfile | null
  onLogout: () => void
}

/**
 * User menu component in sidebar footer
 * Adapts to sidebar state:
 * - Expanded: Avatar + name + email
 * - Collapsed: Avatar only with tooltip
 */
export function SidebarUserMenu({ user, onLogout }: SidebarUserMenuProps) {
  const { state } = useSidebar()
  const router = useRouter()

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create portal session")
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url // External URL, window.location is appropriate
      }
    } catch (error) {
      console.error("Error opening customer portal:", error)
    }
  }

  const avatarButton = (
    <button className="rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
      <Avatar className="size-8 cursor-pointer">
        <AvatarImage
          src={user?.avatar || "/placeholder.svg"}
          alt={user?.name || "User"}
        />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "U"}
        </AvatarFallback>
      </Avatar>
    </button>
  )

  return (
    <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <DropdownMenu>
        {state === "collapsed" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">{user?.name || "User"}</TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>
        )}

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => router.push("/")}>
            <Home className="mr-2 size-4" />
            Home
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageSubscription}>
            <CreditCard className="mr-2 size-4" />
            Manage Subscription
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User details - hidden when collapsed */}
      <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-medium">
          {user?.name || "User"}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {user?.email || ""}
        </span>
      </div>
    </div>
  )
}
