import { pgTable, text, timestamp, integer, boolean, json, serial, varchar, decimal } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Users table for authentication
export const users = pgTable('users', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Accounts for OAuth providers
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Sessions for authentication
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text('session_token').unique().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Verification tokens for email verification
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').unique().notNull(),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// AI Conversations
export const aiConversations = pgTable('ai_conversations', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationType: text('conversation_type').notNull().default('general'),
  title: text('title'),
  messages: json('messages').$type<Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
    provider?: string
    metadata?: any
  }>>().default([]),
  contextData: json('context_data').$type<{
    attachments?: Array<{ type: string; content: string; filename: string }>
    suggestions?: string[]
    resources?: string[]
    [key: string]: any
  }>().default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Generated Resumes
export const generatedResumes = pgTable('generated_resumes', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobDescription: text('job_description').notNull(),
  targetRole: text('target_role').notNull(),
  industry: text('industry').notNull(),
  template: text('template').notNull(),
  country: text('country').notNull(),
  experienceLevel: text('experience_level').notNull(),
  aiProvider: text('ai_provider').notNull(),
  resumeData: json('resume_data').$type<{
    personalInfo: {
      name: string
      email: string
      phone: string
      location: string
      linkedin?: string
      website?: string
    }
    summary: string
    experience: Array<{
      title: string
      company: string
      location: string
      startDate: string
      endDate: string
      description: string[]
    }>
    education: Array<{
      degree: string
      school: string
      location: string
      graduationDate: string
      gpa?: string
    }>
    skills: {
      technical: string[]
      leadership: string[]
      languages?: string[]
    }
    certifications?: Array<{
      name: string
      issuer: string
      date: string
      credentialId?: string
    }>
    achievements?: string[]
  }>().notNull(),
  pdfUrl: text('pdf_url').notNull(),
  downloadUrl: text('download_url').notNull(),
  atsScore: integer('ats_score').default(0),
  keywordMatches: json('keyword_matches').$type<{
    matched: string[]
    missing: string[]
    score: number
  }>().default({ matched: [], missing: [], score: 0 }),
  customizations: json('customizations').$type<{
    includePhoto?: boolean
    colorScheme?: string
    fontStyle?: string
    sections?: string[]
  }>().default({}),
  downloadCount: integer('download_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Job Searches
export const jobSearches = pgTable('job_searches', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  searchParams: json('search_params').$type<{
    keywords: string
    location?: string
    jobType?: string
    experienceLevel?: string
    salaryMin?: string
    salaryMax?: string
    remote?: boolean
    industry?: string
    company?: string
  }>().notNull(),
  resultsCount: integer('results_count').default(0),
  filters: json('filters').$type<{
    sortBy?: string
    minMatchScore?: number
    companies?: string[]
    locations?: string[]
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Job Matches (cached job results)
export const jobMatches = pgTable('job_matches', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  searchId: text('search_id').notNull().references(() => jobSearches.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  externalJobId: text('external_job_id').notNull(), // ID from job source
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  salary: text('salary'),
  description: text('description').notNull(),
  requirements: json('requirements').$type<string[]>().default([]),
  source: text('source').notNull(), // 'linkedin', 'indeed', etc.
  sourceUrl: text('source_url').notNull(),
  postedDate: timestamp('posted_date').notNull(),
  matchScore: integer('match_score').default(0),
  keywordMatches: json('keyword_matches').$type<string[]>().default([]),
  missingSkills: json('missing_skills').$type<string[]>().default([]),
  isRemote: boolean('is_remote').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Tailored Resumes (job-specific optimizations)
export const tailoredResumes = pgTable('tailored_resumes', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('job_id'), // External job ID or internal job match ID
  jobTitle: text('job_title').notNull(),
  company: text('company').notNull(),
  baseResumeId: text('base_resume_id').references(() => generatedResumes.id),
  resumeData: json('resume_data').$type<{
    personalInfo: {
      name: string
      email: string
      phone: string
      location: string
      linkedin?: string
      website?: string
    }
    summary: string
    experience: Array<{
      title: string
      company: string
      location: string
      startDate: string
      endDate: string
      description: string[]
    }>
    education: Array<{
      degree: string
      school: string
      location: string
      graduationDate: string
      gpa?: string
    }>
    skills: {
      technical: string[]
      leadership: string[]
      languages?: string[]
    }
    certifications?: Array<{
      name: string
      issuer: string
      date: string
      credentialId?: string
    }>
    achievements?: string[]
  }>().notNull(),
  coverLetter: text('cover_letter'),
  applicationTips: json('application_tips').$type<string[]>().default([]),
  pdfUrl: text('pdf_url').notNull(),
  downloadUrl: text('download_url').notNull(),
  keywordsOptimized: json('keywords_optimized').$type<string[]>().default([]),
  improvementScore: integer('improvement_score').default(0), // % improvement over base resume
  downloadCount: integer('download_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Career Analytics Data
export const careerAnalytics = pgTable('career_analytics', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  analysisType: text('analysis_type').notNull(), // 'salary', 'skills', 'growth', 'market'
  inputData: json('input_data').$type<{
    currentRole?: string
    experience?: number
    skills?: string[]
    location?: string
    industry?: string
    education?: string
    [key: string]: any
  }>().default({}),
  results: json('results').$type<{
    predictions?: any
    recommendations?: string[]
    insights?: any
    charts?: any
    [key: string]: any
  }>().default({}),
  aiProvider: text('ai_provider').notNull(),
  accuracy: integer('accuracy').default(0), // Confidence score 0-100
  expiresAt: timestamp('expires_at'), // Cache expiry
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// User Preferences and Settings
export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  privacy: json('privacy').$type<{
    shareEmail?: boolean
    sharePhone?: boolean
    shareLinkedIn?: boolean
    allowAnalytics?: boolean
    allowMarketing?: boolean
  }>().default({
    shareEmail: false,
    sharePhone: false,
    shareLinkedIn: false,
    allowAnalytics: true,
    allowMarketing: false
  }),
  notifications: json('notifications').$type<{
    emailNotifications?: boolean
    jobAlerts?: boolean
    resumeUpdates?: boolean
    systemUpdates?: boolean
  }>().default({
    emailNotifications: true,
    jobAlerts: false,
    resumeUpdates: true,
    systemUpdates: true
  }),
  aiSettings: json('ai_settings').$type<{
    preferredProvider?: string
    creativityLevel?: number
    includePersonalInfo?: boolean
    defaultTemplate?: string
    defaultCountry?: string
  }>().default({
    creativityLevel: 0.3,
    includePersonalInfo: true,
    defaultTemplate: 'professional',
    defaultCountry: 'US'
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// AI Usage Analytics
export const aiUsageAnalytics = pgTable('ai_usage_analytics', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  provider: text('provider').notNull(), // 'openai', 'anthropic', etc.
  model: text('model').notNull(),
  feature: text('feature').notNull(), // 'chat', 'resume-generation', 'job-matching', etc.
  tokensUsed: integer('tokens_used').default(0),
  cost: decimal('cost', { precision: 10, scale: 6 }).default('0'),
  success: boolean('success').default(true),
  errorMessage: text('error_message'),
  responseTime: integer('response_time'), // milliseconds
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Rate Limiting Records
export const rateLimits = pgTable('rate_limits', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  identifier: text('identifier').notNull(), // IP address or user ID
  action: text('action').notNull(), // 'api-call', 'resume-generation', etc.
  count: integer('count').default(1),
  windowStart: timestamp('window_start').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Contact Form Submissions
export const contactSubmissions = pgTable('contact_submissions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  type: text('type').default('general'), // 'general', 'collaboration', 'consulting', etc.
  status: text('status').default('pending'), // 'pending', 'responded', 'archived'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  source: text('source').default('website'), // 'website', 'linkedin', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// System Health and Monitoring
export const systemHealth = pgTable('system_health', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  service: text('service').notNull(), // 'api', 'database', 'ai-provider', etc.
  status: text('status').notNull(), // 'healthy', 'degraded', 'down'
  responseTime: integer('response_time'), // milliseconds
  errorCount: integer('error_count').default(0),
  metadata: json('metadata').$type<{
    version?: string
    endpoint?: string
    errorDetails?: string
    [key: string]: any
  }>().default({}),
  checkedAt: timestamp('checked_at').defaultNow().notNull()
})

// Export types for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type Session = typeof sessions.$inferSelect
export type AIConversation = typeof aiConversations.$inferSelect
export type GeneratedResume = typeof generatedResumes.$inferSelect
export type JobSearch = typeof jobSearches.$inferSelect
export type JobMatch = typeof jobMatches.$inferSelect
export type TailoredResume = typeof tailoredResumes.$inferSelect
export type CareerAnalytics = typeof careerAnalytics.$inferSelect
export type UserPreferences = typeof userPreferences.$inferSelect
export type AIUsageAnalytics = typeof aiUsageAnalytics.$inferSelect
export type ContactSubmission = typeof contactSubmissions.$inferSelect