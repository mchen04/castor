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

export interface DifyMessagesResponse {
  limit: number
  has_more: boolean
  data: DifyMessage[]
}

export interface DifyConversationsResponse {
  limit: number
  has_more: boolean
  data: Conversation[]
}
