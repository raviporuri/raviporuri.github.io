import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Test with hardcoded values
    const resend = new Resend('re_X4zXkNqr_Am23cdQ6AVePY5fZfajnP9te')

    const emailContent = `
Test Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}

Timestamp: ${new Date().toISOString()}
    `.trim()

    try {
      const result = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'raviporuri@gmail.com',
        subject: `TEST Contact Form: ${subject}`,
        text: emailContent,
        replyTo: email
      })

      console.log('Test email result:', result)

      return NextResponse.json({
        success: true,
        message: 'Test email sent',
        result: result
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json({
        success: false,
        error: emailError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}