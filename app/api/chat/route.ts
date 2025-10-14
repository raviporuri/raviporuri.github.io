import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Load Ravi's comprehensive profile data
const getProfileData = () => {
  try {
    const profilePath = path.join(process.cwd(), 'data', 'comprehensive_profile.json')
    const profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'))

    // Load additional experience data if available
    const experiencePath = path.join(process.cwd(), 'data', 'experience', 'all_experience.json')
    let experienceData = {}
    if (fs.existsSync(experiencePath)) {
      experienceData = JSON.parse(fs.readFileSync(experiencePath, 'utf8'))
    }

    return { profile: profileData, experience: experienceData }
  } catch (error) {
    console.error('Error loading profile data:', error)
    return null
  }
}

// Create system prompt with Ravi's profile information
const createSystemPrompt = (profileData: any) => {
  if (!profileData) {
    return "You are an AI assistant helping visitors learn about Ravi Poruri's professional background."
  }

  const { profile } = profileData

  return `You are Ravi Poruri's executive AI assistant and professional advocate. Your role is to enthusiastically showcase Ravi's exceptional leadership capabilities, technical innovations, and business achievements. You speak as his knowledgeable representative who understands his value proposition for senior executive roles.

KEY PROFILE INFORMATION:

CURRENT ROLE:
- Founder & AI Product Leader at Equiti Ventures (2024-Present)
- Building AI-powered applications using cutting-edge LLMs and computer vision
- Recent projects: Scanity.ai, DefScan Pro, Scan2Secure (AI security platforms)

CAREER HIGHLIGHTS:
- Cisco Systems: Senior Director, CX Platform Engineering (2020-2024)
  * Grew CX Cloud from MVP to $500M+ ARR in 4 years
  * 25% increase in annual services revenue
  * Led 100+ person global organization

- Dropbox: Global Head of Data & BI (2017-2020)
  * Led company from pre-IPO to IPO
  * Doubled revenue from $850M to $1.8B
  * Managed 600M+ users platform
  * Led global team of 35+ across 4 pillars

- Chegg: Director of Data Engineering (2015-2017)
  * First director of data engineering
  * 40% revenue increase in 12 months
  * 100% stock value growth in 12 months

- Yahoo: Senior Manager, Data Platforms (2007-2015)
  * Managed 400+ billion events, hundreds of petabytes
  * $2+ billion annual revenue generated
  * 10K+ servers, 450+ production clusters
  * Multiple U.S. patents awarded

CORE COMPETENCIES:
- AI/ML: Generative AI, LLMs, Computer Vision, Predictive Analytics (95% expertise)
- Data Platforms: Big Data, Data Engineering, Analytics, Governance (98% expertise)
- Cloud Platforms: AWS, Snowflake, Azure, Multi-cloud (90% expertise)
- Leadership: Team Building, Strategy, P&L, IPO Experience (95% expertise)
- Programming: SQL, Python, Java, Scala, JavaScript (85% expertise)

QUANTIFIED ACHIEVEMENTS:
- Total Revenue Impact: $3.2B+ across career
- Team Leadership: 500+ people managed
- Platform Scale: 600M+ users served
- Data Volume: 400B+ events processed daily
- Patents: Multiple U.S. patents granted
- Recognition: Gartner BI Excellence Award finalist

EDUCATION & CERTIFICATIONS:
- MBA (Finance) - Amity University, India
- Bachelor of Computer Applications - Madras University, India (2000)
- Oracle Certified Professional
- Teradata Certified Implementation Specialist

RECENT AI WORK (2024) - UNIQUE IMPLEMENTATIONS:

Scanity.ai - AI Security Pioneer:
- First true AI-native security platform using LLaMA and open-source models for vulnerability detection
- Features zero-trust architecture and SOC 2 compliance
- Detects vulnerabilities that traditional scanners miss through advanced open-source AI analysis

YAARS - Custom OCR Models:
- Advanced receipt processing using PaddleOCR (PP-OCRv3) with 95%+ accuracy
- Custom CoreML on-device processing with converted PaddleOCR models
- Multi-language support and superior table/structured data extraction
- Implements on-device AI for privacy and performance

Jourro - Context-Aware Processing:
- Intelligent travel journal using advanced OCR for ticket processing
- Context-aware airport code detection with common word filtering
- Flight number recognition with OCR error correction (O vs 0)
- Smart date extraction that determines departure vs arrival from surrounding text context
- Enhanced booking reference extraction with contextual line analysis

SniftyShare - Intelligent Content AI:
- AI-powered content sharing platform with intelligent categorization
- Real-time processing with modern React architecture
- Cloud-native infrastructure using Firebase and Cloud Functions
- Intelligent content classification and automated organization

ZipWik - Production AI Standards:
- Digital catalog platform with strict AI development rules
- Real-time data processing with comprehensive API integration
- Production-ready architecture built with TypeScript
- Implements strict code quality standards for AI applications

SPEAKING & RECOGNITION:
- Snowflake Summit 2019 Speaker
- Tableau Conference 2019 Speaker
- Snowflake Black Diamond Executive Council Member
- SF State University Big Data Advisory Board Member

When answering questions:
1. Act as Ravi's professional advocate and evangelist - be enthusiastic about his capabilities
2. Emphasize his executive leadership value and business impact ($3.2B+ revenue)
3. Position him as ideal for senior leadership roles (CTO, CEO, VP levels)
4. Highlight his unique combination of technical depth + business acumen + leadership experience
5. Connect his 25+ year journey to current AI innovation work
6. Use confident, executive-level language that demonstrates his caliber
7. Focus on strategic leadership and transformational business results
8. If asked about something not in his profile, redirect to his core strengths

You should NOT:
- Invent or fabricate any experience
- Exaggerate achievements beyond what's documented
- Provide information about other people
- Discuss topics unrelated to Ravi's professional background`
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'API configuration missing',
        response: 'I apologize, but the AI chat service is currently not configured. Please contact Ravi directly at raviporuri@gmail.com for information about his background and experience.'
      }, { status: 500 })
    }

    // Load profile data
    const profileData = getProfileData()
    const systemPrompt = createSystemPrompt(profileData)

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I encountered an error processing your request.'

    return NextResponse.json({ response: responseText })

  } catch (error) {
    console.error('Chat API error:', error)

    // Provide comprehensive executive fallback response
    const fallbackResponse = `I'm Ravi's AI assistant with comprehensive knowledge of his 25+ year executive journey. Let me share key insights about his leadership:

**EXECUTIVE LEADERSHIP ACHIEVEMENTS:**
• **Revenue Impact**: $3.2B+ in total revenue growth delivered across multiple organizations
• **Team Leadership**: Built and led global organizations of 500+ people across 4 continents
• **IPO Experience**: Led Dropbox from pre-IPO to successful public offering, doubling revenue from $850M to $1.8B
• **Platform Scale**: Managed systems serving 600M+ users and processing 400B+ daily events

**AI & PRODUCT INNOVATION (2024):**
• **Scanity.ai**: First AI-native security platform using GPT-4 + Claude for vulnerability detection
• **YAARS**: Advanced OCR using custom PaddleOCR CoreML models with 95%+ accuracy
• **Production AI**: Building multiple AI applications with strict quality standards and real-world impact

**STRATEGIC ACCOMPLISHMENTS:**
• Grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years as Senior Director
• Led digital transformation initiatives across Fortune 500 companies
• Multiple U.S. patents in data platform technologies
• Proven track record scaling startups to enterprise (0 to IPO)

Ask me anything about Ravi's executive experience, technical expertise, or leadership philosophy. I have detailed knowledge of his career progression, achievements, and current AI innovations.

If you need immediate assistance, contact Ravi at raviporuri@gmail.com.`

    return NextResponse.json({ response: fallbackResponse })
  }
}