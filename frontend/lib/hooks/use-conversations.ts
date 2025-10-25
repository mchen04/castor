"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Conversation, DifyConversationsResponse } from '@/lib/types/chat'

interface UseConversationsResult {
  conversations: Conversation[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  loadConversations: () => Promise<void>
  loadMoreConversations: () => Promise<void>
  createConversation: () => string
  deleteConversation: (conversationId: string) => Promise<void>
  renameConversation: (conversationId: string, newName: string) => Promise<void>
}

/**
 * Normalize conversation name by removing Dify's server-side truncation
 * Dify inconsistently truncates names to 21 chars + "…"
 * We strip the ellipsis so CSS can handle ALL truncation uniformly
 */
function normalizeConversationName(name: string): string {
  // Dify's truncation pattern: exactly 21 chars ending with "…"
  if (name.length === 21 && name.endsWith('…')) {
    return name.slice(0, -1) // Remove trailing "…"
  }
  return name
}

export function useConversations(userId: string): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [lastId, setLastId] = useState<string | undefined>(undefined)

  const loadConversations = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/dify/conversations?limit=20`,
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
      // Normalize names to remove Dify's inconsistent server-side truncation
      const transformedConversations: Conversation[] = difyConversations.map((conv) => ({
        id: conv.id,
        name: normalizeConversationName(conv.name || 'New Conversation'),
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }))

      setConversations(transformedConversations)
      setHasMore(result.has_more || false)

      // Set lastId for pagination (last conversation ID)
      if (transformedConversations.length > 0) {
        setLastId(transformedConversations[transformedConversations.length - 1].id)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(err instanceof Error ? err : new Error('Failed to load conversations'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const loadMoreConversations = useCallback(async () => {
    if (!userId || !lastId || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/dify/conversations?limit=20&last_id=${lastId}`,
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

      // Transform and append new conversations
      // Normalize names to remove Dify's inconsistent server-side truncation
      const transformedConversations: Conversation[] = difyConversations.map((conv) => ({
        id: conv.id,
        name: normalizeConversationName(conv.name || 'New Conversation'),
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }))

      setConversations(prev => [...prev, ...transformedConversations])
      setHasMore(result.has_more || false)

      // Update lastId for next pagination
      if (transformedConversations.length > 0) {
        setLastId(transformedConversations[transformedConversations.length - 1].id)
      }
    } catch (err) {
      console.error('Failed to load more conversations:', err)
      setError(err instanceof Error ? err : new Error('Failed to load more conversations'))
    } finally {
      setIsLoading(false)
    }
  }, [userId, lastId, hasMore])

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
    hasMore,
    loadConversations,
    loadMoreConversations,
    createConversation,
    deleteConversation,
    renameConversation,
  }
}
