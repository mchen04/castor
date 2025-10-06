"use client";

import { Thread } from "@assistant-ui/react-ui";
import { MessageSquare } from "lucide-react";

export function CustomThread() {
  return (
    <Thread
      welcome={{
        message:
          "Welcome to Castor GEO! Your AI-powered assistant for Generative Search Optimization. Ask me anything about GEO strategies, content optimization, or AI search trends.",
        suggestions: [
          {
            prompt: "What is Generative Search Optimization?",
          },
          {
            prompt: "How can I optimize my content for AI search?",
          },
          {
            prompt: "What are the best practices for structured data?",
          },
          {
            prompt: "Tell me about AI search trends in 2025",
          },
        ],
      }}
    />
  );
}
