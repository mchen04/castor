"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Message, UserProfile } from "@/lib/types"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  user: UserProfile | null
}

export function ChatMessages({ messages, isLoading, user }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarGutter: "stable" }}>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} user={user} />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-start gap-4">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message, user }: { message: Message; user: UserProfile | null }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group flex items-start gap-4">
      <Avatar className="h-8 w-8 border border-border">
        {isUser ? (
          <>
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{isUser ? (user?.name || "User") : "Castor AI"}</span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="text-foreground">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  const isInline = !className?.startsWith('language-')
                  return !isInline && match ? (
                    <div className="relative my-4">
                      <div className="absolute right-2 top-2 rounded bg-muted-foreground/20 px-2 py-1 text-xs text-muted-foreground">
                        {match[1]}
                      </div>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                        <code className="text-foreground" {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  )
                },
                p({ children }) {
                  return <p className="leading-relaxed text-foreground">{children}</p>
                },
                ul({ children }) {
                  return <ul className="ml-4 list-disc space-y-1 text-foreground">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="ml-4 list-decimal space-y-1 text-foreground">{children}</ol>
                },
                li({ children }) {
                  return <li className="text-foreground">{children}</li>
                },
                strong({ children }) {
                  return <strong className="font-semibold text-foreground">{children}</strong>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  const suggestions = [
    "What is Generative Search Optimization?",
    "How can I optimize my content for AI search?",
    "What are the best practices for structured data?",
    "Tell me about AI search trends in 2025",
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-4">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Welcome to Castor GSO</h2>
          <p className="text-balance text-muted-foreground">
            Your AI-powered assistant for Generative Search Optimization. Ask me anything about GSO strategies, content
            optimization, or AI search trends.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Try asking:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="rounded-lg border border-border bg-card p-3 text-left text-sm text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
