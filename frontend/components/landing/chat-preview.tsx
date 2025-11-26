"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User, MessageSquare } from "lucide-react"
import { useTypewriterText } from "@/lib/hooks/use-typewriter-text"
import { sampleConversations } from "@/lib/content/landing-page-content"
import { cn } from "@/lib/utils"

const CONVERSATION_DURATION = 10000 // 10 seconds per conversation
const TYPING_SPEED = 8 // ms per character

export function ChatPreview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const currentConversation = sampleConversations[currentIndex]

  // Typewriter effect for the answer
  const { displayText, isTyping } = useTypewriterText(
    showAnswer ? currentConversation.answer : "",
    { speed: TYPING_SPEED }
  )

  // Auto-advance to next conversation
  useEffect(() => {
    if (isPaused) return

    // First show the question, then after a delay show the answer
    const questionDelay = setTimeout(() => {
      setShowAnswer(true)
    }, 1000) // Show answer after 1 second

    return () => clearTimeout(questionDelay)
  }, [currentIndex, isPaused])

  // Move to next conversation after answer is done typing
  useEffect(() => {
    if (isPaused || isTyping || !showAnswer) return

    const nextTimeout = setTimeout(() => {
      setShowAnswer(false)
      setCurrentIndex((prev) => (prev + 1) % sampleConversations.length)
    }, CONVERSATION_DURATION - 3000) // Wait before switching

    return () => clearTimeout(nextTimeout)
  }, [isPaused, isTyping, showAnswer])

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false)
  }, [])

  return (
    <div
      className="relative w-full max-w-3xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Live Demo Badge */}
      <Badge
        className="absolute -top-3 left-4 z-10 bg-accent text-accent-foreground shadow-lg"
      >
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
        </span>
        Live Demo
      </Badge>

      <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Castor GEO</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">AI Research Assistant</span>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="h-[350px] overflow-hidden">
            <div className="p-6 space-y-6">
              {/* User Question */}
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-sm">{currentConversation.question}</p>
                </div>
              </div>

              {/* AI Answer */}
              {showAnswer && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <FormattedAnswer text={displayText} />
                      {isTyping && (
                        <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-typewriter-blink" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fake Input */}
          <div className="border-t border-border/50 p-4 bg-muted/20">
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 opacity-60">
              <span className="text-sm text-muted-foreground">Ask a GEO question...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {sampleConversations.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setShowAnswer(false)
              setCurrentIndex(index)
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`View conversation ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Format the answer text with basic markdown support
 */
function FormattedAnswer({ text }: { text: string }) {
  // Split by newlines and process each line
  const lines = text.split("\n")

  return (
    <>
      {lines.map((line, index) => {
        // Bold text: **text**
        const formattedLine = line.replace(
          /\*\*([^*]+)\*\*/g,
          '<strong>$1</strong>'
        )

        // Empty line = paragraph break
        if (line.trim() === "") {
          return <br key={index} />
        }

        return (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: formattedLine }}
            className="block"
          />
        )
      })}
    </>
  )
}
