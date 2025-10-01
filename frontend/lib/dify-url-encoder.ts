import pako from 'pako'

/**
 * Encodes a value for Dify iframe URL parameters
 * Process: GZIP compress → Base64 encode → URL encode
 *
 * Required for Dify Cloud (v1.3+) to properly parse system variables
 * in iframe URL parameters.
 *
 * @param value - The string value to encode
 * @returns Encoded string ready for URL parameter
 * @throws Error if encoding fails
 */
export function encodeDifyParam(value: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid value: must be a non-empty string')
  }

  try {
    // Convert string to Uint8Array
    const textEncoder = new TextEncoder()
    const uint8Array = textEncoder.encode(value)

    // GZIP compress
    const compressed = pako.gzip(uint8Array)

    // Base64 encode
    const base64 = btoa(String.fromCharCode(...compressed))

    // URL encode
    const urlEncoded = encodeURIComponent(base64)

    return urlEncoded
  } catch (error) {
    throw new Error(
      `Failed to encode Dify parameter: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Builds a Dify chat iframe URL with encoded sys.user_id parameter
 *
 * IMPORTANT: The parameter name MUST be "sys.user_id" (not "user_id")
 * for Dify to properly associate conversations with the user.
 *
 * Requires Dify Cloud v1.3+ or self-hosted with PR #18035 merged.
 *
 * @param baseUrl - The base Dify chat URL (e.g., "https://udify.app/chat/TOKEN")
 * @param userId - The user identifier to encode and append (typically Supabase UUID)
 * @returns Complete iframe src URL with encoded sys.user_id
 * @throws Error if userId is invalid or encoding fails
 */
export function buildDifyChatUrl(baseUrl: string, userId: string): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string')
  }

  // Validate UUID format (optional but recommended for Supabase UUIDs)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    console.warn(
      `userId "${userId}" does not match UUID format. This may cause issues with Dify.`
    )
  }

  const encodedUserId = encodeDifyParam(userId)
  const separator = baseUrl.includes('?') ? '&' : '?'

  // CRITICAL: Parameter name must be "sys.user_id" not "user_id"
  return `${baseUrl}${separator}sys.user_id=${encodedUserId}`
}
