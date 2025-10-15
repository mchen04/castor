/**
 * Dify API error codes and user-friendly messages
 * Based on official Dify API Reference 2025
 */

export interface DifyError {
  code: string
  message: string
  status: number
}

/**
 * Parse Dify API error response and return user-friendly message
 */
export function parseDifyError(status: number, errorText: string): string {
  try {
    const error = JSON.parse(errorText) as DifyError
    return getUserFriendlyMessage(status, error.code, error.message)
  } catch {
    // Fallback if not JSON
    return getUserFriendlyMessage(status, 'unknown', errorText)
  }
}

/**
 * Map Dify error codes to user-friendly messages
 */
function getUserFriendlyMessage(status: number, code: string, originalMessage: string): string {
  // Specific error code mappings
  const errorMessages: Record<string, string> = {
    // Chat message errors
    'invalid_param': 'Invalid input provided. Please check your message and try again.',
    'app_unavailable': 'The chatbot is currently unavailable. Please try again in a moment.',
    'provider_not_initialize': 'AI model configuration error. Please contact support.',
    'provider_quota_exceeded': 'AI usage limit reached. Please try again later or contact support.',
    'model_currently_not_support': 'This AI model is temporarily unavailable. Please try again later.',
    'completion_request_error': 'Failed to generate response. Please try again.',

    // Conversation errors
    'conversation_not_exists': 'This conversation no longer exists.',
    'workflow_not_found': 'The requested workflow version was not found.',
    'draft_workflow_error': 'Cannot use draft workflow. Please publish it first.',
    'workflow_id_format_error': 'Invalid workflow identifier format.',

    // File errors
    'no_file_uploaded': 'No file was uploaded. Please select a file.',
    'too_many_files': 'Too many files. Please upload one file at a time.',
    'unsupported_file_type': 'This file type is not supported.',
    'file_too_large': 'File is too large. Maximum size is 15MB.',
    'file_not_found': 'File not found or has been deleted.',
    'file_access_denied': 'You do not have permission to access this file.',

    // Service errors
    's3_connection_failed': 'File storage connection failed. Please try again.',
    's3_permission_denied': 'File storage permission denied. Please contact support.',
    's3_file_too_large': 'File exceeds storage size limit.',
  }

  // Check if we have a specific message for this error code
  if (errorMessages[code]) {
    return errorMessages[code]
  }

  // Fallback to HTTP status code messages
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.'
    case 401:
      return 'Authentication failed. Please sign in again.'
    case 403:
      return 'Access denied. You may need an active subscription.'
    case 404:
      return 'The requested resource was not found.'
    case 413:
      return 'Request is too large. Please reduce the size and try again.'
    case 415:
      return 'Unsupported file type.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Server error. Please try again in a moment.'
    case 503:
      return 'Service temporarily unavailable. Please try again later.'
    default:
      // Return original message if no mapping found
      return originalMessage || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Check if error is retryable (transient failure)
 */
export function isRetryableError(status: number, code?: string): boolean {
  // Retry on server errors and rate limits
  if (status >= 500 || status === 429) {
    return true
  }

  // Retry on specific transient error codes
  const retryableCodes = [
    'provider_quota_exceeded',  // Might succeed after quota reset
    's3_connection_failed',     // Transient network issue
  ]

  return code ? retryableCodes.includes(code) : false
}
