import { db } from '@/lib/db'
import { aiUsageAnalytics } from '@/lib/db/schema'

interface AIUsageData {
  userId: string
  provider: string
  model: string
  tokensUsed?: number
  context: string
  success: boolean
  errorMessage?: string
  responseTime?: number
  cost?: number
}

export async function logAIUsage(data: AIUsageData) {
  try {
    const usageRecord = {
      id: crypto.randomUUID(),
      userId: data.userId === 'anonymous' ? null : data.userId,
      provider: data.provider,
      model: data.model,
      feature: data.context,
      tokensUsed: data.tokensUsed || 0,
      cost: data.cost ? data.cost.toString() : '0',
      success: data.success,
      errorMessage: data.errorMessage || null,
      responseTime: data.responseTime || null,
      userAgent: null, // Could extract from request
      ipAddress: null, // Could extract from request
      createdAt: new Date()
    }

    await db.insert(aiUsageAnalytics).values(usageRecord)

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Usage Logged:', {
        provider: data.provider,
        model: data.model,
        context: data.context,
        success: data.success,
        tokensUsed: data.tokensUsed
      })
    }
  } catch (error) {
    console.error('Failed to log AI usage:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

export async function getAIUsageStats(userId?: string, days: number = 30) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Basic stats query - in production, use proper aggregation
    const records = await db.query.aiUsageAnalytics.findMany({
      where: userId ?
        (analytics, { and, gte, eq }) => and(
          eq(analytics.userId, userId),
          gte(analytics.createdAt, since)
        ) :
        (analytics, { gte }) => gte(analytics.createdAt, since),
      orderBy: (analytics, { desc }) => [desc(analytics.createdAt)],
      limit: 1000
    })

    const stats = {
      totalRequests: records.length,
      successfulRequests: records.filter(r => r.success).length,
      failedRequests: records.filter(r => !r.success).length,
      totalTokensUsed: records.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
      averageResponseTime: records.length > 0
        ? records.reduce((sum, r) => sum + (r.responseTime || 0), 0) / records.length
        : 0,
      providerBreakdown: records.reduce((acc: Record<string, number>, r) => {
        acc[r.provider] = (acc[r.provider] || 0) + 1
        return acc
      }, {}),
      featureBreakdown: records.reduce((acc: Record<string, number>, r) => {
        acc[r.feature] = (acc[r.feature] || 0) + 1
        return acc
      }, {}),
      period: `${days} days`,
      timestamp: new Date().toISOString()
    }

    return stats
  } catch (error) {
    console.error('Failed to get AI usage stats:', error)
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
      providerBreakdown: {},
      featureBreakdown: {},
      period: `${days} days`,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function calculateAICost(provider: string, model: string, tokensUsed: number): number {
  // Approximate pricing per 1K tokens (as of 2024)
  const pricing: Record<string, Record<string, number>> = {
    openai: {
      'gpt-4-1106-preview': 0.01, // $0.01 per 1K tokens
      'gpt-3.5-turbo': 0.0015,
      'default': 0.01
    },
    anthropic: {
      'claude-3-sonnet-20240229': 0.003, // $0.003 per 1K tokens
      'claude-3-haiku-20240307': 0.00025,
      'default': 0.003
    }
  }

  const providerPricing = pricing[provider] || { default: 0.01 }
  const modelPrice = providerPricing[model] || providerPricing.default

  return (tokensUsed / 1000) * modelPrice
}

export async function trackUserActivity(
  userId: string,
  activity: string,
  metadata?: Record<string, any>
) {
  try {
    // Simple activity tracking - could expand to dedicated table
    console.log('User Activity:', {
      userId,
      activity,
      metadata,
      timestamp: new Date().toISOString()
    })

    // In production, might store in dedicated analytics service
  } catch (error) {
    console.error('Failed to track user activity:', error)
  }
}

export function trackPageView(page: string, userId?: string) {
  try {
    // Client-side analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', 'pageview', { page, userId })
    }

    // Server-side logging
    console.log('Page View:', { page, userId, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

export function trackEvent(
  event: string,
  properties?: Record<string, any>,
  userId?: string
) {
  try {
    // Client-side analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', event, { ...properties, userId })
    }

    // Server-side logging
    console.log('Event:', { event, properties, userId, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Performance monitoring
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - startTime

      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation: ${operation} took ${duration.toFixed(2)}ms`)
      }

      resolve({ result, duration })
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`Operation failed: ${operation} after ${duration.toFixed(2)}ms`, error)
      reject(error)
    }
  })
}

// Error analytics
export async function logError(
  error: Error,
  context?: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  try {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    }

    console.error('Application Error:', errorLog)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, LogRocket, etc.
    }
  } catch (logError) {
    console.error('Failed to log error:', logError)
  }
}

// System health monitoring
export async function checkSystemHealth() {
  try {
    const checks = await Promise.allSettled([
      // Database health
      db.execute(sql`SELECT 1`),
      // AI provider health (could ping endpoints)
      fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/health`, {
        method: 'GET',
        timeout: 5000
      })
    ])

    const health = {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      api: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    }

    return health
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      database: 'unknown',
      api: 'unknown',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Declare global types for Vercel Analytics
declare global {
  interface Window {
    va: (event: string, data?: Record<string, any>) => void
    vaq: Array<[string, Record<string, any>?]>
  }
}

// Import SQL from drizzle-orm
import { sql } from 'drizzle-orm'