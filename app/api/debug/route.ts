import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_BUNDLE } from '../../lib/prompt-bundle'

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV
      },
      promptBundle: {
        loaded: !!PROMPT_BUNDLE,
        hasGatePrompt: !!(PROMPT_BUNDLE?.response_templates?.gate_prompt)
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}