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
      {/* Header: Clean grid layout for perfect alignment */}
      <SidebarHeader className="h-14 px-2">
        <div className="flex items-center justify-between h-full">
          {/* Logo - fixed position, always centered in its container */}
          <div className="size-11 flex items-center justify-center shrink-0">
            <SidebarLogo />
          </div>

          {/* Hamburger - only visible in expanded state, aligned to the right */}
          <div className="size-11 flex items-center justify-center shrink-0 group-data-[collapsible=icon]:hidden">
            <SidebarTrigger className="size-11" />
          </div>

          {/* Hamburger for collapsed state - overlay on logo with hover */}
          <div className="absolute left-2 top-2 size-11 flex items-center justify-center group-data-[state=expanded]:hidden">
            <SidebarTrigger className="size-11 opacity-0 hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-sm rounded-lg" />
          </div>
        </div>
      </SidebarHeader>

      {/* Content: New Thread button + Conversation list */}
      <SidebarContent className="px-2 pt-2 flex flex-col gap-1">
        {/* NEW THREAD: Simple button matching conversation items */}
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

      {/* Footer: User menu with consistent padding */}
      <SidebarFooter className="px-2 py-2">
        <SidebarUserMenu user={user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
