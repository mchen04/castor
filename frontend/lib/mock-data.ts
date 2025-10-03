import type { Conversation, Message, UserProfile } from "./types"

export const mockUser: UserProfile = {
  id: "1",
  name: "Alex Morgan",
  email: "alex@castor.com",
  avatar: "/professional-avatar.png",
}

export const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "GSO Strategy for E-commerce",
    lastMessage: "How can I optimize product descriptions for AI search?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    messageCount: 12,
  },
  {
    id: "2",
    title: "Content Optimization Tips",
    lastMessage: "What are the best practices for structured data?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    messageCount: 8,
  },
  {
    id: "3",
    title: "AI Search Trends 2025",
    lastMessage: "Tell me about the latest developments in generative search",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    messageCount: 15,
  },
]

export const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What is Generative Search Optimization?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: "2",
    role: "assistant",
    content: `Generative Search Optimization (GSO) is the practice of optimizing content to appear in AI-generated search results and responses. Unlike traditional SEO which focuses on ranking in search engine results pages, GSO ensures your content is:

1. **Discoverable by AI models** - Structured in ways that LLMs can easily parse and understand
2. **Cited as authoritative** - Positioned as a trusted source that AI assistants reference
3. **Contextually relevant** - Optimized for natural language queries rather than keywords

Key strategies include:
- Implementing comprehensive structured data
- Creating clear, factual content hierarchies
- Building topical authority through interconnected content
- Ensuring technical accessibility for AI crawlers`,
    timestamp: new Date(Date.now() - 1000 * 60 * 9),
  },
  {
    id: "3",
    role: "user",
    content: "How is it different from traditional SEO?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "4",
    role: "assistant",
    content: `Great question! Here are the key differences:

**Traditional SEO:**
- Optimizes for keyword rankings
- Focuses on SERP position (1-10)
- Targets search engine algorithms
- Measures success by traffic and rankings

**Generative Search Optimization (GSO):**
- Optimizes for AI comprehension and citation
- Focuses on being the source AI models reference
- Targets LLM training data and retrieval systems
- Measures success by citation frequency and attribution

The shift is from "ranking first" to "being the answer" that AI systems trust and cite.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
]
