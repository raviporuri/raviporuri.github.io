import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { PROMPT_BUNDLE } from '../../lib/prompt-bundle'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Use embedded prompt bundle for reliable access across all environments
const getPromptBundle = () => {
  return PROMPT_BUNDLE
}

// Get session context from database
async function getSessionContext(session_id: string) {
  const { data: session, error: sErr } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      created_at,
      status,
      visitors (
        id, name, role, purpose, company, email
      )
    `)
    .eq('id', session_id)
    .single()

  if (sErr || !session) {
    throw new Error('Session not found')
  }

  const visitor = (session as any).visitors
  return { session, visitor }
}

// Check if this is a gated conversation (has session_id)
function isGatedConversation(requestBody: any): boolean {
  return requestBody.session_id && typeof requestBody.session_id === 'string'
}

// Create system prompt from bundle
function createSystemPromptFromBundle(visitor?: any): string {
  const bundle = getPromptBundle()
  if (!bundle) {
    return "You are an AI assistant helping visitors learn about Ravi Poruri's professional background."
  }

  const systemMessages = bundle.system.content.join('\n\n')
  const developerMessages = bundle.developer.content.join('\n\n')

  if (visitor) {
    // Post-gate: include visitor context
    const rolePolicy = bundle.visitor_role_policies[visitor.role] ||
                      bundle.visitor_role_policies.default

    const ackGate = bundle.response_templates.ack_gate
      .replace('{{visitor_name}}', visitor.name)
      .replace('{{visitor_role}}', visitor.role)
      .replace('{{visitor_purpose}}', visitor.purpose)

    return `${systemMessages}\n\n${developerMessages}\n\nVISITOR CONTEXT:\n${ackGate}\n\nRole-specific guidance: ${JSON.stringify(rolePolicy)}`
  } else {
    // Pre-gate: enforce gatekeeping
    return `${systemMessages}\n\n${developerMessages}\n\nIMPORTANT: You MUST use the gate prompt for any new conversation.`
  }
}

// Legacy fallback - kept for backward compatibility
const createSystemPrompt = (profileData: any) => {
  return createSystemPromptFromBundle()
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const { message, session_id } = requestBody

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'API configuration missing',
        response: 'I apologize, but the AI chat service is currently not configured. Please contact Ravi directly at raviporuri@gmail.com for information about his background and experience.'
      }, { status: 500 })
    }

    let visitor = null
    let sessionContext = null

    // Handle gated conversation
    if (isGatedConversation(requestBody)) {
      try {
        sessionContext = await getSessionContext(session_id)
        visitor = sessionContext.visitor

        // Save user message to database
        await supabase.from('messages').insert([{
          session_id,
          role: 'user',
          content: message,
          metadata: {
            visitor_role: visitor.role,
            visitor_purpose: visitor.purpose,
            timestamp: new Date().toISOString()
          }
        }])
      } catch (error) {
        console.error('Session context error:', error)
        return NextResponse.json({
          error: 'Invalid or expired session',
          response: 'Your session has expired. Please refresh and start a new conversation.'
        }, { status: 400 })
      }
    }

    // For non-gated conversations, always return gate prompt on first interaction
    const bundle = getPromptBundle()
    if (!visitor && bundle) {
      const gatePrompt = bundle.response_templates.gate_prompt
      return NextResponse.json({ response: gatePrompt })
    }

    // Create appropriate system prompt
    const systemPrompt = createSystemPromptFromBundle(visitor)

    // Call Anthropic API with session context
    const messages: any[] = [
      {
        role: 'user',
        content: message
      }
    ]

    // Create Anthropic client for this request
    const anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const response = await anthropicClient.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.4,
      system: systemPrompt,
      messages
    })

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I encountered an error processing your request.'

    // Save AI response to database if we have a session
    if (session_id && visitor) {
      await supabase.from('messages').insert([{
        session_id,
        role: 'assistant',
        content: responseText,
        model: 'claude-3-haiku-20240307',
        metadata: {
          usage: response.usage,
          visitor_role: visitor.role,
          visitor_purpose: visitor.purpose,
          timestamp: new Date().toISOString()
        }
      }])

      // Update session activity
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', session_id)
    }

    return NextResponse.json({ response: responseText })

  } catch (error) {
    console.error('Chat API error:', error)

    // Get visitor from outer scope for error handling
    let visitor = null
    try {
      const requestBody = await request.clone().json()
      if (requestBody.session_id) {
        const sessionContext = await getSessionContext(requestBody.session_id)
        visitor = sessionContext.visitor
      }
    } catch (e) {
      // Ignore context errors in fallback
    }

    // Enhanced fallback with gate awareness
    const bundle = getPromptBundle()
    if (bundle && !visitor) {
      const gatePrompt = bundle.response_templates.gate_prompt
      return NextResponse.json({ response: gatePrompt })
    }

    // Comprehensive executive fallback response
    const fallbackResponse = `I'm Ravi's AI assistant with comprehensive knowledge of his 25+ year executive journey. Let me share key insights about his leadership:

**EXECUTIVE LEADERSHIP ACHIEVEMENTS:**
• **Revenue Impact**: $3.2B+ in total revenue growth delivered across multiple organizations
• **Team Leadership**: Built and led global organizations of 500+ people across 4 continents
• **IPO Experience**: Led Dropbox from pre-IPO to successful public offering, doubling revenue from $850M to $1.8B
• **Platform Scale**: Managed systems serving 600M+ users and processing 400B+ daily events

**AI & PRODUCT INNOVATION (2024):**
• **Scanity.ai**: First AI-native security platform using LLaMA and open-source models for vulnerability detection
• **YAARS**: Advanced OCR using custom PaddleOCR CoreML models with 95%+ accuracy
• **Production AI**: Building multiple AI applications with strict quality standards and real-world impact

**STRATEGIC ACCOMPLISHMENTS:**
• Grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years as Senior Director
• Led digital transformation initiatives across Fortune 500 companies
• Multiple U.S. patents in data platform technologies
• Proven track record scaling startups to enterprise (0 to IPO)

To continue our conversation with personalized insights based on your role and interests, please let me know your name, role (recruiter, executive, hiring manager, etc.), and what you're hoping to learn about Ravi.

For immediate assistance, contact Ravi at raviporuri@gmail.com.`

    return NextResponse.json({ response: fallbackResponse })
  }
}