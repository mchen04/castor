"use client"

import { useState } from 'react'
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
  const { messages, isStreaming, sendMessage, cancelStream } = useDifyChat({
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
    const newConversationId = await sendMessage(query)

    // If this created a new conversation, update current conversation ID
    if (newConversationId && !currentConversationId) {
      setCurrentConversationId(newConversationId)
      // Reload conversation list to show the new conversation
      await loadConversations()
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ThreadListSidebar
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
        <SidebarInset>
          <SidebarTrigger className="absolute top-4 left-4 md:hidden" />
          <Thread
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            onCancelStream={cancelStream}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
