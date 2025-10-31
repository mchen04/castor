'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * QueryProvider - Wraps the app with TanStack Query client
 *
 * Creates a new QueryClient instance per component mount to avoid sharing
 * state between different requests in SSR scenarios.
 *
 * Configured with chat-optimized defaults:
 * - refetchOnWindowFocus: false (prevents excessive refetches in chat UI)
 * - refetchOnReconnect: true (sync on network reconnect)
 * - retry: 1 (single retry on failure)
 * - staleTime: 5 minutes (cache freshness window)
 * - gcTime: 10 minutes (garbage collection timing)
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside useState to ensure it's only created once per mount
  // and not shared between server/client or different requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Chat-optimized defaults
            refetchOnWindowFocus: false, // Prevent excessive refetches in chat UI
            refetchOnReconnect: true, // Refetch on network reconnect
            retry: 1, // Only retry once on failure
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
          },
          mutations: {
            // Don't retry mutations (chat actions are one-time)
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools temporarily disabled to prevent Fast Refresh during chat operations
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
      */}
    </QueryClientProvider>
  )
}
