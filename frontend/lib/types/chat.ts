/**
 * Simplified chat types for Dify integration
 * Dify is the source of truth - these types match Dify's API responses
 */

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  name: string
  created_at: number
  updated_at: number
}

export interface DifyMessage {
  id: string
  conversation_id: string
  query: string
  answer: string
  created_at: number
}

export interface DifyConversation {
  id: string
  name: string
  inputs: Record<string, unknown>
  status: string
  introduction: string
  created_at: number
  updated_at: number
}

export interface DifyMessagesResponse {
  limit: number
  has_more: boolean
  data: DifyMessage[]
}

export interface DifyConversationsResponse {
  limit: number
  has_more: boolean
  data: DifyConversation[]
}

/**
 * Transform Dify message to UI message format
 * Each Dify message contains both user query and AI answer
 * We split them into separate messages for the UI
 */
export function transformDifyMessages(difyMessages: DifyMessage[]): Message[] {
  return difyMessages.flatMap((msg) => [
    // User message
    {
      id: `${msg.id}-user`,
      role: 'user' as const,
      content: msg.query,
      createdAt: new Date(msg.created_at * 1000),
    },
    // Assistant message
    {
      id: `${msg.id}-assistant`,
      role: 'assistant' as const,
      content: msg.answer,
      createdAt: new Date(msg.created_at * 1000),
    },
  ]).reverse() // Dify returns newest first, we want chronological order
}

/**
 * Transform Dify conversation to UI conversation format
 */
export function transformDifyConversation(difyConv: DifyConversation): Conversation {
  return {
    id: difyConv.id,
    name: difyConv.name || 'New Conversation',
    created_at: difyConv.created_at,
    updated_at: difyConv.updated_at,
  }
}
