import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseTypewriterTextOptions {
  /**
   * Time in milliseconds per character
   * @default 5 (200 characters per second)
   */
  speed?: number

  /**
   * If true, display text instantly without animation
   * Useful for historical messages
   * @default false
   */
  instant?: boolean

  /**
   * If true, user has requested to skip animation
   * @default false
   */
  skip?: boolean
}

export interface UseTypewriterTextResult {
  /** The currently visible animated text */
  displayText: string

  /** Whether animation is currently in progress */
  isTyping: boolean

  /** Function to instantly show all remaining text */
  skipAnimation: () => void
}

/**
 * Custom hook for smooth typewriter animation of streaming text
 *
 * Based on the Upstash smooth streaming approach:
 * - Decouples network streaming from visual streaming
 * - Uses requestAnimationFrame for smooth 60fps rendering
 * - Configurable character speed
 *
 * @param text - The full text to display (updates as chunks arrive)
 * @param options - Configuration options
 * @returns Animation state and control functions
 */
export function useTypewriterText(
  text: string,
  options: UseTypewriterTextOptions = {}
): UseTypewriterTextResult {
  const { speed = 5, instant = false, skip = false } = options

  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Track animation state
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const currentLengthRef = useRef(0)

  // Skip animation function
  const skipAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setDisplayText(text)
    setIsTyping(false)
    currentLengthRef.current = text.length
  }, [text])

  useEffect(() => {
    // If instant mode, show all text immediately
    if (instant) {
      setDisplayText(text)
      setIsTyping(false)
      return
    }

    // If user requested skip, show all text
    if (skip) {
      skipAnimation()
      return
    }

    // If text is shorter than current display (e.g., conversation switched), reset
    if (text.length < currentLengthRef.current) {
      currentLengthRef.current = 0
      setDisplayText('')
      setIsTyping(false)
      startTimeRef.current = null
      return
    }

    // If text hasn't changed or is already fully displayed, do nothing
    if (text.length === currentLengthRef.current) {
      return
    }

    // Start animation
    setIsTyping(true)

    const animate = (timestamp: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      // Calculate how many characters should be visible based on elapsed time
      const elapsed = timestamp - startTimeRef.current
      const targetLength = Math.min(
        currentLengthRef.current + Math.floor(elapsed / speed),
        text.length
      )

      // Update display if we should show more characters
      if (targetLength > currentLengthRef.current) {
        currentLengthRef.current = targetLength
        setDisplayText(text.slice(0, targetLength))
      }

      // Continue animation if not complete
      if (targetLength < text.length) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        setIsTyping(false)
        animationFrameRef.current = null
        startTimeRef.current = null
      }
    }

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount or when text changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [text, speed, instant, skip, skipAnimation])

  return {
    displayText,
    isTyping,
    skipAnimation,
  }
}
