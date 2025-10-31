"use client"

import React, { useState, useRef, useEffect, type FC } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  Square,
  BotIcon,
} from "lucide-react"
import { LazyMotion, MotionConfig, domAnimation } from "motion/react"
import * as m from "motion/react-m"
import { Button } from "@/components/ui/button"
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button"
import { LoadingDots } from "@/components/ui/loading-dots"
import { useScrollToMessage } from "@/lib/hooks/use-scroll-to-message"
import { useTypewriterText } from "@/lib/hooks/use-typewriter-text"
import type { Message } from "@/lib/types/chat"

interface ThreadProps {
  messages: Message[]
  isStreaming: boolean
  isPending: boolean
  conversationId: string
  onSendMessage: (query: string) => Promise<void>
  onStopAndRemove: () => void
}

export const Thread: FC<ThreadProps> = ({
  messages,
  isStreaming,
  isPending,
  conversationId,
  onSendMessage,
  onStopAndRemove,
}) => {
  const [inputValue, setInputValue] = useState("")
  const viewportRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [spacerHeight, setSpacerHeight] = useState("32px") // Dynamic spacer height
  const { scrollToBottom: scrollToBottomSmooth } = useScrollToMessage()

  // Track previous message length to detect new messages
  const prevMessageLengthRef = useRef(messages.length)
  // Track previous messages to detect history load
  const prevMessagesRef = useRef<Message[]>([])

  // Scroll to user's message after sending (waits for DOM update)
  useEffect(() => {
    console.log('🔍 [SCROLL DEBUG] Effect triggered', {
      currentLength: messages.length,
      previousLength: prevMessageLengthRef.current,
      messages: messages.map(m => ({ id: m.id, role: m.role, isLoading: m.isLoading, isHistorical: m.isHistorical }))
    })

    // Only scroll on new message, not on updates to existing messages
    const newMessageAdded = messages.length > prevMessageLengthRef.current

    console.log('🔍 [SCROLL DEBUG] newMessageAdded:', newMessageAdded)

    if (newMessageAdded && messages.length >= 2) {
      console.log('🔍 [SCROLL DEBUG] Scroll condition met, scheduling scroll...')

      // Use triple requestAnimationFrame for proper timing after DOM update
      // This ensures all layout shifts from React rendering are complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            console.log('🔍 [SCROLL DEBUG] Inside RAF, querying DOM...')

            // Check viewport ref
            if (!viewportRef.current) {
              console.error('❌ [SCROLL DEBUG] viewportRef.current is null!')
              return
            }

            // Comprehensive viewport diagnostics
            const viewport = viewportRef.current
            console.log('🔍 [SCROLL DEBUG] Viewport diagnostics:', {
              scrollTop: viewport.scrollTop,
              scrollHeight: viewport.scrollHeight,
              clientHeight: viewport.clientHeight,
              offsetHeight: viewport.offsetHeight,
              canScroll: viewport.scrollHeight > viewport.clientHeight,
              scrollableHeight: viewport.scrollHeight - viewport.clientHeight,
              overflow: getComputedStyle(viewport).overflow,
              overflowY: getComputedStyle(viewport).overflowY,
            })

            // Find the second-to-last message (user's message)
            // Last message is loading assistant response
            const allMessages = viewportRef.current?.querySelectorAll('[data-role]')

            console.log('🔍 [SCROLL DEBUG] Found messages with [data-role]:', allMessages?.length)
            console.log('🔍 [SCROLL DEBUG] Messages:', Array.from(allMessages || []).map(el => ({
              role: el.getAttribute('data-role'),
              text: el.textContent?.substring(0, 50)
            })))

            const userMessage = allMessages?.[allMessages.length - 2]

            if (userMessage) {
              const messageOffsetTop = (userMessage as HTMLElement).offsetTop
              console.log('🔍 [SCROLL DEBUG] User message found:', {
                role: userMessage.getAttribute('data-role'),
                text: userMessage.textContent?.substring(0, 50),
                offsetTop: messageOffsetTop
              })

              const scrollTopBefore = viewport.scrollTop
              // Scroll to position the user message at the top with 16px padding
              const targetScrollTop = Math.max(0, messageOffsetTop - 16)

              // DYNAMIC SPACER: Set to viewport height to allow scrolling message to top
              // This is the minimum needed - grows automatically as content expands
              const neededSpacerHeight = viewport.clientHeight
              setSpacerHeight(`${neededSpacerHeight}px`)

              console.log('🔍 [SCROLL DEBUG] Attempting scroll:', {
                targetScrollTop,
                scrollTopBefore,
                method: 'direct assignment (instant)',
                calculatedSpacerHeight: neededSpacerHeight,
                viewportClientHeight: viewport.clientHeight
              })

              // Try direct assignment (instant scroll, no animation)
              viewport.scrollTop = targetScrollTop

              // Check immediately
              console.log('🔍 [SCROLL DEBUG] Immediate check after assignment:', {
                scrollTop: viewport.scrollTop,
                changed: viewport.scrollTop !== scrollTopBefore
              })

              // Check again after delay for smooth scroll
              setTimeout(() => {
                console.log('🔍 [SCROLL DEBUG] Final check after 100ms:', {
                  scrollTopBefore,
                  targetScrollTop,
                  scrollTopAfter: viewport.scrollTop,
                  changed: scrollTopBefore !== viewport.scrollTop,
                  reachedTarget: Math.abs(viewport.scrollTop - targetScrollTop) < 5
                })
              }, 100)
            } else {
              console.error('❌ [SCROLL DEBUG] User message not found! allMessages.length:', allMessages?.length)
            }
          })
        })
      })
    } else {
      console.log('🔍 [SCROLL DEBUG] Scroll condition NOT met:', {
        newMessageAdded,
        messagesLength: messages.length,
        meetsLengthRequirement: messages.length >= 2
      })
    }

    // IMPORTANT: Update ref on every effect run to stay in sync
    // This prevents the ref from getting stale when messages update without length changes
    prevMessageLengthRef.current = messages.length
    console.log('🔍 [SCROLL DEBUG] Updated prevMessageLengthRef to:', messages.length)
  }, [messages])

  // Scroll to bottom when loading conversation history
  useEffect(() => {
    const wasEmpty = prevMessagesRef.current.length === 0
    const nowHasMessages = messages.length > 0
    const allHistorical = messages.every(m => m.isHistorical)

    if (wasEmpty && nowHasMessages && allHistorical) {
      // History just loaded → scroll to bottom
      scrollToBottomSmooth(viewportRef)
    }

    prevMessagesRef.current = messages
  }, [messages, scrollToBottomSmooth])

  // Ensure spacer grows as content grows during streaming
  useEffect(() => {
    if (!viewportRef.current || messages.length === 0) return

    // Recalculate spacer to ensure scroll range adapts to growing content
    requestAnimationFrame(() => {
      const viewport = viewportRef.current
      if (!viewport) return

      const allMessages = viewport.querySelectorAll('[data-role]')
      if (allMessages.length === 0) return

      // Get the last message position (could be user or assistant)
      const lastMessage = allMessages[allMessages.length - 1]
      const lastMessageBottom = (lastMessage as HTMLElement).offsetTop + (lastMessage as HTMLElement).offsetHeight

      // Spacer ensures we can scroll content naturally
      // Minimum: viewport height OR enough to keep some content below fold
      const neededHeight = Math.max(
        viewport.clientHeight, // Minimum: allows scrolling
        lastMessageBottom + 100 // Small 100px buffer (reduced from 30% viewport)
      )

      setSpacerHeight(prev => {
        const prevHeight = parseInt(prev) || 0
        // Only grow the spacer, never shrink (prevents scroll jumps during streaming)
        return `${Math.max(prevHeight, neededHeight)}px`
      })
    })
  }, [messages])

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (viewportRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = viewportRef.current
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
    }
  }

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isStreaming) return

    const query = inputValue
    setInputValue("")
    await onSendMessage(query)
  }

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div
          className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
          style={{
            ["--thread-max-width" as string]: "44rem",
          }}
        >
          <div
            ref={viewportRef}
            onScroll={handleScroll}
            className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4 pt-16 md:pt-4"
          >
            {/* Show skeleton only when loading an actual conversation (not new threads) */}
            {isPending && conversationId && messages.length === 0 && <MessageSkeleton />}

            {/* Show welcome UI for new conversations */}
            {messages.length === 0 && (!conversationId || !isPending) && <ThreadWelcome onSendMessage={onSendMessage} />}

            {/* Render messages */}
            {messages.map((message) => (
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            ))}

            {messages.length > 0 && (
              <div className="aui-thread-viewport-spacer" style={{ minHeight: spacerHeight }} />
            )}

            <Composer
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
              onCancel={onStopAndRemove}
            />
          </div>

          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-24 z-10 self-center rounded-full p-3 border border-border/50 bg-background shadow-md hover:bg-muted transition-colors"
              aria-label="Scroll to bottom"
            >
              <ArrowDownIcon className="size-5" />
            </button>
          )}
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}

