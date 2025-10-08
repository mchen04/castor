"use client"

import { useState, useRef, useEffect, type FC } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  Square,
} from "lucide-react"
import { LazyMotion, MotionConfig, domAnimation } from "motion/react"
import * as m from "motion/react-m"
import { Button } from "@/components/ui/button"
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button"
import type { Message } from "@/lib/types/chat"

interface ThreadProps {
  messages: Message[]
  isStreaming: boolean
  onSendMessage: (query: string) => Promise<void>
  onCancelStream: () => void
}

export const Thread: FC<ThreadProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onCancelStream,
}) => {
  const [inputValue, setInputValue] = useState("")
  const viewportRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
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
              onCancel={onCancelStream}
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
        className="aui-composer-root relative flex w-full flex-col rounded-3xl border border-border bg-muted px-1 shadow-lg dark:border-muted-foreground/15"
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
          className="aui-composer-input mb-1 max-h-40 w-full resize-none bg-transparent px-3.5 py-2 text-base outline-none placeholder:text-muted-foreground focus:outline-primary"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <div className="aui-composer-action-wrapper relative mx-1 mt-2 mb-2 flex items-center justify-end">
          {!isStreaming ? (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="aui-composer-send size-[34px] rounded-full p-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground whitespace-pre-wrap">
        {message.content}
      </div>

      <div className="aui-assistant-message-footer mt-2 ml-2 flex">
        <TooltipIconButton tooltip="Copy" onClick={handleCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </TooltipIconButton>
      </div>
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
