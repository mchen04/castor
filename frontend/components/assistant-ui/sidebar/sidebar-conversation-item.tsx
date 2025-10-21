import * as React from "react"
import { Trash2 } from "lucide-react"
import type { Conversation } from "@/lib/types/chat"

interface SidebarConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (newName: string) => void
}

/**
 * Individual conversation item in the sidebar
 * Features:
 * - Click to select conversation
 * - Inline editing on double-click
 * - Delete button on hover
 * - Active state highlighting
 */
export function SidebarConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: SidebarConversationItemProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(conversation.name)

  const handleRename = () => {
    if (editValue.trim() && editValue !== conversation.name) {
      onRename(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete "${conversation.name}"?`)) {
      onDelete()
    }
  }

  return (
    <div
      className={`group relative flex items-center h-11 rounded-lg transition-colors ${
        isActive ? "bg-muted" : "hover:bg-muted/50"
      }`}
    >
      <button
        onClick={onSelect}
        onDoubleClick={() => setIsEditing(true)}
        className="flex items-center flex-grow h-full px-3 text-start min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename()
              if (e.key === "Escape") {
                setEditValue(conversation.name)
                setIsEditing(false)
              }
            }}
            className="w-full text-sm font-normal bg-transparent border-none outline-none focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm font-normal truncate block">
            {conversation.name || "New Chat"}
          </span>
        )}
      </button>

      {/* Delete button - shows on hover or when active (CSS-only hover) */}
      <button
        onClick={handleDelete}
        className="absolute right-2 p-1.5 rounded-md hover:bg-background hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Delete "${conversation.name}"`}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
