const DIFY_API_URL = 'https://api.dify.ai/v1'

export interface DifyChatRequest {
  query: string
  userId: string
  conversationId?: string
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

/**
 * Centralized Dify API client
 * All methods return the raw Response object for flexible handling
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
   * Returns raw Response for SSE streaming
   */
  async sendChatMessage(params: DifyChatRequest): Promise<Response> {
    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        query: params.query,
        user: params.userId,
        conversation_id: params.conversationId || '',
        response_mode: 'streaming',
        inputs: {},
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dify API error: ${response.status} - ${errorText}`)
    }

    return response
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
      limit: String(params.limit || 50),
    })

    if (params.firstId) {
      queryParams.append('first_id', params.firstId)
    }

    const response = await fetch(
      `${DIFY_API_URL}/conversations/${params.conversationId}/messages?${queryParams.toString()}`,
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
}
