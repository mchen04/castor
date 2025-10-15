"use client"

import { useState, useRef, useEffect, type FC } from "react"
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
  onSendMessage: (query: string) => Promise<void>
  onStopAndRemove: () => void
}

export const Thread: FC<ThreadProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopAndRemove,
}) => {
  const [inputValue, setInputValue] = useState("")
  const viewportRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { scrollToBottom: scrollToBottomSmooth } = useScrollToMessage()

  // Track previous message length to detect new messages
  const prevMessageLengthRef = useRef(messages.length)
  // Track previous messages to detect history load
  const prevMessagesRef = useRef<Message[]>([])

  // Scroll to user's message after sending (waits for DOM update)
  useEffect(() => {
    // Only scroll on new message, not on updates to existing messages
    const newMessageAdded = messages.length > prevMessageLengthRef.current

    if (newMessageAdded && messages.length >= 2) {
      // Use requestAnimationFrame for proper timing after DOM update
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Find the second-to-last message (user's message)
          // Last message is loading assistant response
          const allMessages = viewportRef.current?.querySelectorAll('[data-role]')
          const userMessage = allMessages?.[allMessages.length - 2]

          if (userMessage) {
            userMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      })

      prevMessageLengthRef.current = messages.length
    }
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
            className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4"
          >
            {messages.length === 0 && <ThreadWelcome onSendMessage={onSendMessage} />}

            {messages.map((message) => (
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            ))}

            {messages.length > 0 && (
              <div className="aui-thread-viewport-spacer min-h-8 grow" />
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
              className="absolute -top-12 z-10 self-center rounded-full p-4 border bg-background hover:bg-accent disabled:invisible"
            >
              <ArrowDownIcon />
            </button>
          )}
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}

interface ThreadWelcomeProps {
  onSendMessage: (query: string) => Promise<void>
}

const ThreadWelcome: FC<ThreadWelcomeProps> = ({ onSendMessage }) => {
  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
      <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="aui-thread-welcome-message-motion-1 text-2xl font-semibold"
          >
            Welcome to Castor GEO!
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="aui-thread-welcome-message-motion-2 text-2xl text-muted-foreground/65"
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
    <div className="aui-thread-welcome-suggestions grid w-full gap-2 pb-4 @md:grid-cols-2">
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
          className="aui-thread-welcome-suggestion-display [&:nth-child(n+3)]:hidden @md:[&:nth-child(n+3)]:block"
        >
          <button
            className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors"
            onClick={() => onSendMessage(prompt)}
          >
            <span className="text-center text-sm font-semibold">
              {prompt}
            </span>
          </button>
        </m.div>
      ))}
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
  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
      <form
        onSubmit={onSubmit}
        className="aui-composer-root relative flex w-full flex-col rounded-3xl bg-muted px-1 shadow-lg"
      >
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder="Send a message..."
          className="aui-composer-input mb-1 max-h-40 w-full resize-none bg-transparent px-3.5 py-2 text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <div className="aui-composer-action-wrapper relative mx-1 mt-2 mb-2 flex items-center justify-end">
          {!isStreaming ? (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="aui-composer-send size-[34px] rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              aria-label="Send message"
            >
              <ArrowUpIcon className="aui-composer-send-icon size-5" />
            </button>
          ) : (
            <Button
              type="button"
              onClick={onCancel}
              variant="default"
              size="icon"
              className="aui-composer-cancel size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
              aria-label="Stop generating"
            >
              <Square className="aui-composer-cancel-icon size-3.5 fill-white dark:fill-black" />
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

const AssistantMessage: FC<MessageProps> = ({ message }) => {
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
      className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
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
}

const UserMessage: FC<MessageProps> = ({ message }) => {
  return (
    <div
      className="aui-user-message-root mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
          {message.content}
        </div>
      </div>
    </div>
  )
}