/**
 * MessageSkeleton - Empty state while loading conversation history
 * Just shows blank viewport (no fake messages)
 */
const MessageSkeleton: FC = () => {
  return <div className="flex-1" />
}

interface ThreadWelcomeProps {
  onSendMessage: (query: string) => Promise<void>
}

const ThreadWelcome: FC<ThreadWelcomeProps> = ({ onSendMessage }) => {
  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col px-4">
      <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex w-full flex-col justify-center items-center text-center px-4 py-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="aui-thread-welcome-message-motion-1 text-3xl font-semibold mb-2"
          >
            Welcome to Castor GEO!
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="aui-thread-welcome-message-motion-2 text-lg text-muted-foreground"
          >
            Your AI-powered assistant for Generative Search Optimization
          </m.div>
        </div>
      </div>
      <ThreadSuggestions onSendMessage={onSendMessage} />
    </div>
  )
}

interface ThreadSuggestionsProps {
  onSendMessage: (query: string) => Promise<void>
}

const ThreadSuggestions: FC<ThreadSuggestionsProps> = ({ onSendMessage }) => {
  return (
    <div className="aui-thread-welcome-suggestions w-full px-4 pb-6">
      <div className="grid gap-2 grid-cols-1 @sm:grid-cols-2 @md:grid-cols-2">
        {[
          "What is Generative Search Optimization?",
          "How to optimize content for AI search?",
          "Best practices for structured data?",
          "Tell me about AI search trends in 2025",
        ].map((prompt, index) => (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${index}`}
            className={`aui-thread-welcome-suggestion-display ${index >= 2 ? "hidden @sm:block" : ""}`}
          >
            <button
              className="w-full hover:bg-muted/80 flex items-center justify-center rounded-lg border border-border/50 p-4 transition-colors text-sm font-medium"
              onClick={() => onSendMessage(prompt)}
            >
              <span className="text-center">
                {prompt}
              </span>
            </button>
          </m.div>
        ))}
      </div>
    </div>
  )
}

interface ComposerProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  isStreaming: boolean
  onCancel: () => void
}

const Composer: FC<ComposerProps> = ({
  inputValue,
  onInputChange,
  onSubmit,
  isStreaming,
  onCancel,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible bg-background pb-4 md:pb-6">
      <form
        onSubmit={onSubmit}
        className="aui-composer-root relative flex items-center w-full rounded-full bg-muted shadow-sm border border-border/50 px-4 py-2.5 transition-shadow focus-within:shadow-md focus-within:border-border"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder="Send a message..."
          className="aui-composer-input flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          autoFocus
          aria-label="Message input"
        />
        <div className="aui-composer-action-wrapper ml-2 flex items-center">
          {!isStreaming ? (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="aui-composer-send size-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              <ArrowUpIcon className="aui-composer-send-icon size-4" />
            </button>
          ) : (
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              size="icon"
              className="aui-composer-cancel size-8 rounded-full hover:bg-muted-foreground/10"
              aria-label="Stop generating"
            >
              <Square className="aui-composer-cancel-icon size-3.5 fill-current" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

interface MessageProps {
  message: Message
}

const AssistantMessage: FC<MessageProps> = React.memo(({ message }) => {
  const [copied, setCopied] = useState(false)
  const [skipRequested, setSkipRequested] = useState(false)

  // Use typewriter effect for streaming messages, instant for historical
  const { displayText, isTyping, skipAnimation } = useTypewriterText(
    message.content,
    {
      speed: 20, // 20ms per character = 50 chars/sec (ChatGPT-style)
      instant: message.isHistorical, // No animation for historical messages
      skip: skipRequested,
    }
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSkip = () => {
    setSkipRequested(true)
    skipAnimation()
  }

  // Show loading state (three dots with bot icon, no copy button)
  if (message.isLoading) {
    return (
      <div
        className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
        data-role="assistant"
      >
        <div className="aui-assistant-message-content mx-2 flex items-center gap-2 text-muted-foreground">
          <BotIcon className="size-5" />
          <LoadingDots />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] py-4 last:mb-24${!message.isHistorical ? ' animate-in duration-150 ease-out fade-in slide-in-from-bottom-1' : ''}`}
      data-role="assistant"
    >
      <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground whitespace-pre-wrap">
        {displayText}
        {isTyping && (
          <span className="aui-typewriter-cursor inline-block w-[2px] h-5 ml-0.5 bg-foreground animate-typewriter-blink" />
        )}
      </div>

      {/* Display generated files (images, documents, etc.) */}
      {message.files && message.files.length > 0 && (
        <div className="aui-assistant-message-files mt-3 mx-2 flex flex-wrap gap-2">
          {message.files.map((file) => (
            file.type === 'image' ? (
              <img
                key={file.id}
                src={file.url}
                alt="Generated image"
                className="max-w-sm rounded-lg border shadow-sm"
              />
            ) : (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="capitalize">{file.type} file</span>
              </a>
            )
          ))}
        </div>
      )}

      {/* Show copy button when message has content */}
      {!message.isLoading && message.content && (
        <div className="aui-assistant-message-footer mt-2 ml-2 flex gap-2">
          {/* Skip button (only show while typing) */}
          {isTyping && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          )}
          <TooltipIconButton tooltip="Copy" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </TooltipIconButton>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if message content or state actually changed
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isLoading === nextProps.message.isLoading &&
    prevProps.message.isHistorical === nextProps.message.isHistorical
  )
})

const UserMessage: FC<MessageProps> = React.memo(({ message }) => {
  return (
    <div
      className={`aui-user-message-root mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 first:mt-3 last:mb-5 [&:where(>*)]:col-start-2${!message.isHistorical ? ' animate-in duration-150 ease-out fade-in slide-in-from-bottom-1' : ''}`}
      data-role="user"
    >
      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
          {message.content}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if message content changed
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isHistorical === nextProps.message.isHistorical
  )
})
