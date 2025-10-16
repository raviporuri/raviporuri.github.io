import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, company, jobDescription, jobUrl } = await request.json()

    if (!jobTitle || !company || !jobDescription) {
      return NextResponse.json({
        error: 'Job title, company, and description are required'
      }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'API configuration missing'
      }, { status: 500 })
    }

    const tailoringPrompt = `You are an expert executive career strategist and company research analyst. Generate a comprehensive application strategy for a senior technology leader based on detailed company research and career analysis.

CANDIDATE PROFILE:
Ravi Poruri - Senior technology executive with 25+ years scaling engineering organizations and delivering $3.2B+ revenue impact. Currently Founder & AI Product Leader at Equiti Ventures. Previously Senior Director at Cisco (grew CX Cloud to $500M+ ARR), Global Head of Data at Dropbox (led pre-IPO to IPO, doubled revenue $850M→$1.8B). Expert in data platforms, AI/ML, cloud architecture, and leading teams of 100+ people.

DETAILED BACKGROUND:
- Current Role: Founder & AI Product Leader at Equiti Ventures (2024-Present)
- Previous: Senior Director, CX Platform Engineering at Cisco (2020-2024)
- Previously: Global Head of Data & BI at Dropbox (2017-2020)
- Previously: Director of Data Engineering at Chegg (2015-2017)
- Previously: Senior Manager/Manager at Yahoo (2007-2015)
- Education: MBA Finance, Bachelor Computer Applications
- Certifications: Oracle Certified Professional, Teradata Certified
- Patents: Multiple US Provisional Patents filed for data platform innovations
- Speaking: Keynote at Snowflake Summit, Tableau Conference

TARGET OPPORTUNITY:
Position: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}

IMPORTANT: You must analyze the company ${company} and generate realistic, specific insights based on their industry, size, and business model. Use your knowledge of technology companies to provide accurate assessments of company culture, challenges, and opportunities.

Create comprehensive application materials with these components:

1. RELEVANCE ANALYSIS & STRATEGY:
- Overall fit score (1-100)
- Key strengths alignment
- Potential concerns/gaps
- Positioning strategy

2. TAILORED RESUME CONTENT:
- Professional summary (2-3 sentences, ATS-optimized)
- Top 4 quantified achievements matching role requirements
- Relevant technical skills prioritized for this role
- Work experience bullets emphasizing role-relevant accomplishments

3. COMPLETE COVER LETTER:
- Full cover letter (3-4 paragraphs, 250-300 words)
- Company research insights
- Specific role connections

4. INTERVIEW PREPARATION:
- 5 STAR-method stories prepared for behavioral questions
- Technical discussion points for role requirements
- 10 strategic questions to ask interviewer
- Salary negotiation talking points

5. APPLICATION STRATEGY:
- Best application approach
- LinkedIn networking strategy
- Follow-up timeline and messages

6. COMPANY RESEARCH & INSIGHTS:
- Company overview and mission
- Recent developments and news
- Culture and values assessment
- Glassdoor insights estimate
- Potential hiring manager research
- Competitive landscape

Return ONLY valid JSON with this comprehensive structure:
{
  "relevanceScore": 85,
  "matchStrengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "potentialConcerns": ["concern 1", "concern 2"],
  "positioningStrategy": "How to position Ravi for maximum impact",

  "resumeContent": {
    "professionalSummary": "ATS-optimized 2-3 sentence summary with role keywords",
    "keyAchievements": [
      "Quantified achievement 1 relevant to role",
      "Quantified achievement 2 relevant to role",
      "Quantified achievement 3 relevant to role",
      "Quantified achievement 4 relevant to role"
    ],
    "technicalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "workExperience": [
      "COMPANY - TITLE (MM/YYYY - MM/YYYY)\\n• Role-specific bullet point with metrics\\n• Another relevant achievement\\n• Third accomplishment highlighting role fit"
    ]
  },

  "coverLetter": {
    "fullText": "Complete 3-4 paragraph cover letter (250-300 words)",
    "keyPoints": ["main selling point 1", "main selling point 2", "main selling point 3"]
  },

  "interviewPrep": {
    "starStories": [
      {"situation": "Context", "task": "What needed to be done", "action": "What Ravi did", "result": "Quantified outcome", "relevance": "Why this matters for target role"},
      {"situation": "Context", "task": "What needed to be done", "action": "What Ravi did", "result": "Quantified outcome", "relevance": "Why this matters for target role"},
      {"situation": "Context", "task": "What needed to be done", "action": "What Ravi did", "result": "Quantified outcome", "relevance": "Why this matters for target role"},
      {"situation": "Context", "task": "What needed to be done", "action": "What Ravi did", "result": "Quantified outcome", "relevance": "Why this matters for target role"},
      {"situation": "Context", "task": "What needed to be done", "action": "What Ravi did", "result": "Quantified outcome", "relevance": "Why this matters for target role"}
    ],
    "technicalDiscussion": ["technical point 1", "technical point 2", "technical point 3"],
    "questionsToAsk": [
      "Strategic question about company direction",
      "Technical question about role challenges",
      "Team dynamics question",
      "Growth and development question",
      "Success metrics question",
      "Technology stack question",
      "Company culture question",
      "Decision making process question",
      "Future roadmap question",
      "Performance evaluation question"
    ],
    "salaryNegotiation": {
      "marketData": "Research insights on compensation for this role",
      "valueProposition": "Key points highlighting Ravi's worth",
      "negotiationApproach": "Recommended strategy for salary discussions"
    }
  },

  "applicationStrategy": {
    "preferredChannel": "Recommended application method",
    "linkedinStrategy": "Specific networking approach and connection messages",
    "followUpPlan": "Timeline and content for follow-up communications",
    "additionalResearch": "Company/role research recommendations"
  },

  "companyResearch": {
    "overview": "Company description, mission, and core business",
    "recentNews": ["recent development 1", "recent development 2", "recent development 3"],
    "cultureAndValues": "Assessment of company culture and work environment",
    "glassdoorEstimate": {
      "rating": "Estimated rating (e.g., 4.2/5.0)",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "salaryRange": "Estimated salary range for this role"
    },
    "hiringManager": {
      "potentialTitles": ["likely hiring manager titles"],
      "researchTips": "How to identify and connect with hiring manager",
      "connectionStrategy": "LinkedIn outreach approach"
    },
    "competitiveLandscape": "Key competitors and market position"
  }
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: tailoringPrompt
      }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const strategy = JSON.parse(responseText)

      return NextResponse.json({
        ...strategy,
        jobDetails: {
          title: jobTitle,
          company: company,
          url: jobUrl
        }
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)

      // Fallback strategy with comprehensive structure
      const fallbackStrategy = {
        relevanceScore: 75,
        matchStrengths: ["25+ years technology leadership", "proven scaling experience", "$3.2B+ revenue impact"],
        potentialConcerns: ["role-specific requirements need analysis", "location or timing considerations"],
        positioningStrategy: "Position as transformation leader with proven track record of scaling technology organizations from startup to enterprise",

        resumeContent: {
          professionalSummary: "Senior technology executive with 25+ years scaling engineering organizations and delivering $3.2B+ revenue impact. Proven leader in AI/ML platforms, data engineering, and digital transformation with experience from startup to IPO.",
          keyAchievements: [
            "Grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years leading 100+ person global team",
            "Led Dropbox from pre-IPO to successful IPO, doubling revenue from $850M to $1.8B",
            "Generated $2B+ annual revenue at Yahoo managing 400B+ events daily across 450+ clusters",
            "Currently building AI-first companies with cutting-edge LLM and computer vision technologies"
          ],
          technicalSkills: ["AI/ML Platforms", "Data Engineering", "Cloud Architecture", "Leadership", "Digital Transformation"],
          workExperience: [
            "EQUITI VENTURES - Founder & AI Product Leader (01/2024 - Present)\\n• Leading development of AI-powered applications using LLMs and computer vision\\n• Building next-generation AI security platforms with advanced ML capabilities\\n• Creating AI-native applications leveraging cutting-edge artificial intelligence",
            "CISCO SYSTEMS - Senior Director, CX Platform Engineering (03/2020 - 12/2024)\\n• Grew CX Cloud from MVP to $500M+ ARR serving 4500+ enterprise customers globally\\n• Led 100+ person organization across data engineering, analytics, and cloud teams\\n• Achieved 25% increase in annual services revenue and 50% reduction in renewals cycle"
          ]
        },

        coverLetter: {
          fullText: `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With 25+ years of technology leadership experience and a proven track record of scaling engineering organizations while delivering $3.2B+ in revenue impact, I am excited about the opportunity to contribute to ${company}'s continued growth and innovation.

