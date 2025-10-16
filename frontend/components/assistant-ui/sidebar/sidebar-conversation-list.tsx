import { Button } from "@/components/ui/button"
import { SidebarConversationItem } from "./sidebar-conversation-item"
import type { Conversation } from "@/lib/types/chat"

interface SidebarConversationListProps {
  conversations: Conversation[]
  currentId: string
  onSelect: (id: string) => void
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, newName: string) => Promise<void>
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => Promise<void>
}

/**
 * Conversation list wrapper component
 * Hidden when sidebar is in collapsed/icon mode
 * Includes infinite scroll "Load More" functionality
 */
export function SidebarConversationList({
  conversations,
  currentId,
  onSelect,
  onDelete,
  onRename,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: SidebarConversationListProps) {
  return (
    <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
      {/* Conversation list */}
      {conversations.map((conversation) => (
        <SidebarConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === currentId}
          onSelect={() => onSelect(conversation.id)}
          onDelete={() => onDelete(conversation.id)}
          onRename={(newName) => onRename(conversation.id, newName)}
        />
      ))}

      {/* Load More button */}
      {hasMore && (
        <Button
          onClick={onLoadMore}
          disabled={isLoadingMore}
          variant="ghost"
          className="mt-2 w-full justify-center px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors"
        >
          {isLoadingMore ? "Loading..." : "Load More"}
        </Button>
      )}
    </div>
  )
}
