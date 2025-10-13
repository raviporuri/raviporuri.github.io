import { NextAuthOptions, User, Account, Profile } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { AdapterUser } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import LinkedInProvider from 'next-auth/providers/linkedin'
import EmailProvider from 'next-auth/providers/email'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Custom adapter for Drizzle ORM with Vercel Postgres
const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens
})

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email'
        }
      }
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM || 'noreply@raviporuri.com',
      maxAge: 24 * 60 * 60 // 24 hours
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/welcome'
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Allow OAuth providers
        if (account?.provider === 'google' || account?.provider === 'github' || account?.provider === 'linkedin') {
          return true
        }

        // Allow email verification
        if (account?.provider === 'email') {
          return true
        }

        // Additional custom validation can go here
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      return baseUrl
    },
    async session({ session, token, user }) {
      try {
        if (session?.user && token?.sub) {
          // Add user ID to session
          session.user.id = token.sub

          // Add user role if available
          if (token.role) {
            session.user.role = token.role as string
          }

          // Add additional user data
          if (token.preferences) {
            session.user.preferences = token.preferences
          }
        }

        return session
      } catch (error) {
        console.error('Error in session callback:', error)
        return session
      }
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      try {
        // Initial sign in
        if (account && user) {
          token.accessToken = account.access_token
          token.provider = account.provider

          // Fetch additional user data from database
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            with: {
              userPreferences: true
            }
          })

          if (dbUser) {
            token.role = dbUser.role
            token.preferences = dbUser.userPreferences
          }
        }

        // Return previous token if the access token has not expired yet
        return token
      } catch (error) {
        console.error('Error in JWT callback:', error)
        return token
      }
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      try {
        console.log(`User ${user.email} signed in with ${account?.provider}`)

        // Create user preferences if new user
        if (isNewUser && user.id) {
          await db.insert(userPreferences).values({
            userId: user.id,
            privacy: {
              shareEmail: false,
              sharePhone: false,
              shareLinkedIn: false,
              allowAnalytics: true,
              allowMarketing: false
            },
            notifications: {
              emailNotifications: true,
              jobAlerts: false,
              resumeUpdates: true,
              systemUpdates: true
            },
            aiSettings: {
              creativityLevel: 0.3,
              includePersonalInfo: true,
              defaultTemplate: 'professional',
              defaultCountry: 'US'
            }
          })
        }
      } catch (error) {
        console.error('Error in signIn event:', error)
      }
    },
    async signOut({ session, token }) {
      try {
        console.log(`User signed out`)
        // Could perform cleanup here
      } catch (error) {
        console.error('Error in signOut event:', error)
      }
    },
    async createUser({ user }) {
      try {
        console.log(`New user created: ${user.email}`)

        // Send welcome email or perform other onboarding tasks
        // await sendWelcomeEmail(user.email)
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
    },
    async updateUser({ user }) {
      try {
        console.log(`User updated: ${user.email}`)
      } catch (error) {
        console.error('Error in updateUser event:', error)
      }
    },
    async linkAccount({ user, account, profile }) {
      try {
        console.log(`Account linked: ${account.provider} for user ${user.email}`)
      } catch (error) {
        console.error('Error in linkAccount event:', error)
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata)
      }
    }
  }
}

// Helper functions for authentication
export async function getCurrentUser(req: any) {
  try {
    const session = await getServerSession(authOptions)
    return session?.user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(req: any) {
  const user = await getCurrentUser(req)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function isUserAdmin(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })
    return user?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<{
    privacy: any
    notifications: any
    aiSettings: any
  }>
) {
  try {
    const [updated] = await db
      .update(userPreferences)
      .set({
        ...preferences,
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId))
      .returning()

    return updated
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }
}

export async function getUserAnalytics(userId: string, days = 30) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [
      resumeCount,
      conversationCount,
      jobSearchCount
    ] = await Promise.all([
      db.$count(generatedResumes, eq(generatedResumes.userId, userId)),
      db.$count(aiConversations, eq(aiConversations.userId, userId)),
      db.$count(jobSearches, eq(jobSearches.userId, userId))
    ])

    return {
      resumeCount,
      conversationCount,
      jobSearchCount,
      period: `${days} days`,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return {
      resumeCount: 0,
      conversationCount: 0,
      jobSearchCount: 0,
      period: `${days} days`,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Import missing dependencies
import { getServerSession } from 'next-auth/next'
import { userPreferences, generatedResumes, aiConversations, jobSearches } from '@/lib/db/schema'