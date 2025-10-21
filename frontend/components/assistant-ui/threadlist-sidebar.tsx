import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarLogo } from "./sidebar/sidebar-logo"
import { SidebarNavButton } from "./sidebar/sidebar-nav-button"
import { SidebarConversationList } from "./sidebar/sidebar-conversation-list"
import { SidebarUserMenu } from "./sidebar/sidebar-user-menu"
import type { UserProfile } from "@/lib/types"
import type { Conversation } from "@/lib/types/chat"

interface ThreadListSidebarProps {
  user: UserProfile | null
  onLogout: () => void
  conversations: Conversation[]
  currentConversationId: string
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => Promise<void>
  onRenameConversation: (id: string, newName: string) => Promise<void>
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => Promise<void>
  collapsible?: "icon" | "offcanvas" | "none"
}

/**
 * Main sidebar component for thread/conversation list
 *
 * Features:
 * - Icon mode: Shows narrow 3rem bar with icons only
 * - Expanded mode: Shows full 16rem sidebar with conversation list
 * - Mobile: Sheet overlay sidebar
 *
 * Architecture:
 * - Composed of smaller, focused components
 * - Each child component handles its own collapsed/expanded state
 * - Clean prop drilling with minimal logic
 */
export function ThreadListSidebar({
  user,
  onLogout,
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  hasMore,
  isLoadingMore,
  onLoadMore,
  collapsible = "icon",
}: ThreadListSidebarProps) {
  return (
    <Sidebar collapsible={collapsible}>
      {/* Header: Logo (always left) with hover hamburger overlay in collapsed, separate right hamburger in expanded */}
      <SidebarHeader className="flex flex-row items-center justify-between border-b px-2 py-2">
        {/* LEFT: Logo (always same position, never moves) */}
        <div className="relative size-10">
          {/* Logo - always visible */}
          <SidebarLogo />

          {/* Hover overlay - hamburger appears on hover in collapsed state only */}
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background opacity-0 hover:opacity-100 transition-opacity group-data-[state=expanded]:hidden">
            <SidebarTrigger className="size-10" />
          </div>
        </div>

        {/* RIGHT: Hamburger - only visible in expanded state */}
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden size-10" />
      </SidebarHeader>

      {/* Content: New Thread button + Conversation list */}
      <SidebarContent className="px-2 pt-2">
        {/* NEW THREAD: Fixed icon + overlay pattern (matches logo/hamburger) */}
        <div className="relative size-10 group-data-[collapsible=icon]:size-10">
          <SidebarNavButton onClick={onNewConversation} />
        </div>
        <SidebarConversationList
          conversations={conversations}
          currentId={currentConversationId}
          onSelect={onSelectConversation}
          onDelete={onDeleteConversation}
          onRename={onRenameConversation}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
        />
      </SidebarContent>

      {/* Footer: User menu */}
      <SidebarFooter className="border-t p-3">
        <SidebarUserMenu user={user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
