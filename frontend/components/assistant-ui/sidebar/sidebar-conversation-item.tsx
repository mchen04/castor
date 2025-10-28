import * as React from "react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Conversation } from "@/lib/types/chat"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
 * - Three-dot menu on hover (rename/delete options)
 * - Inline editing triggered via menu
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
  const [isHovered, setIsHovered] = React.useState(false)

  const handleRename = () => {
    if (editValue.trim() && editValue !== conversation.name) {
      onRename(editValue.trim())
    }
    setIsEditing(false)
  }

  return (
    <div
      className={`relative flex items-center h-11 rounded-lg transition-colors ${
        isActive ? "bg-muted" : "hover:bg-muted/50"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onSelect}
        className="flex items-center flex-grow h-full px-3 pr-10 text-start min-w-0 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <span className="text-sm font-normal truncate block max-w-[12rem]">
            {conversation.name || "New Chat"}
          </span>
        )}
      </button>

      {/* Three-dot menu - shows only when this specific item is hovered */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`absolute right-2 p-1.5 rounded-md hover:bg-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isHovered && !isEditing ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
            aria-label={`Options for "${conversation.name}"`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            <Pencil className="mr-2 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete "${conversation.name}"?`)) {
                onDelete()
              }
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
