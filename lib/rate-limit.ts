import { kv } from '@vercel/kv'

// Fallback for when KV is not available
const kvAvailable = process.env.KV_URL || process.env.KV_REST_API_URL

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

export class RateLimit {
  private prefix: string
  private windowMs: number
  private maxRequests: number

  constructor(
    windowMs: number = 60 * 1000, // 1 minute default
    maxRequests: number = 60, // 60 requests per minute default
    prefix: string = 'rl'
  ) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.prefix = prefix
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`
    const now = Date.now()
    const window = Math.floor(now / this.windowMs)
    const windowKey = `${key}:${window}`

    try {
      if (!kvAvailable) {
        // Fallback: allow all requests when KV is not available
        return {
          success: true,
          limit: this.maxRequests,
          remaining: this.maxRequests,
          reset: new Date(now + this.windowMs)
        }
      }

      // Use Redis pipeline for atomic operations
      const pipeline = kv.pipeline()
      pipeline.incr(windowKey)
      pipeline.expire(windowKey, Math.ceil(this.windowMs / 1000))

      const results = await pipeline.exec()
      const count = results[0] as number

      const remaining = Math.max(0, this.maxRequests - count)
      const reset = new Date((window + 1) * this.windowMs)
      const success = count <= this.maxRequests

      const result: RateLimitResult = {
        success,
        limit: this.maxRequests,
        remaining,
        reset
      }

      if (!success) {
        result.retryAfter = Math.ceil(this.windowMs / 1000)
      }

      return result
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Fail open - allow request if rate limiting fails
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        reset: new Date(now + this.windowMs)
      }
    }
  }

  async reset(identifier: string): Promise<void> {
    try {
      const keys = await kv.keys(`${this.prefix}:${identifier}:*`)
      if (keys.length > 0) {
        await kv.del(...keys)
      }
    } catch (error) {
      console.error('Error resetting rate limit:', error)
    }
  }

  async getRemaining(identifier: string): Promise<number> {
    try {
      const key = `${this.prefix}:${identifier}`
      const now = Date.now()
      const window = Math.floor(now / this.windowMs)
      const windowKey = `${key}:${window}`

      const count = await kv.get(windowKey) || 0
      return Math.max(0, this.maxRequests - (count as number))
    } catch (error) {
      console.error('Error getting remaining requests:', error)
      return this.maxRequests
    }
  }
}

// Pre-configured rate limiters for different use cases
export const ratelimit = new RateLimit(
  60 * 1000, // 1 minute window
  100, // 100 requests per minute for general API
  'api'
)

export const authRateLimit = new RateLimit(
  15 * 60 * 1000, // 15 minute window
  5, // 5 login attempts per 15 minutes
  'auth'
)

export const aiRateLimit = new RateLimit(
  60 * 1000, // 1 minute window
  20, // 20 AI requests per minute
  'ai'
)

export const resumeGenerationRateLimit = new RateLimit(
  60 * 60 * 1000, // 1 hour window
  10, // 10 resume generations per hour
  'resume'
)

export const jobSearchRateLimit = new RateLimit(
  60 * 1000, // 1 minute window
  10, // 10 job searches per minute
  'jobs'
)

export const contactFormRateLimit = new RateLimit(
  24 * 60 * 60 * 1000, // 24 hour window
  3, // 3 contact form submissions per day
  'contact'
)

// Advanced rate limiting with different tiers
export class TieredRateLimit {
  private limits: Map<string, RateLimit> = new Map()

  constructor() {
    // Default tiers
    this.limits.set('free', new RateLimit(60 * 1000, 10, 'free'))
    this.limits.set('premium', new RateLimit(60 * 1000, 100, 'premium'))
    this.limits.set('enterprise', new RateLimit(60 * 1000, 1000, 'enterprise'))
  }

  async limit(identifier: string, tier: string = 'free'): Promise<RateLimitResult> {
    const limiter = this.limits.get(tier) || this.limits.get('free')!
    return await limiter.limit(identifier)
  }

  addTier(tier: string, windowMs: number, maxRequests: number) {
    this.limits.set(tier, new RateLimit(windowMs, maxRequests, tier))
  }
}

export const tieredRateLimit = new TieredRateLimit()

// Utility functions for rate limiting middleware
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toISOString(),
    ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
  }
}

export function getClientIdentifier(request: Request): string {
  // Try to get user ID from authentication first
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] ?? realIp ?? '127.0.0.1'

  return ip
}

export async function withRateLimit<T>(
  identifier: string,
  rateLimiter: RateLimit,
  operation: () => Promise<T>
): Promise<T> {
  const result = await rateLimiter.limit(identifier)

  if (!result.success) {
    const error = new Error('Rate limit exceeded')
    ;(error as any).statusCode = 429
    ;(error as any).headers = getRateLimitHeaders(result)
    throw error
  }

  return await operation()
}

// Redis-based distributed rate limiting for multi-instance deployments
export class DistributedRateLimit {
  private prefix: string
  private windowMs: number
  private maxRequests: number

  constructor(
    windowMs: number = 60 * 1000,
    maxRequests: number = 60,
    prefix: string = 'drl'
  ) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.prefix = prefix
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`
    const now = Date.now()

    try {
      // Sliding window log approach
      const pipeline = kv.pipeline()

      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, now - this.windowMs)

      // Count current requests
      pipeline.zcard(key)

      // Add current request
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })

      // Set expiry
      pipeline.expire(key, Math.ceil(this.windowMs / 1000))

      const results = await pipeline.exec()
      const count = results[1] as number + 1 // +1 for the request we just added

      const remaining = Math.max(0, this.maxRequests - count)
      const reset = new Date(now + this.windowMs)
      const success = count <= this.maxRequests

      const result: RateLimitResult = {
        success,
        limit: this.maxRequests,
        remaining,
        reset
      }

      if (!success) {
        result.retryAfter = Math.ceil(this.windowMs / 1000)
        // Remove the request we just added since it's not allowed
        await kv.zrem(key, `${now}-${Math.random()}`)
      }

      return result
    } catch (error) {
      console.error('Distributed rate limiting error:', error)
      // Fail open
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        reset: new Date(now + this.windowMs)
      }
    }
  }
}

// IP-based blocking for abuse prevention
export class IPBlocker {
  private prefix = 'blocked'

  async blockIP(ip: string, durationMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const key = `${this.prefix}:${ip}`
      await kv.set(key, '1', { ex: Math.ceil(durationMs / 1000) })
    } catch (error) {
      console.error('Error blocking IP:', error)
    }
  }

  async isBlocked(ip: string): Promise<boolean> {
    try {
      const key = `${this.prefix}:${ip}`
      const blocked = await kv.get(key)
      return blocked === '1'
    } catch (error) {
      console.error('Error checking blocked IP:', error)
      return false
    }
  }

  async unblockIP(ip: string): Promise<void> {
    try {
      const key = `${this.prefix}:${ip}`
      await kv.del(key)
    } catch (error) {
      console.error('Error unblocking IP:', error)
    }
  }
}

export const ipBlocker = new IPBlocker()