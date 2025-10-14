import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, company, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email content
    const emailContent = `
New Contact Form Submission from raviporuri.com

Name: ${name}
Email: ${email}
Role: ${role || 'Not specified'}
Company: ${company || 'Not specified'}
Subject: ${subject}

Message:
${message}

---
Sent from: raviporuri.com contact form
Timestamp: ${new Date().toISOString()}
    `.trim()

    // Debug logging
    console.log('Email configuration check:', {
      hasResend: !!resend,
      hasContactEmail: !!process.env.CONTACT_EMAIL,
      contactEmail: process.env.CONTACT_EMAIL,
      resendApiKey: !!process.env.RESEND_API_KEY
    })

    // Send email using Resend if configured
    const contactEmail = 'raviporuri@gmail.com' // Clean, hardcoded email address

    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: 'noreply@raviporuri.com', // Using your verified domain
          to: contactEmail,
          subject: `Contact Form: ${subject}`,
          text: emailContent,
          replyTo: email.trim() // Also clean the reply-to email
        })
        console.log('Email sent successfully:', emailResult)
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Log the email content as fallback
        console.log('Contact Form Submission (Email failed):')
        console.log(emailContent)
      }
    } else {
      // Fallback: log the email content
      console.log('Contact Form Submission (No Resend service):')
      console.log(emailContent)
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}