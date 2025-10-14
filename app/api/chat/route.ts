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

  return `You are an AI assistant specifically designed to answer questions about Ravi Poruri's professional background and experience. You have comprehensive knowledge of his career spanning 25+ years in technology leadership.

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

RECENT AI WORK (2024):
- Scanity.ai: AI-native security platform detecting vulnerabilities traditional scanners miss
- DefScan Pro: Advanced AI-powered vulnerability scanning and threat detection
- Scan2Secure: Comprehensive security platform with AI-enhanced analysis

SPEAKING & RECOGNITION:
- Snowflake Summit 2019 Speaker
- Tableau Conference 2019 Speaker
- Snowflake Black Diamond Executive Council Member
- SF State University Big Data Advisory Board Member

When answering questions:
1. Be specific and factual about Ravi's experience
2. Highlight quantified achievements when relevant
3. Connect his past experience to current AI work
4. Emphasize his progression from technical individual contributor to entrepreneur
5. Reference specific companies, technologies, and business impact
6. Be conversational but professional
7. If asked about something not in his profile, clearly state you don't have that information

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

    // Provide fallback response with basic info
    const fallbackResponse = `I apologize, but I'm experiencing technical difficulties right now. Here's some key information about Ravi Poruri:

Ravi is a technology leader with 25+ years of experience, currently the Founder & AI Product Leader at Equiti Ventures. He's building AI-powered applications including Scanity.ai, DefScan Pro, and Scan2Secure.

Previous roles include:
• Senior Director at Cisco Systems (2020-2024) - Grew CX Cloud to $500M+ ARR
• Global Head of Data & BI at Dropbox (2017-2020) - Led IPO, doubled revenue to $1.8B
• Director at Chegg (2015-2017) - 40% revenue increase in 12 months
• Senior Manager at Yahoo (2007-2015) - Managed massive data platforms

For more detailed information, please contact Ravi directly at raviporuri@gmail.com.`

    return NextResponse.json({ response: fallbackResponse })
  }
}