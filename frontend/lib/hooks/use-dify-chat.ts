"use client"

import { useState, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Message, MessageFile, DifyMessage, DifyMessagesResponse } from '@/lib/types/chat'

interface UseDifyChatProps {
  userId: string
  conversationId: string
}

interface UseDifyChatResult {
  messages: Message[]
  isStreaming: boolean
  isPending: boolean
  error: Error | null
  sendMessage: (query: string) => Promise<{ conversationId: string; title?: string } | null>
  cancelStream: () => void
  stopAndRemoveMessage: () => void
}

/**
 * Hook for managing chat messages with TanStack Query
 *
 * Features:
 * - Cached historical messages (instant conversation switching)
 * - Real-time SSE streaming for new messages
 * - Automatic cache invalidation after streaming
 * - Optimistic UI updates
 */
export function useDifyChat({ userId, conversationId }: UseDifyChatProps): UseDifyChatResult {
  const queryClient = useQueryClient()
  const [streamingMessages, setStreamingMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState<Error | null>(null)

  // For canceling streaming
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Fetch historical messages with React Query (cached)
   * Only fetches when conversationId exists
   *
   * Cache automatically provides instant loads for previously-viewed conversations
   * For first-time loads, skeleton UI displays (clearer than showing wrong conversation)
   */
  const {
    data: historicalMessages = [],
    error: historyError,
    isPending,
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []

      let allMessages: DifyMessage[] = []
      let firstId: string | undefined = undefined
      let hasMore = true

      // Load all pages until has_more is false
      while (hasMore) {
        const url = `/api/dify/messages?conversationId=${conversationId}&limit=100${
          firstId ? `&first_id=${firstId}` : ''
        }`

        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        })

        if (!response.ok) {
          throw new Error(`Failed to load messages: ${response.statusText}`)
        }

        const result: DifyMessagesResponse = await response.json()
        const pageMessages = result.data || []

        allMessages = [...allMessages, ...pageMessages]
        hasMore = result.has_more || false

        // Get last message ID for next page
        if (hasMore && pageMessages.length > 0) {
          firstId = pageMessages[pageMessages.length - 1].id
        }
      }

      // Transform all messages to UI format
      // Dify returns newest first, reverse to get chronological order
      const transformedMessages: Message[] = allMessages
        .reverse()
        .flatMap((msg) => [
          {
            id: `${msg.id}-user`,
            role: 'user' as const,
            content: msg.query,
            createdAt: new Date(msg.created_at * 1000),
            isHistorical: true,
          },
          {
            id: `${msg.id}-assistant`,
            role: 'assistant' as const,
            content: msg.answer,
            createdAt: new Date(msg.created_at * 1000),
            isHistorical: true,
          },
        ])

      return transformedMessages
    },
    enabled: !!conversationId && !!userId, // Only fetch if conversation exists
    staleTime: 30 * 1000, // 30 seconds (messages rarely change after loading)
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection)
  })

  // Combine historical + streaming messages
  const messages = [...historicalMessages, ...streamingMessages]

  /**
   * Send a message and stream the response
   * Returns the new conversation ID and title if this was a new conversation
   */
  const sendMessage = useCallback(
    async (query: string): Promise<{ conversationId: string; title?: string } | null> => {
      if (!userId) {
        throw new Error('Not authenticated')
      }

      setIsStreaming(true)
      setStreamError(null)

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Add user message immediately (optimistic)
      const userMessageId = `temp-${Date.now()}-user`
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: query,
        createdAt: new Date(),
        isHistorical: false,
      }
      setStreamingMessages((prev) => [...prev, userMessage])

      // Assistant message that will be updated as it streams
      const assistantMessageId = `temp-${Date.now()}-assistant`
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isLoading: true,
        isHistorical: false,
      }
      setStreamingMessages((prev) => [...prev, assistantMessage])

      try {
        const response = await fetch('/api/dify/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            query,
            conversationId: conversationId || '',
          }),
          signal: abortControllerRef.current.signal,
        })

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
        let generatedTitle: string | undefined = undefined
        let currentTaskId: string | null = null
        const messageFiles: MessageFile[] = []

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
                    case 'workflow_started':
                      console.log('Workflow started:', data.workflow_run_id)
                      currentTaskId = data.task_id
                      break

                    case 'node_started':
                      console.log(`Node started: ${data.data.title}`)
                      break

                    case 'node_finished':
                      if (data.data.status === 'failed') {
                        console.error(`Node failed: ${data.data.title}`, data.data.error)
                      }
                      break

                    case 'workflow_finished':
                      if (data.data.status === 'failed') {
                        console.error('Workflow failed:', data.data.error)
                      }
                      break

                    case 'message':
                      // Accumulate text and update assistant message
                      accumulatedText += data.answer
                      currentTaskId = data.task_id

                      setStreamingMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === assistantMessageId
                            ? {
                                ...msg,
                                content: accumulatedText,
                                isLoading: false,
                                task_id: currentTaskId || undefined,
                                files: messageFiles.length > 0 ? messageFiles : undefined,
                              }
                            : msg
                        )
                      )

                      // Capture conversation_id for new conversations
                      if (data.conversation_id && !conversationId) {
                        newConversationId = data.conversation_id
                      }
                      break

                    case 'message_file':
                      // AI generated a file (image, document, etc.)
                      messageFiles.push({
                        id: data.id,
                        type: data.type as MessageFile['type'],
                        url: data.url,
                        belongs_to: data.belongs_to as MessageFile['belongs_to'],
                      })

                      // Update message with new file
                      setStreamingMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === assistantMessageId ? { ...msg, files: [...messageFiles] } : msg
                        )
                      )
                      break

                    case 'message_replace':
                      // Content moderation replaced the message
                      accumulatedText = data.answer
                      setStreamingMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === assistantMessageId ? { ...msg, content: accumulatedText } : msg
                        )
                      )
                      break

                    case 'message_end':
                      // Streaming complete - capture metadata
                      if (data.metadata?.usage) {
                        const { total_tokens, total_price, currency } = data.metadata.usage
                        console.log('[Token Usage]', {
                          conversation_id: data.conversation_id,
                          message_id: data.message_id,
                          tokens: total_tokens,
                          cost: total_price ? `${currency} ${total_price}` : 'N/A',
                        })
                      }
                      break

                    case 'tts_message':
                      console.log('TTS audio chunk received')
                      // TODO: If TTS is enabled, decode base64 and play audio
                      break

                    case 'tts_message_end':
                      console.log('TTS audio streaming complete')
                      break

                    case 'ping':
                      // Keep-alive ping (every 10 seconds)
                      break

                    case 'error':
                      throw new Error(data.message || 'Dify API error')

                    default:
                      console.warn('Unknown SSE event type:', data.event)
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

        // Generate and set conversation title for new conversations
        if (newConversationId && !conversationId) {
          try {
            // Generate title using LLM
            const titleResponse = await fetch('/api/generate-title', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'same-origin',
              body: JSON.stringify({
                query,
                response: accumulatedText,
              }),
            })

            if (titleResponse.ok) {
              const { title } = await titleResponse.json()

              // Rename conversation in Dify
              const renameResponse = await fetch('/api/dify/rename', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                  conversationId: newConversationId,
                  name: title,
                }),
              })

              if (renameResponse.ok) {
                const renameData = await renameResponse.json()
                generatedTitle = renameData.name
                console.log(`[Title] Generated: "${generatedTitle}" for conversation ${newConversationId}`)
              }
            }
          } catch (titleError) {
            console.warn('Failed to generate conversation title:', titleError)
          }
        }

        // After streaming completes, invalidate cache to refetch with new message
        // This syncs the cache with the server state
        if (conversationId) {
          await queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        }

        // If this was a new conversation, invalidate messages for the new ID
        if (newConversationId && !conversationId) {
          await queryClient.invalidateQueries({ queryKey: ['messages', newConversationId] })
        }

        // Clear streaming messages (now in historical cache)
        setStreamingMessages([])

        return newConversationId ? { conversationId: newConversationId, title: generatedTitle } : null
      } catch (err) {
        console.error('Failed to send message:', err)

        // Remove the optimistic messages on error
        setStreamingMessages([])

        setStreamError(err instanceof Error ? err : new Error('Failed to send message'))
        throw err
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [userId, conversationId, queryClient]
  )

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

  /**
   * Stop streaming and remove the incomplete message
   */
  const stopAndRemoveMessage = useCallback(() => {
    // Get the task_id from the last streaming message
    const lastStreamingMessage = streamingMessages[streamingMessages.length - 1]
    const taskId = lastStreamingMessage?.role === 'assistant' ? lastStreamingMessage.task_id : null

    // Cancel the stream locally
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Call the stop API if we have a task_id
    if (taskId) {
      fetch('/api/dify/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          taskId,
        }),
      }).catch((err) => {
        console.log('Stop API call failed (already aborted locally):', err)
      })
    }

    // Remove the incomplete streaming messages (both user and assistant)
    setStreamingMessages([])
    setIsStreaming(false)
  }, [streamingMessages])

  return {
    messages,
    isStreaming,
    isPending,
    error: historyError || streamError,
    sendMessage,
    cancelStream,
    stopAndRemoveMessage,
  }
}
