"use client"

import { useState, useCallback } from "react"
import { useSession } from "@clerk/nextjs"
import { useSupabaseClient } from "@/hooks/use-supabase-client"
import type { Message } from "@/lib/types"

interface UseChatOptions {
  userId: string
  conversationId?: string
  onConversationIdChange?: (conversationId: string) => void
}

export function useChat({ userId, conversationId, onConversationIdChange }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)
  const { session } = useSession()
  const supabase = useSupabaseClient()

  const sendMessage = useCallback(
    async (content: string) => {

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      // Create placeholder for assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        // Get current session token for auth
        const token = await session?.getToken()

        if (!token) {
          throw new Error("Not authenticated")
        }

        // Call Supabase Edge Function with SSE stream
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-chat`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: content,
              conversationId: currentConversationId || "",
              userId,
            }),
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Parse SSE stream
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let extractedConversationId: string | undefined

        if (!reader) {
          throw new Error("No response body")
        }

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.event) {
                  case "message":
                    // Update assistant message with new content chunk
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: msg.content + data.answer }
                          : msg
                      )
                    )

                    // Extract conversation_id from first event
                    if (!extractedConversationId && data.conversation_id) {
                      extractedConversationId = data.conversation_id
                      setCurrentConversationId(data.conversation_id)
                      onConversationIdChange?.(data.conversation_id)
                    }
                    break

                  case "message_end":
                    // Mark streaming as complete
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg
                      )
                    )
                    break

                  case "error":
                    console.error("Dify error:", data.message)
                    throw new Error(data.message || "Dify API error")
                }
              } catch (parseError) {
                console.error("Failed to parse SSE event:", parseError)
              }
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to send message:", error)

        // Remove assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
        setIsLoading(false)
      }
    },
    [userId, currentConversationId, onConversationIdChange, session]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentConversationId(undefined)
  }, [])

  const loadMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages)
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    loadMessages,
    conversationId: currentConversationId,
  }
}
