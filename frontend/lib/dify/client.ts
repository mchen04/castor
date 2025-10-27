import { parseDifyError, isRetryableError } from './errors'

const DIFY_API_URL = 'https://api.dify.ai/v1'

export interface DifyChatRequest {
  query: string
  userId: string
  conversationId?: string
  traceId?: string  // For distributed tracing
}

export interface DifyConversationsParams {
  userId: string
  limit?: number
  lastId?: string
}

export interface DifyMessagesParams {
  conversationId: string
  userId: string
  limit?: number
  firstId?: string
}

export interface DifyDeleteRequest {
  conversationId: string
  userId: string
}

export interface DifyRenameRequest {
  conversationId: string
  userId: string
  name?: string
  autoGenerate?: boolean
}

export interface DifyStopRequest {
  taskId: string
  userId: string
}

/**
 * Centralized Dify API client
 */
export class DifyClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DIFY_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('DIFY_API_KEY is not configured')
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Send a chat message with streaming response
   * Implements retry logic for transient failures (best practice)
   */
  async sendChatMessage(params: DifyChatRequest, retries = 3): Promise<Response> {
    // Build headers with optional trace_id
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }

    // Add trace_id for distributed tracing (best practice)
    if (params.traceId) {
      headers['X-Trace-Id'] = params.traceId
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: params.query,
            user: params.userId,
            conversation_id: params.conversationId || '',
            response_mode: 'streaming',
            inputs: {},
            auto_generate_name: false,  // Disabled: We generate titles client-side for consistency
            trace_id: params.traceId,  // Best practice: distributed tracing
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          const status = response.status

          // Check if error is retryable
          if (attempt < retries && isRetryableError(status)) {
            const delay = Math.pow(2, attempt) * 1000  // Exponential backoff: 1s, 2s, 4s
            console.log(`Retrying after ${delay}ms (attempt ${attempt + 1}/${retries})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue  // Retry
          }

          // Not retryable or out of retries - throw user-friendly error
          throw new Error(parseDifyError(status, errorText))
        }

        return response
      } catch (error) {
        // Network errors or other exceptions
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000
          console.log(`Network error, retrying after ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        throw error
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Failed after all retries')
  }

  /**
   * Get conversations list for a user
   */
  async getConversations(params: DifyConversationsParams): Promise<Response> {
    const queryParams = new URLSearchParams({
      user: params.userId,
      limit: String(params.limit || 20),
    })

    if (params.lastId) {
      queryParams.append('last_id', params.lastId)
    }

    const response = await fetch(
      `${DIFY_API_URL}/conversations?${queryParams.toString()}`,
      {
        headers: this.getHeaders(),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dify API error: ${response.status} - ${errorText}`)
    }

    return response
  }

  /**
   * Get messages from a specific conversation
   */
  async getMessages(params: DifyMessagesParams): Promise<Response> {
    const queryParams = new URLSearchParams({
      conversation_id: params.conversationId,
      user: params.userId,
      limit: String(params.limit || 20),
    })

    if (params.firstId) {
      queryParams.append('first_id', params.firstId)
    }

    const response = await fetch(
      `${DIFY_API_URL}/messages?${queryParams.toString()}`,
      {
        headers: this.getHeaders(),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dify API error: ${response.status} - ${errorText}`)
    }

    return response
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(params: DifyDeleteRequest): Promise<Response> {
    const response = await fetch(
      `${DIFY_API_URL}/conversations/${params.conversationId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user: params.userId,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dify API error: ${response.status} - ${errorText}`)
    }

    return response
  }

  /**
   * Rename a conversation
   */
  async renameConversation(params: DifyRenameRequest): Promise<Response> {
    const response = await fetch(
      `${DIFY_API_URL}/conversations/${params.conversationId}/name`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: params.name || undefined,
          auto_generate: params.autoGenerate || false,
          user: params.userId,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dify API error: ${response.status} - ${errorText}`)
    }

    return response
  }

  /**
   * Stop generating a streaming response
   */
  async stopGeneration(params: DifyStopRequest): Promise<Response> {
    const response = await fetch(
      `${DIFY_API_URL}/chat-messages/${params.taskId}/stop`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user: params.userId,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dify API error: ${response.status} - ${errorText}`)
    }

    return response
  }
}
