import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { ratelimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { aiConversations } from '@/lib/db/schema'
import { masterProfileData } from '@/lib/data/master-profile'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { withErrorHandling } from '@/lib/utils/error-handling'
import { logAIUsage } from '@/lib/utils/analytics'

// Request validation schema
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  context: z.enum(['general', 'career-advice', 'technical-deep-dive', 'leadership-insights', 'document-analysis']).default('general'),
  userId: z.string().optional(),
  attachments: z.array(z.object({
    type: z.string(),
    content: z.string(),
    filename: z.string()
  })).optional()
})

// AI provider configuration with failover
const AI_PROVIDERS = [
  {
    name: 'openai',
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    model: 'gpt-4-1106-preview',
    maxTokens: 2000
  },
  {
    name: 'anthropic',
    client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2000
  }
]

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate request
    const body = await request.json()
    const validatedData = ChatRequestSchema.parse(body)
    const { message, conversationId, context, userId, attachments } = validatedData

    // Get user session (optional for public access)
    const session = await getServerSession(authOptions)
    const currentUserId = (session?.user as any)?.id || userId || 'anonymous'

    // Load conversation history if provided
    let conversationHistory: any[] = []
    if (conversationId && currentUserId !== 'anonymous') {
      const conversation = await db.query.aiConversations.findFirst({
        where: eq(aiConversations.id, conversationId)
      })
      conversationHistory = conversation?.messages || []
    }

    // Build comprehensive system prompt based on context
    const systemPrompt = buildSystemPrompt(context, attachments)

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: message }
    ]

    // Try AI providers with fallback
    let response: string = ''
    let aiProvider: string = ''
    let error: Error | null = null

    for (const provider of AI_PROVIDERS) {
      try {
        if (provider.name === 'openai') {
          const completion = await (provider.client as any).chat.completions.create({
            model: provider.model,
            messages: messages as any,
            max_tokens: provider.maxTokens,
            temperature: 0.7,
            stream: false
          })
          response = completion.choices[0]?.message?.content || ''
          aiProvider = provider.name
          break
        } else if (provider.name === 'anthropic') {
          const completion = await (provider.client as any).messages.create({
            model: provider.model,
            max_tokens: provider.maxTokens,
            messages: messages.filter(m => m.role !== 'system') as any,
            system: systemPrompt,
            temperature: 0.7
          })
          response = (completion.content[0] as any)?.text || ''
          aiProvider = provider.name
          break
        }
      } catch (providerError) {
        console.error(`${provider.name} failed:`, providerError)
        error = providerError as Error
        continue
      }
    }

    if (!response) {
      throw new Error(`All AI providers failed. Last error: ${error?.message}`)
    }

    // Generate follow-up suggestions and resources
    const suggestions = generateSmartSuggestions(message, response, context)
    const resources = generateRelevantResources(message, context)

    // Save conversation to database (if user is authenticated)
    let newConversationId = conversationId
    if (currentUserId !== 'anonymous') {
      const conversationData = {
        userId: currentUserId,
        conversationType: context,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: response, timestamp: new Date().toISOString(), provider: aiProvider }
        ],
        contextData: { attachments: attachments || [], suggestions, resources } as any
      }

      if (conversationId) {
        // Update existing conversation
        await db.update(aiConversations)
          .set({
            messages: conversationData.messages,
            contextData: conversationData.contextData as any,
            updatedAt: new Date()
          })
          .where(eq(aiConversations.id, conversationId))
      } else {
        // Create new conversation
        const [newConversation] = await db.insert(aiConversations)
          .values(conversationData)
          .returning({ id: aiConversations.id })
        newConversationId = newConversation.id
      }
    }

    // Log usage for analytics
    await logAIUsage({
      userId: currentUserId,
      provider: aiProvider,
      model: AI_PROVIDERS.find(p => p.name === aiProvider)?.model || 'unknown',
      tokensUsed: response.length / 4, // Rough token estimate
      context,
      success: true
    })

    return NextResponse.json({
      response,
      conversationId: newConversationId,
      suggestions,
      resources,
      metadata: {
        provider: aiProvider,
        model: AI_PROVIDERS.find(p => p.name === aiProvider)?.model,
        timestamp: new Date().toISOString(),
        context,
        attachments: attachments?.length || 0
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Build comprehensive system prompt based on Ravi's profile and context
function buildSystemPrompt(context: string, attachments?: any[]): string {
  const basePrompt = `
You are Ravi Poruri's advanced AI assistant with deep knowledge of his comprehensive professional background.

COMPREHENSIVE PROFILE CONTEXT:
${JSON.stringify(masterProfileData, null, 2)}

CURRENT CONVERSATION CONTEXT: ${context}

CAPABILITIES:
- Provide detailed insights based on 25+ years of technology leadership experience
- Reference specific achievements, metrics, and career transitions
- Offer practical advice based on real-world experience scaling organizations
- Connect user questions to relevant examples from Ravi's career
- Provide actionable recommendations with concrete next steps

RESPONSE GUIDELINES:
1. Be specific and reference actual achievements and metrics when relevant
2. Provide actionable insights, not just theoretical advice
3. Connect answers to real examples from Ravi's experience
4. Maintain professional tone while being approachable
5. Offer follow-up questions and suggestions for deeper exploration
6. When discussing technical topics, reference actual scale and complexity handled
7. For career advice, reference specific transitions and growth patterns
8. Include relevant timeframes and context for achievements

IMPORTANT: Always be accurate about the information provided and don't fabricate details not present in the profile.
`

  // Context-specific prompts
  const contextPrompts = {
    'career-advice': `
    SPECIALIZED FOCUS: Career Guidance & Leadership Development

    Provide comprehensive career guidance based on Ravi's journey from individual contributor to C-level executive to entrepreneur. Include:
    - Strategic career recommendations with timelines
    - Skill development priorities based on market trends
    - Network building strategies from executive experience
    - Concrete next steps with measurable outcomes
    - Reference specific transitions in Ravi's career path
    `,

    'technical-deep-dive': `
    SPECIALIZED FOCUS: Technical Architecture & Engineering Leadership

    Provide deep technical insights based on Ravi's experience building platforms that:
    - Served 600M+ users (Dropbox)
    - Processed 400B+ events daily (Yahoo)
    - Generated $3.2B+ in revenue impact
    - Managed teams of 100+ engineers

    Include specific architecture patterns, scalability solutions, and implementation strategies.
    `,

    'leadership-insights': `
    SPECIALIZED FOCUS: Team Leadership & Organizational Development

    Share leadership insights based on Ravi's track record:
    - <5% voluntary turnover throughout career
    - >80% employee satisfaction scores consistently
    - Built teams from 0 to 100+ people across global organizations
    - Led successful IPO data strategy (Dropbox)
    - Managed $500M+ ARR products (Cisco)

    Provide actionable leadership strategies with real examples.
    `,

    'document-analysis': `
    SPECIALIZED FOCUS: Professional Document Analysis

    Analyze uploaded documents (resumes, job descriptions, etc.) against Ravi's experience and provide:
    - Detailed feedback and improvement suggestions
    - Comparison with successful career patterns
    - Specific recommendations for advancement
    - Industry-specific insights based on Ravi's cross-industry experience
    ${attachments ? `\n\nATTACHED DOCUMENTS:\n${attachments.map(a => `${a.filename}: ${a.content.substring(0, 1000)}...`).join('\n\n')}` : ''}
    `
  }

  return basePrompt + (contextPrompts[context as keyof typeof contextPrompts] || contextPrompts['career-advice'])
}

function generateSmartSuggestions(userMessage: string, aiResponse: string, context: string): string[] {
  const messageLower = userMessage.toLowerCase()

  const suggestionMap = {
    'career-advice': [
      'How did you transition from IC to executive leadership?',
      'What skills are most important for technology leaders?',
      'How do you build and scale high-performing teams?',
      'What are the keys to successful digital transformation?'
    ],
    'technical-deep-dive': [
      'How do you approach large-scale system architecture?',
      'What are the challenges in scaling data platforms to petabyte scale?',
      'How do you implement real-time analytics at enterprise scale?',
      'What are the key patterns for cloud-native architecture?'
    ],
    'leadership-insights': [
      'How do you maintain low turnover in high-growth environments?',
      'What strategies work for global team management?',
      'How do you drive cultural transformation in large organizations?',
      'What are effective approaches to cross-functional leadership?'
    ],
    'document-analysis': [
      'How can I improve my resume for executive roles?',
      'What should I emphasize for technology leadership positions?',
      'How do I tailor my application for specific companies?',
      'What questions should I ask in executive interviews?'
    ]
  }

  const contextSuggestions = suggestionMap[context as keyof typeof suggestionMap] || suggestionMap['career-advice']

  // Add dynamic suggestions based on user message content
  if (messageLower.includes('startup') || messageLower.includes('founder')) {
    contextSuggestions.push('What lessons did you learn from founding Equiti Ventures?')
  }

  if (messageLower.includes('ai') || messageLower.includes('artificial intelligence')) {
    contextSuggestions.push('How are you leveraging AI in your current ventures?')
  }

  if (messageLower.includes('ipo') || messageLower.includes('public company')) {
    contextSuggestions.push('What was your experience leading Dropbox through IPO?')
  }

  return contextSuggestions.slice(0, 4) // Return top 4 suggestions
}

function generateRelevantResources(message: string, context: string): string[] {
  const resourceMap = {
    'career-advice': [
      'Executive Leadership Development Programs',
      'Technology Leadership Frameworks',
      'Career Transition Guides for Tech Professionals',
      'Networking Strategies for Senior Executives'
    ],
    'technical-deep-dive': [
      'System Architecture Best Practices',
      'Data Platform Implementation Guides',
      'Cloud Migration Strategies and Case Studies',
      'Scalability Patterns for Enterprise Systems'
    ],
    'leadership-insights': [
      'Team Building Methodologies',
      'Cross-functional Leadership Techniques',
      'Performance Management Frameworks',
      'Global Team Coordination Strategies'
    ],
    'document-analysis': [
      'Resume Optimization Guides',
      'Interview Preparation Resources',
      'Executive Search Best Practices',
      'Personal Branding for Technology Leaders'
    ]
  }

  return resourceMap[context as keyof typeof resourceMap] || resourceMap['career-advice']
}