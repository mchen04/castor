"use client"

import { useState, useEffect } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatHeader } from "./chat-header"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { useChat } from "@/hooks/use-chat"
import { useConversations } from "@/hooks/use-conversations"
import type { ChatSettings } from "@/lib/types"

interface ChatLayoutProps {
  userId: string
}

export function ChatLayout({ userId }: ChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [settings, setSettings] = useState<ChatSettings>({
    theme: "dark",
    fontSize: "medium",
    sendOnEnter: true,
    voiceEnabled: true,
  })

  const {
    conversations,
    activeConversationId,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
    loadConversationMessages,
    updateConversationId,
  } = useConversations({ userId })

  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    loadMessages: setMessages,
    conversationId,
  } = useChat({
    userId,
    conversationId: activeConversationId || undefined,
    onConversationIdChange: (newConversationId) => {
      // Update conversation ID when Dify creates a new conversation
      if (activeConversationId === "" || activeConversationId === null) {
        updateConversationId("", newConversationId)
      }
    },
  })

  // Load conversation messages when active conversation changes
  useEffect(() => {
    const loadConversation = async () => {
      if (activeConversationId && activeConversationId !== "") {
        const msgs = await loadConversationMessages(activeConversationId)
        setMessages(msgs)
      } else {
        clearMessages()
      }
    }

    loadConversation()
  }, [activeConversationId, loadConversationMessages, clearMessages, setMessages])

  const handleNewChat = () => {
    createConversation()
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Main Chat Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
