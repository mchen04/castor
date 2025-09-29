import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Redis connection
// These environment variables will be automatically provided by Vercel when Redis is set up
const redis = Redis.fromEnv()

// Rate limiters for different endpoint types
export const rateLimiters = {
  // Payment endpoints - strict limits (10 requests per minute)
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'rl:payment',
  }),

  // General API endpoints (60 requests per minute)
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'rl:general',
  }),

  // Dashboard and authenticated user endpoints (100 requests per minute)
  dashboard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'rl:dashboard',
  }),

  // Very strict limits for sensitive operations (5 requests per minute)
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'rl:strict',
  }),
}

// Rate limiting configuration for different paths
export const rateLimitConfig = {
  // Payment endpoints - highest security
  '/api/checkout': 'payment',
  '/api/customer-portal': 'payment',
  
  // Auth endpoints - strict but not as restrictive as payments
  '/api/auth/logout': 'general',
  
  // Dashboard and app routes - more generous for user experience
  '/dashboard': 'dashboard',
  '/login': 'general',
  
  // Default for any other API routes
  '/api/': 'general',
} as const

// Paths to exclude from rate limiting
export const excludedPaths = [
  '/api/webhook/stripe', // Stripe webhooks need reliable delivery
  '/_next/', // Next.js static assets
  '/favicon.ico',
  '/images/',
  '/icons/',
] as const

/**
 * Get the appropriate rate limiter for a given path
 */
export function getRateLimiterForPath(path: string): keyof typeof rateLimiters | null {
  // Check if path should be excluded
  if (excludedPaths.some(excluded => path.startsWith(excluded))) {
    return null
  }

  // Find matching rate limit configuration
  for (const [pattern, limiterType] of Object.entries(rateLimitConfig)) {
    if (path.startsWith(pattern)) {
      return limiterType as keyof typeof rateLimiters
    }
  }

  // Default to general rate limiting for unmatched paths
  return 'general'
}

/**
 * Get client identifier for rate limiting
 * Uses IP address with optional user ID for authenticated users
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Get IP address from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  
  // For authenticated users, combine IP + user ID for more granular control
  if (userId) {
    return `${ip}:${userId}`
  }
  
  return ip
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  path: string,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: Date
}> {
  const limiterType = getRateLimiterForPath(path)
  
  // If path is excluded, allow the request
  if (!limiterType) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: new Date(Date.now() + 60000), // 1 minute from now for excluded paths
    }
  }

  const limiter = rateLimiters[limiterType]
  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
  }
}