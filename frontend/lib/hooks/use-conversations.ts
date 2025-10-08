"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
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
  const { getToken } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadConversations = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      // Get Clerk token for authentication
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-conversations?userId=${userId}&limit=100`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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
  }, [userId, getToken])

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
      // Get Clerk token for authentication
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            userId,
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
  }, [userId, getToken, loadConversations])

  /**
   * Rename a conversation
   */
  const renameConversation = useCallback(async (conversationId: string, newName: string) => {
    if (!userId) return

    try {
      // Get Clerk token for authentication
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-rename`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            name: newName,
            userId,
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
  }, [userId, getToken, loadConversations])

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
