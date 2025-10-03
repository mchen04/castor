"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Conversation, UserProfile } from "@/lib/types"
import {
  PanelLeft,
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Trash2,
  Settings,
  LogOut,
  User,
  Edit2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  onRenameConversation: (id: string, newTitle: string) => void
  isOpen: boolean
  onToggle: () => void
  user: UserProfile | null
  onLogout: () => void
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onToggle,
  user,
  onLogout,
}: ChatSidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamingConversation, setRenamingConversation] = useState<Conversation | null>(null)
  const [newTitle, setNewTitle] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const handleRenameClick = (conversation: Conversation) => {
    setRenamingConversation(conversation)
    setNewTitle(conversation.title)
    setRenameDialogOpen(true)
  }

  const handleRenameSubmit = () => {
    if (renamingConversation && newTitle.trim()) {
      onRenameConversation(renamingConversation.id, newTitle.trim())
      setRenameDialogOpen(false)
      setRenamingConversation(null)
      setNewTitle("")
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden" onClick={onToggle}>
        <PanelLeft className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:relative md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sidebar-primary" />
            <h1 className="text-lg font-semibold text-sidebar-foreground">Castor GSO</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-sidebar-accent pl-9 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2">
          <div className="space-y-1 py-2">
            {filteredConversations.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-sidebar-foreground/50">No conversations found</div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-sidebar-accent",
                    activeConversationId === conversation.id && "bg-sidebar-accent",
                  )}
                  onClick={() => {
                    onSelectConversation(conversation.id)
                    if (window.innerWidth < 768) {
                      onToggle()
                    }
                  }}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-sidebar-foreground/70" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-medium text-sidebar-foreground">{conversation.title}</h3>
                      <span className="flex-shrink-0 text-xs text-sidebar-foreground/50">
                        {formatTimestamp(conversation.timestamp)}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className="mt-1 truncate text-xs text-sidebar-foreground/60">{conversation.lastMessage}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameClick(conversation)
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation(conversation.id)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="flex-shrink-0 border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-start gap-3 p-2 hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "User"}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{user?.email || ""}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onToggle} />}

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>Enter a new name for this conversation.</DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Conversation name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameSubmit()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
