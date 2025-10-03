"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "@clerk/nextjs"
import { useSupabaseClient } from "@/hooks/use-supabase-client"
import type { Conversation, Message } from "@/lib/types"

interface UseConversationsOptions {
  userId: string
}

interface DifyConversation {
  id: string
  name: string
  inputs: Record<string, unknown>
  status: string
  introduction: string
  created_at: number
  updated_at: number
}

interface DifyMessage {
  id: string
  conversation_id: string
  inputs: Record<string, unknown>
  query: string
  answer: string
  message_files: unknown[]
  feedback: unknown
  retriever_resources: unknown[]
  created_at: number
}

export function useConversations({ userId }: UseConversationsOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { session } = useSession()
  const supabase = useSupabaseClient()

  // Load conversations from Dify API
  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = await session?.getToken()

      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-conversations?userId=${userId}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const difyConversations: DifyConversation[] = result.data || []

      // Transform Dify conversations to our format
      const transformedConversations: Conversation[] = difyConversations.map((conv) => ({
        id: conv.id,
        title: conv.name || "New Conversation",
        timestamp: new Date(conv.updated_at * 1000),
        messageCount: 0, // We don't have this from the API
      }))

      setConversations(transformedConversations)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, session])

  // Load conversation messages
  const loadConversationMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const token = await session?.getToken()

      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-messages?conversationId=${conversationId}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const difyMessages: DifyMessage[] = result.data || []

      // Transform Dify messages to our format
      const transformedMessages: Message[] = []

      for (const msg of difyMessages.reverse()) {
        // Add user message
        transformedMessages.push({
          id: `${msg.id}-user`,
          role: "user",
          content: msg.query,
          timestamp: new Date(msg.created_at * 1000),
        })

        // Add assistant message
        transformedMessages.push({
          id: msg.id,
          role: "assistant",
          content: msg.answer,
          timestamp: new Date(msg.created_at * 1000),
        })
      }

      return transformedMessages
    } catch (error) {
      console.error("Failed to load conversation messages:", error)
      return []
    }
  }, [session])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const createConversation = useCallback(() => {
    // With Dify, conversations are created automatically when first message is sent
    // So we just create a new local conversation object
    const newConversation: Conversation = {
      id: "", // Will be filled when first message is sent
      title: "New Conversation",
      timestamp: new Date(),
      messageCount: 0,
    }

    setConversations((prev) => [newConversation, ...prev])
    setActiveConversationId("")
    return newConversation
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      // Note: Dify doesn't provide a delete conversation endpoint
      // We can only remove it from local state
      setConversations((prev) => prev.filter((conv) => conv.id !== id))

      if (activeConversationId === id) {
        setActiveConversationId(conversations[0]?.id || null)
      }
    },
    [activeConversationId, conversations]
  )

  const renameConversation = useCallback((id: string, newTitle: string) => {
    // Note: Dify doesn't provide a rename conversation endpoint
    // We can only update it in local state
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
    )
  }, [])

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
  }, [])

  // Update conversation with real ID after first message
  const updateConversationId = useCallback((tempId: string, realId: string, title?: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === tempId
          ? { ...conv, id: realId, title: title || conv.title, messageCount: 1 }
          : conv
      )
    )
    setActiveConversationId(realId)
  }, [])

  return {
    conversations,
    activeConversationId,
    isLoading,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
    loadConversationMessages,
    updateConversationId,
    refreshConversations: loadConversations,
  }
}
