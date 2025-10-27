"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Message, MessageFile, DifyMessage, DifyMessagesResponse } from '@/lib/types/chat'

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
  stopAndRemoveMessage: () => void
}

export function useDifyChat({ userId, conversationId }: UseDifyChatProps): UseDifyChatResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // For canceling streaming
  const abortControllerRef = useRef<AbortController | null>(null)

  // Track which conversation we have loaded
  const loadedConversationIdRef = useRef<string | null>(null)

  /**
   * Load conversation history when conversation changes
   */
  useEffect(() => {
    if (!conversationId || !userId) {
      // New conversation - clear messages
      setMessages([])
      loadedConversationIdRef.current = null
      return
    }

    // Skip reload if we already loaded THIS conversation
    // (happens when first message creates conversation ID)
    if (messages.length > 0 && loadedConversationIdRef.current === conversationId) {
      return
    }

    // Mark that we're loading this conversation
    loadedConversationIdRef.current = conversationId

    // Create abort controller for this fetch
    const abortController = new AbortController()

    const loadHistory = async () => {
      try {
        let allMessages: DifyMessage[] = []
        let firstId: string | undefined = undefined
        let hasMore = true

        // Load all pages until has_more is false
        while (hasMore) {
          const url = `/api/dify/messages?conversationId=${conversationId}&limit=100${
            firstId ? `&first_id=${firstId}` : ''
          }`

          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            signal: abortController.signal,
          })

          if (!response.ok) {
            console.error('Failed to load conversation history:', response.statusText)
            return
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
        // Dify returns newest first, reverse to get chronological order BEFORE flatMap
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

        setMessages(transformedMessages)
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Error loading conversation history:', err)
        setError(err instanceof Error ? err : new Error('Failed to load history'))
      }
    }

    loadHistory()

    // Cleanup: Cancel active streaming when conversation changes
    return () => {
      abortController.abort()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
        setIsStreaming(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userId])

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
      isHistorical: false,
    }
    setMessages(prev => [...prev, userMessage])

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
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch(
        `/api/dify/chat`,
        {
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
                    // Workflow execution started (Chatflow apps)
                    console.log('Workflow started:', data.workflow_run_id)
                    currentTaskId = data.task_id
                    break

                  case 'node_started':
                    // Workflow node started executing
                    console.log(`Node started: ${data.data.title}`)
                    break

                  case 'node_finished':
                    // Workflow node finished executing
                    if (data.data.status === 'failed') {
                      console.error(`Node failed: ${data.data.title}`, data.data.error)
                    }
                    break

                  case 'workflow_finished':
                    // Workflow execution completed
                    if (data.data.status === 'failed') {
                      console.error('Workflow failed:', data.data.error)
                    }
                    break

                  case 'message':
                    // Accumulate text and update assistant message
                    accumulatedText += data.answer
                    currentTaskId = data.task_id

                    setMessages(prev =>
                      prev.map(msg =>
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
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, files: [...messageFiles] }
                          : msg
                      )
                    )
                    break

                  case 'message_replace':
                    // Content moderation replaced the message
                    accumulatedText = data.answer
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: accumulatedText }
                          : msg
                      )
                    )
                    break

                  case 'message_end':
                    // Streaming complete - capture metadata (best practice)
                    if (data.metadata?.usage) {
                      const { total_tokens, total_price, currency } = data.metadata.usage
                      console.log('[Token Usage]', {
                        conversation_id: data.conversation_id,
                        message_id: data.message_id,
                        tokens: total_tokens,
                        cost: total_price ? `${currency} ${total_price}` : 'N/A',
                      })
                      // TODO: Store in analytics/monitoring system if needed
                    }
                    break

                  case 'tts_message':
                    // TTS audio chunk (base64-encoded MP3)
                    console.log('TTS audio chunk received')
                    // TODO: If TTS is enabled, decode base64 and play audio
                    // const audioChunk = atob(data.audio)
                    // playAudioChunk(audioChunk)
                    break

                  case 'tts_message_end':
                    // TTS streaming complete
                    console.log('TTS audio streaming complete')
                    break

                  case 'ping':
                    // Keep-alive ping (every 10 seconds)
                    break

                  case 'error':
                    throw new Error(data.message || 'Dify API error')

                  default:
                    // Log unknown events for debugging
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
      // Await completion to ensure title is ready before returning conversationId
      if (newConversationId && !conversationId) {
        try {
          // Generate title using LLM (with 4-tier fallback cascade)
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

            // Rename conversation in Dify with generated title
            // Await to ensure rename completes before conversations reload
            await fetch('/api/dify/rename', {
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

            console.log(`[Title] Generated: "${title}" for conversation ${newConversationId}`)
          }
        } catch (titleError) {
          // Silently fail - title generation is a UX enhancement, not critical
          console.warn('Failed to generate conversation title:', titleError)
        }
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
  }, [userId, conversationId])

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
    // Get the task_id from the last assistant message
    const lastMessage = messages[messages.length - 1]
    const taskId = lastMessage?.role === 'assistant' ? lastMessage.task_id : null

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
        // Ignore errors from stop API (already aborted locally)
        console.log('Stop API call failed (already aborted locally):', err)
      })
    }

    // Remove the last assistant message (incomplete response)
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1]
      // Check if last message is an incomplete assistant response
      if (lastMsg?.role === 'assistant' && (lastMsg.isLoading || lastMsg.content.length > 0)) {
        // Remove both user message and incomplete assistant response
        return prev.slice(0, -2)
      }
      return prev
    })

    setIsStreaming(false)
  }, [messages])

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
    stopAndRemoveMessage,
  }
}
