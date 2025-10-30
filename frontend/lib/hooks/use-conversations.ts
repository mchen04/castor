"use client"

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useCallback } from 'react'
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
  updateConversationName: (conversationId: string, newName: string) => void
  addConversation: (conversationId: string, name: string) => void
}

/**
 * Hook for managing conversations with TanStack Query
 *
 * Features:
 * - Automatic caching with 2-minute freshness
 * - Infinite scroll pagination
 * - Optimistic updates for delete/rename
 * - Automatic rollback on error
 * - Request deduplication
 */
export function useConversations(userId: string): UseConversationsResult {
  const queryClient = useQueryClient()

  // Fetch conversations with infinite query for pagination
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['conversations', userId],
    queryFn: async ({ pageParam }) => {
      const url = pageParam
        ? `/api/dify/conversations?limit=20&last_id=${pageParam}`
        : '/api/dify/conversations?limit=20'

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: DifyConversationsResponse = await response.json()
      return result
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // Return undefined if no more pages, otherwise return last conversation ID
      if (!lastPage.has_more || !lastPage.data || lastPage.data.length === 0) {
        return undefined
      }
      const lastConv = lastPage.data[lastPage.data.length - 1]
      return lastConv?.id
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 2 * 60 * 1000, // 2 minutes (conversations change less frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection)
  })

  // Flatten paginated data into single array
  const conversations: Conversation[] =
    data?.pages.flatMap((page) =>
      (page.data || []).map((conv) => ({
        id: conv.id,
        name: conv.name || 'New Conversation',
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }))
    ) || []

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch('/api/dify/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ conversationId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`)
      }

      return response.json()
    },
    onMutate: async (conversationId) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] })

      // Snapshot current state for rollback
      const previousData = queryClient.getQueryData(['conversations', userId])

      // Optimistically remove conversation from cache
      queryClient.setQueryData<InfiniteData<DifyConversationsResponse>>(
        ['conversations', userId],
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: (page.data || []).filter((c) => c.id !== conversationId),
            })),
          }
        }
      )

      return { previousData }
    },
    onError: (err, conversationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['conversations', userId], context.previousData)
      }
      console.error('Failed to delete conversation:', err)
    },
  })

  // Rename mutation with optimistic update
  const renameMutation = useMutation({
    mutationFn: async ({
      conversationId,
      newName,
    }: {
      conversationId: string
      newName: string
    }) => {
      const response = await fetch('/api/dify/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ conversationId, name: newName }),
      })

      if (!response.ok) {
        throw new Error(`Failed to rename conversation: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    },
    onMutate: async ({ conversationId, newName }) => {
      console.log('[Rename] onMutate - Starting optimistic update', { conversationId, newName })
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] })

      const previousData = queryClient.getQueryData(['conversations', userId])

      // Optimistically update conversation name
      queryClient.setQueryData<InfiniteData<DifyConversationsResponse>>(
        ['conversations', userId],
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: (page.data || []).map((c) =>
                c.id === conversationId
                  ? { ...c, name: newName, updated_at: Date.now() / 1000 }
                  : c
              ),
            })),
          }
        }
      )

      console.log('[Rename] onMutate - Optimistic update complete')
      return { previousData }
    },
    onError: (err, variables, context) => {
      console.log('[Rename] onError - Rolling back', { err: err.message })
      if (context?.previousData) {
        queryClient.setQueryData(['conversations', userId], context.previousData)
      }
      console.error('Failed to rename conversation:', err)
    },
  })

  /**
   * Manual local state update for conversation name
   * Used after auto-generated title is created to avoid API refetch
   */
  const updateConversationName = useCallback(
    (conversationId: string, newName: string) => {
      queryClient.setQueryData<InfiniteData<DifyConversationsResponse>>(
        ['conversations', userId],
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: (page.data || []).map((c) =>
                c.id === conversationId
                  ? { ...c, name: newName, updated_at: Date.now() / 1000 }
                  : c
              ),
            })),
          }
        }
      )
    },
    [queryClient, userId]
  )

  /**
   * Add a new conversation to the cache
   * Used when a new conversation is created to immediately show it in the list
   */
  const addConversation = useCallback(
    (conversationId: string, name: string) => {
      queryClient.setQueryData<InfiniteData<DifyConversationsResponse>>(
        ['conversations', userId],
        (old) => {
          if (!old) {
            // If no data exists, create initial structure
            return {
              pages: [
                {
                  data: [
                    {
                      id: conversationId,
                      name: name || 'New Conversation',
                      created_at: Date.now() / 1000,
                      updated_at: Date.now() / 1000,
                    },
                  ],
                  has_more: false,
                  limit: 20,
                },
              ],
              pageParams: [undefined],
            }
          }

          // Add to the beginning of the first page (newest conversations first)
          const newConversation = {
            id: conversationId,
            name: name || 'New Conversation',
            created_at: Date.now() / 1000,
            updated_at: Date.now() / 1000,
          }

          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                // Only add to first page, at the beginning
                return {
                  ...page,
                  data: [newConversation, ...(page.data || [])],
                }
              }
              return page
            }),
          }
        }
      )
    },
    [queryClient, userId]
  )

  /**
   * Create a new conversation
   * Returns empty string - Dify creates conversation on first message
   */
  const createConversation = useCallback(() => {
    return ''
  }, [])

  /**
   * Wrapper for loadConversations (for backward compatibility)
   * In TanStack Query, this is handled automatically on mount
   */
  const loadConversations = useCallback(async () => {
    // Invalidate to force refetch
    await queryClient.invalidateQueries({ queryKey: ['conversations', userId] })
  }, [queryClient, userId])

  /**
   * Load more conversations (pagination)
   */
  const loadMoreConversations = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    conversations,
    isLoading: isLoading || isFetchingNextPage,
    error: error as Error | null,
    hasMore: hasNextPage ?? false,
    loadConversations,
    loadMoreConversations,
    createConversation,
    deleteConversation: (conversationId: string) =>
      deleteMutation.mutateAsync(conversationId),
    renameConversation: (conversationId: string, newName: string) =>
      renameMutation.mutateAsync({ conversationId, newName }),
    updateConversationName,
    addConversation,
  }
}
