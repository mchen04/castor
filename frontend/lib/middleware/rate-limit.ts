/**
 * Simple in-memory rate limiter for API routes
 * Best practice: Implement rate limiting on your backend (Dify API Reference)
 *
 * For production-scale (>100 concurrent users), consider:
 * - Upstash Redis rate limiting
 * - Vercel Edge Config
 * - Cloudflare rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (works for single Vercel serverless function)
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number     // Max requests per window
  windowMs: number        // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for a user
 * Returns rate limit info and whether request should be allowed
 */
export function checkRateLimit(
  userId: string,
  config: RateLimitConfig = {
    maxRequests: 30,      // 30 requests
    windowMs: 60 * 1000,  // per 60 seconds (1 min)
  }
): RateLimitResult {
  const now = Date.now()
  const key = `${userId}`

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment counter
  entry.count++

  // Calculate result
  const success = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const reset = entry.resetTime

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset,
  }
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }
}
