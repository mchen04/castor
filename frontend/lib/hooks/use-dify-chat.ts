"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { Message, DifyMessagesResponse } from '@/lib/types/chat'

interface UseDifyChatProps {
  userId: string
  conversationId: string
}

interface UseDifyChatResult {
  messages: Message[]
  isStreaming: boolean
  error: Error | null
  sendMessage: (query: string) => Promise<string | null>
  cancelStream: () => void
}

export function useDifyChat({ userId, conversationId }: UseDifyChatProps): UseDifyChatResult {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // For canceling streaming
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Load conversation history when conversation changes
   */
  useEffect(() => {
    if (!conversationId || !userId) {
      // New conversation - clear messages
      setMessages([])
      return
    }

    const loadHistory = async () => {
      try {
        // Get Clerk token for authentication
        const token = await getToken()
        if (!token) {
          console.warn('No token available for loading history')
          return
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-messages?conversationId=${conversationId}&userId=${userId}&limit=100`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          console.error('Failed to load conversation history:', response.statusText)
          return
        }

        const result: DifyMessagesResponse = await response.json()
        const difyMessages = result.data || []

        // Transform Dify messages to UI format
        const transformedMessages: Message[] = difyMessages.flatMap((msg) => [
          {
            id: `${msg.id}-user`,
            role: 'user' as const,
            content: msg.query,
            createdAt: new Date(msg.created_at * 1000),
          },
          {
            id: `${msg.id}-assistant`,
            role: 'assistant' as const,
            content: msg.answer,
            createdAt: new Date(msg.created_at * 1000),
          },
        ]).reverse()

        setMessages(transformedMessages)
      } catch (err) {
        console.error('Error loading conversation history:', err)
        setError(err instanceof Error ? err : new Error('Failed to load history'))
      }
    }

    loadHistory()
  }, [conversationId, userId, getToken])

  /**
   * Send a message and stream the response
   * Returns the new conversation ID if this was a new conversation
   */
  const sendMessage = useCallback(async (query: string): Promise<string | null> => {
    if (!userId) {
      throw new Error('Not authenticated')
    }

    setIsStreaming(true)
    setError(null)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    // Add user message immediately
    const userMessageId = `temp-${Date.now()}-user`
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: query,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Assistant message that will be updated as it streams
    const assistantMessageId = `temp-${Date.now()}-assistant`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      // Get Clerk token for authentication
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query,
            conversationId: conversationId || '',
            userId,
          }),
          signal: abortControllerRef.current.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Parse SSE stream
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedText = ''
      let newConversationId: string | null = null

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.event) {
                  case 'message':
                    // Accumulate text and update assistant message
                    accumulatedText += data.answer
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: accumulatedText }
                          : msg
                      )
                    )

                    // Capture conversation_id for new conversations
                    if (data.conversation_id && !conversationId) {
                      newConversationId = data.conversation_id
                    }
                    break

                  case 'message_end':
                    // Streaming complete
                    break

                  case 'error':
                    throw new Error(data.message || 'Dify API error')
                }
              } catch (parseError) {
                console.error('Failed to parse SSE event:', parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      return newConversationId
    } catch (err) {
      console.error('Failed to send message:', err)

      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))

      setError(err instanceof Error ? err : new Error('Failed to send message'))
      throw err
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [userId, conversationId, getToken])

  /**
   * Cancel the current streaming request
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [])

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
  }
}
