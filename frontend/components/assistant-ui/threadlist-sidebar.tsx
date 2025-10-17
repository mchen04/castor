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
      {/* Header: Logo + Trigger in expanded, Hamburger only in collapsed */}
      <SidebarHeader className="flex flex-row items-center justify-between border-b px-2 py-2 gap-2">
        {/* Expanded state: Show logo on left */}
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarLogo />
        </div>
        {/* Collapsed state: Show hamburger centered */}
        <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger />
        </div>
        {/* Expanded state: Show hamburger on right */}
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      {/* Content: New Thread button + Conversation list */}
      <SidebarContent className="px-2 pt-2">
        <SidebarNavButton onClick={onNewConversation} />
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
