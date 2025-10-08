"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Conversation, DifyConversationsResponse } from '@/lib/types/chat'

interface UseConversationsResult {
  conversations: Conversation[]
  isLoading: boolean
  error: Error | null
  loadConversations: () => Promise<void>
  createConversation: () => string
  deleteConversation: (conversationId: string) => Promise<void>
  renameConversation: (conversationId: string, newName: string) => Promise<void>
}

export function useConversations(userId: string): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadConversations = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/dify/conversations?limit=100`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: DifyConversationsResponse = await response.json()
      const difyConversations = result.data || []

      // Transform Dify conversations to UI format
      const transformedConversations: Conversation[] = difyConversations.map((conv) => ({
        id: conv.id,
        name: conv.name || 'New Conversation',
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }))

      setConversations(transformedConversations)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(err instanceof Error ? err : new Error('Failed to load conversations'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  /**
   * Create a new conversation
   * Returns empty string - Dify creates conversation on first message
   */
  const createConversation = useCallback(() => {
    return ''
  }, [])

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!userId) return

    try {
      const response = await fetch(
        `/api/dify/delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            conversationId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`)
      }

      // Reload conversations after deletion
      await loadConversations()
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      throw err
    }
  }, [userId, loadConversations])

  /**
   * Rename a conversation
   */
  const renameConversation = useCallback(async (conversationId: string, newName: string) => {
    if (!userId) return

    try {
      const response = await fetch(
        `/api/dify/rename`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            conversationId,
            name: newName,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to rename conversation: ${response.statusText}`)
      }

      // Reload conversations after rename
      await loadConversations()
    } catch (err) {
      console.error('Failed to rename conversation:', err)
      throw err
    }
  }, [userId, loadConversations])

  return {
    conversations,
    isLoading,
    error,
    loadConversations,
    createConversation,
    deleteConversation,
    renameConversation,
  }
}
