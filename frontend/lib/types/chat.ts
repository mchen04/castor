/**
 * Simplified chat types for Dify integration
 * Dify is the source of truth - these types match Dify's API responses
 */

export interface MessageFile {
  id: string
  type: 'image' | 'document' | 'audio' | 'video'
  url: string
  belongs_to: 'user' | 'assistant'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  isLoading?: boolean
  isHistorical?: boolean
  files?: MessageFile[]
  task_id?: string
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

// SSE Event types from Dify API
export interface DifySSEMessageEvent {
  event: 'message'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

export interface DifySSEMessageFileEvent {
  event: 'message_file'
  id: string
  type: 'image' | 'document' | 'audio' | 'video'
  belongs_to: 'assistant'
  url: string
  conversation_id: string
}

export interface DifySSEMessageEndEvent {
  event: 'message_end'
  task_id: string
  message_id: string
  conversation_id: string
  metadata: {
    usage?: {
      total_tokens: number
      total_price: string
      currency: string
    }
  }
}

export interface DifySSEMessageReplaceEvent {
  event: 'message_replace'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

export interface DifySSEWorkflowStartedEvent {
  event: 'workflow_started'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    created_at: number
  }
}

export interface DifySSENodeStartedEvent {
  event: 'node_started'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    node_type: string
    title: string
    index: number
    created_at: number
  }
}

export interface DifySSENodeFinishedEvent {
  event: 'node_finished'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    node_type: string
    title: string
    index: number
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    error?: string
    created_at: number
  }
}

export interface DifySSEWorkflowFinishedEvent {
  event: 'workflow_finished'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    error?: string
    created_at: number
    finished_at: number
  }
}

export interface DifySSEErrorEvent {
  event: 'error'
  task_id: string
  message_id: string
  status: number
  code: string
  message: string
}

export interface DifySSEPingEvent {
  event: 'ping'
}

export interface DifySSETTSMessageEvent {
  event: 'tts_message'
  task_id: string
  message_id: string
  audio: string  // Base64-encoded MP3
  created_at: number
}

export interface DifySSETTSMessageEndEvent {
  event: 'tts_message_end'
  task_id: string
  message_id: string
  audio: ''  // Empty string
  created_at: number
}

export type DifySSEEvent =
  | DifySSEMessageEvent
  | DifySSEMessageFileEvent
  | DifySSEMessageEndEvent
  | DifySSEMessageReplaceEvent
  | DifySSEWorkflowStartedEvent
  | DifySSENodeStartedEvent
  | DifySSENodeFinishedEvent
  | DifySSEWorkflowFinishedEvent
  | DifySSEErrorEvent
  | DifySSEPingEvent
  | DifySSETTSMessageEvent
  | DifySSETTSMessageEndEvent
