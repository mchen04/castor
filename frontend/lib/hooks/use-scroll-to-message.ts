import { useCallback, type RefObject } from 'react'

/**
 * Reusable hook for scrolling to messages
 * Provides smooth scrolling behavior with optimal timing
 */
export function useScrollToMessage() {
  /**
   * Scroll to a specific message or the last message in the container
   * @param containerRef - Ref to the scrollable container
   * @param messageSelector - CSS selector for the target message (defaults to last message)
   */
  const scrollToMessage = useCallback((
    containerRef: RefObject<HTMLElement | null>,
    messageSelector: string = '[data-role]:last-child'
  ) => {
    if (!containerRef.current) return

    // Use requestAnimationFrame for smooth timing after DOM update
    requestAnimationFrame(() => {
      const element = containerRef.current?.querySelector(messageSelector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [])

  /**
   * Scroll to the bottom of the container
   * Used when loading conversation history
   * @param containerRef - Ref to the scrollable container
   */
  const scrollToBottom = useCallback((
    containerRef: RefObject<HTMLElement | null>
  ) => {
    if (!containerRef.current) return

    // Use requestAnimationFrame for smooth timing after DOM update
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    })
  }, [])

  return { scrollToMessage, scrollToBottom }
}