Throughout my career, I have consistently transformed technology organizations and driven significant business outcomes. At Cisco, I grew the CX Cloud platform from MVP to over $500M ARR in just four years while leading a global team of 100+ engineers. Previously, at Dropbox, I led the company through its pre-IPO to IPO transition, helping double revenue from $850M to $1.8B while serving 600M+ users globally. Currently, as Founder of Equiti Ventures, I'm building AI-first companies that leverage cutting-edge LLM and computer vision technologies.

My expertise in data platforms, AI/ML architecture, and cloud-native solutions, combined with my experience scaling teams and driving digital transformation initiatives, positions me well to excel in this role. I am particularly drawn to ${company}'s mission and would welcome the opportunity to discuss how my background in building scalable technology platforms and leading high-performing teams can contribute to your organization's strategic objectives.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
Ravi Poruri`,
          keyPoints: [
            "25+ years technology leadership with $3.2B+ revenue impact",
            "Proven track record scaling platforms from startup to $500M+ ARR",
            "Current expertise in AI/ML and next-generation technology platforms"
          ]
        },

        interviewPrep: {
          starStories: [
            {
              situation: "Cisco CX Cloud platform needed to scale rapidly to meet enterprise demand",
              task: "Transform MVP into enterprise-grade platform while building global team",
              action: "Led 100+ person organization across engineering, analytics, and cloud teams",
              result: "Grew platform from MVP to $500M+ ARR in 4 years, serving 4500+ customers",
              relevance: "Demonstrates ability to scale technology platforms and teams under pressure"
            },
            {
              situation: "Dropbox approaching IPO needed to prove sustainable growth and platform reliability",
              task: "Lead data strategy and platform scaling for 600M+ users through IPO transition",
              action: "Built enterprise analytics on AWS/Snowflake, led 35+ person global team",
              result: "Successfully supported IPO process, doubled revenue from $850M to $1.8B",
              relevance: "Shows experience with high-stakes scaling and public company readiness"
            }
          ],
          technicalDiscussion: ["AI/ML platform architecture", "data engineering at scale", "cloud-native development"],
          questionsToAsk: [
            "What are the biggest technical challenges facing the team currently?",
            "How does this role contribute to the company's AI and data strategy?",
            "What would success look like in the first 90 days?",
            "How does the engineering culture support innovation and rapid scaling?",
            "What opportunities exist for technical leadership and mentorship?"
          ],
          salaryNegotiation: {
            marketData: "Senior technology leadership roles typically range from $400K-$800K+ total compensation",
            valueProposition: "Proven track record of delivering $3.2B+ revenue impact and scaling organizations",
            negotiationApproach: "Focus on total impact and transformation capabilities rather than just base salary"
          }
        },

        applicationStrategy: {
          preferredChannel: "Direct application combined with targeted LinkedIn outreach to hiring manager and team leads",
          linkedinStrategy: "Research current team members, connect with 2-3 relevant leaders, mention specific interest in company's technology direction",
          followUpPlan: "Follow up one week post-application, then bi-weekly with relevant industry insights",
          additionalResearch: "Study recent company announcements, technology blog posts, and competitive positioning"
        },

        companyResearch: {
          overview: `${company} is a technology company operating in the ${jobTitle.includes('AI') || jobTitle.includes('Data') ? 'data and AI' : 'technology'} space. Research needed for specific company details, mission, and business model.`,
          recentNews: [
            "Check company website and news section for recent announcements",
            "Research recent product launches or funding rounds",
            "Look for leadership changes or strategic initiatives"
          ],
          cultureAndValues: "Research company culture through LinkedIn employee posts, company blog, and Glassdoor reviews. Look for values statements on company website.",
          glassdoorEstimate: {
            rating: "Research on Glassdoor for actual rating",
            pros: ["Competitive compensation", "Growth opportunities", "Strong technology focus"],
            cons: ["Research specific challenges on Glassdoor", "Work-life balance considerations"],
            salaryRange: "Research on Glassdoor, Levels.fyi, or similar platforms for accurate salary data"
          },
          hiringManager: {
            potentialTitles: ["VP Engineering", "CTO", "Head of Engineering", "Engineering Director"],
            researchTips: "Search LinkedIn for current employees in leadership roles. Look for recent posts about hiring or team growth.",
            connectionStrategy: "Connect with current employees, mention shared interests in technology leadership, reference specific company initiatives"
          },
          competitiveLandscape: "Research company's main competitors and market position. Understand unique value proposition and recent competitive advantages."
        },

        jobDetails: {
          title: jobTitle,
          company: company,
          url: jobUrl
        }
      }

      return NextResponse.json(fallbackStrategy)
    }

  } catch (error) {
    console.error('Job tailoring error:', error)
    return NextResponse.json({
      error: 'Failed to create application strategy'
    }, { status: 500 })
  }
}