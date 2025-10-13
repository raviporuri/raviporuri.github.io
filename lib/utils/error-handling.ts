import { NextResponse } from 'next/server'

export interface APIError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export class ValidationError extends Error implements APIError {
  statusCode = 400
  code = 'VALIDATION_ERROR'

  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error implements APIError {
  statusCode = 401
  code = 'AUTHENTICATION_ERROR'

  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error implements APIError {
  statusCode = 403
  code = 'AUTHORIZATION_ERROR'

  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error implements APIError {
  statusCode = 404
  code = 'NOT_FOUND'

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends Error implements APIError {
  statusCode = 429
  code = 'RATE_LIMIT_EXCEEDED'

  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class AIProviderError extends Error implements APIError {
  statusCode = 502
  code = 'AI_PROVIDER_ERROR'

  constructor(message: string, public provider?: string, public details?: any) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export class DatabaseError extends Error implements APIError {
  statusCode = 500
  code = 'DATABASE_ERROR'

  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends Error implements APIError {
  statusCode = 502
  code = 'EXTERNAL_SERVICE_ERROR'

  constructor(message: string, public service?: string, public details?: any) {
    super(message)
    this.name = 'ExternalServiceError'
  }
}

export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof RateLimitError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof AIProviderError) {
        return NextResponse.json(
          {
            error: 'AI service temporarily unavailable',
            code: error.code,
            provider: error.provider
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof DatabaseError) {
        return NextResponse.json(
          {
            error: 'Database operation failed',
            code: error.code
          },
          { status: error.statusCode }
        ) as R
      }

      if (error instanceof ExternalServiceError) {
        return NextResponse.json(
          {
            error: `External service (${error.service}) unavailable`,
            code: error.code
          },
          { status: error.statusCode }
        ) as R
      }

      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.issues
          },
          { status: 400 }
        ) as R
      }

      // Handle network/fetch errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return NextResponse.json(
          {
            error: 'Network error occurred',
            code: 'NETWORK_ERROR'
          },
          { status: 503 }
        ) as R
      }

      // Generic error
      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 500 }
      ) as R
    }
  }
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR'
    }
  }

  return {
    name: 'UnknownError',
    message: 'An unknown error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR'
  }
}

export function logError(error: unknown, context?: any) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context
  }

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2))

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      code: code || 'ERROR',
      details,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  )
}