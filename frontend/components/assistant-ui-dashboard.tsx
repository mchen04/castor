"use client"

import { useState, useRef } from 'react'
import { useUser, useClerk } from "@clerk/nextjs"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar"
import { useDifyChat } from "@/lib/hooks/use-dify-chat"
import { useConversations } from "@/lib/hooks/use-conversations"
import type { UserProfile } from "@/lib/types"
import { Thread } from "@/components/assistant-ui/thread"

interface AssistantUIDashboardProps {
  userId: string
}

export function AssistantUIDashboard({ userId }: AssistantUIDashboardProps) {
  const { user } = useUser()
  const { signOut } = useClerk()

  // Current conversation state
  const [currentConversationId, setCurrentConversationId] = useState("")

  // Track if we're sending the first message to prevent re-render
  const sendingFirstMessageRef = useRef(false)

  // Conversation management
  const {
    conversations,
    isLoading: conversationsLoading,
    hasMore,
    loadConversations,
    loadMoreConversations,
    createConversation,
    deleteConversation,
    renameConversation,
  } = useConversations(userId)

  // Chat state for current conversation
  const { messages, isStreaming, sendMessage, stopAndRemoveMessage } = useDifyChat({
    userId,
    conversationId: currentConversationId,
  })

  // Transform Clerk user to UserProfile format
  const userProfile: UserProfile | null = user
    ? {
        id: user.id,
        name: user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl,
      }
    : null

  // Handle new conversation
  const handleNewConversation = () => {
    const newConvId = createConversation()
    setCurrentConversationId(newConvId)
  }

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId)
    // If we deleted the current conversation, switch to empty
    if (conversationId === currentConversationId) {
      setCurrentConversationId("")
    }
  }

  // Handle sending a message
  const handleSendMessage = async (query: string) => {
    const isFirstMessage = !currentConversationId
    if (isFirstMessage) {
      sendingFirstMessageRef.current = true
    }

    const newConversationId = await sendMessage(query)

    // If this created a new conversation, update current conversation ID
    if (newConversationId && !currentConversationId) {
      setCurrentConversationId(newConversationId)

      // Reload conversations to show the LLM-generated title
      // No timeout needed - sendMessage awaits title generation completion
      await loadConversations()
      sendingFirstMessageRef.current = false
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ThreadListSidebar
          collapsible="icon"
          user={userProfile}
          onLogout={() => signOut({ redirectUrl: "/" })}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={renameConversation}
          hasMore={hasMore}
          isLoadingMore={conversationsLoading}
          onLoadMore={loadMoreConversations}
        />
        <SidebarInset className="relative">
          {/* Mobile sidebar trigger - top left, visible on mobile only */}
          <div className="md:hidden absolute top-3 left-3 z-20">
            <SidebarTrigger className="size-10 bg-background border border-border/50 shadow-sm hover:bg-muted" />
          </div>
          <Thread
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            onStopAndRemove={stopAndRemoveMessage}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
