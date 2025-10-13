import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

// Create the database connection
export const db = drizzle(sql, { schema })

// Database connection health check
export async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      latency: Date.now()
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Database migration utilities
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist (handled by Drizzle migrations)
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Helper functions for common queries
export async function getUserById(id: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id)
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    })
    return user
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

export async function createUser(userData: {
  name: string
  email: string
  image?: string
}) {
  try {
    const [user] = await db.insert(schema.users)
      .values({
        ...userData,
        id: crypto.randomUUID()
      })
      .returning()
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getUserConversations(userId: string, limit = 10) {
  try {
    const conversations = await db.query.aiConversations.findMany({
      where: (conversations, { eq, and }) =>
        and(
          eq(conversations.userId, userId),
          eq(conversations.isActive, true)
        ),
      orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
      limit
    })
    return conversations
  } catch (error) {
    console.error('Error fetching user conversations:', error)
    throw error
  }
}

export async function getUserResumes(userId: string, limit = 20) {
  try {
    const resumes = await db.query.generatedResumes.findMany({
      where: (resumes, { eq }) => eq(resumes.userId, userId),
      orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
      limit
    })
    return resumes
  } catch (error) {
    console.error('Error fetching user resumes:', error)
    throw error
  }
}

export async function getUserTailoredResumes(userId: string, limit = 20) {
  try {
    const tailoredResumes = await db.query.tailoredResumes.findMany({
      where: (resumes, { eq }) => eq(resumes.userId, userId),
      orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
      limit
    })
    return tailoredResumes
  } catch (error) {
    console.error('Error fetching tailored resumes:', error)
    throw error
  }
}

export async function getUserJobSearches(userId: string, limit = 20) {
  try {
    const searches = await db.query.jobSearches.findMany({
      where: (searches, { eq }) => eq(searches.userId, userId),
      orderBy: (searches, { desc }) => [desc(searches.createdAt)],
      limit
    })
    return searches
  } catch (error) {
    console.error('Error fetching job searches:', error)
    throw error
  }
}

export async function getSystemStats() {
  try {
    const [
      totalUsers,
      totalResumes,
      totalConversations,
      totalJobSearches
    ] = await Promise.all([
      db.$count(schema.users),
      db.$count(schema.generatedResumes),
      db.$count(schema.aiConversations),
      db.$count(schema.jobSearches)
    ])

    return {
      totalUsers,
      totalResumes,
      totalConversations,
      totalJobSearches,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return {
      totalUsers: 0,
      totalResumes: 0,
      totalConversations: 0,
      totalJobSearches: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Cleanup utilities
export async function cleanupExpiredSessions() {
  try {
    const result = await db.delete(schema.sessions)
      .where(sql`expires < NOW()`)
    console.log(`Cleaned up ${result.rowCount} expired sessions`)
    return result.rowCount
  } catch (error) {
    console.error('Error cleaning up sessions:', error)
    throw error
  }
}

export async function cleanupExpiredAnalytics() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const result = await db.delete(schema.careerAnalytics)
      .where(sql`expires_at < ${thirtyDaysAgo}`)
    console.log(`Cleaned up ${result.rowCount} expired analytics records`)
    return result.rowCount
  } catch (error) {
    console.error('Error cleaning up analytics:', error)
    throw error
  }
}

// Performance monitoring
export async function logDatabasePerformance(operation: string, startTime: number) {
  const duration = Date.now() - startTime

  if (duration > 1000) { // Log slow queries (>1s)
    console.warn(`Slow database operation: ${operation} took ${duration}ms`)
  }

  // Could send to monitoring service
  return duration
}

// Connection pool monitoring
export function getDatabaseInfo() {
  return {
    provider: 'vercel-postgres',
    schema: 'public',
    tables: Object.keys(schema).length,
    timestamp: new Date().toISOString()
  }
}