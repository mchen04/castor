'use client'

import { useMemo } from 'react'
import { buildDifyChatUrl } from '@/lib/dify-url-encoder'

interface DifyChatbotProps {
  userId: string
  baseUrl?: string
}

/**
 * Dify chatbot iframe component with user identification
 * Encodes userId and passes it to Dify for conversation persistence
 */
export function DifyChatbot({
  userId,
  baseUrl = 'https://udify.app/chat/fIZjEA7ZAmd1LKh8',
}: DifyChatbotProps) {
  const iframeSrc = useMemo(
    () => buildDifyChatUrl(baseUrl, userId),
    [baseUrl, userId]
  )

  return (
    <iframe
      src={iframeSrc}
      className="w-full h-full border-0"
      allow="microphone"
      title="GEO Expert Chatbot"
    />
  )
}
