import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { name, role, purpose, email, company, location } = await req.json()

    // Validate required fields
    if (!name || !role || !purpose) {
      return NextResponse.json({
        error: 'Name, role, and purpose are required'
      }, { status: 400 })
    }

    // Validate role is one of the expected values
    const validRoles = [
      'recruiter',
      'executive_recruiter',
      'hiring_manager',
      'company_executive',
      'engineer',
      'investor',
      'startup_founder',
      'potential_client',
      'other'
    ]

    if (!validRoles.includes(role)) {
      return NextResponse.json({
        error: 'Invalid role specified'
      }, { status: 400 })
    }

    // Create visitor record
    const { data: visitor, error: vErr } = await supabase
      .from('visitors')
      .insert([{
        name,
        role,
        purpose,
        email,
        company,
        location
      }])
      .select()
      .single()

    if (vErr) {
      console.error('Error creating visitor:', vErr)
      return NextResponse.json({
        error: 'Failed to create visitor record'
      }, { status: 500 })
    }

    // Create chat session
    const { data: session, error: sErr } = await supabase
      .from('chat_sessions')
      .insert([{
        visitor_id: visitor.id,
        source: 'website',
        session_metadata: {
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          initial_timestamp: new Date().toISOString()
        }
      }])
      .select()
      .single()

    if (sErr) {
      console.error('Error creating session:', sErr)
      return NextResponse.json({
        error: 'Failed to create session'
      }, { status: 500 })
    }

    // Return session details
    return NextResponse.json({
      session_id: session.id,
      visitor: {
        id: visitor.id,
        name: visitor.name,
        role: visitor.role,
        purpose: visitor.purpose
      }
    })

  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('visitors')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        status: 'unhealthy',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 500 })
  }
}