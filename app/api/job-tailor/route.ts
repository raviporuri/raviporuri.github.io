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

    const tailoringPrompt = `You are an executive career strategist creating targeted application materials for a senior technology leader.

CANDIDATE PROFILE:
Ravi Poruri - Senior technology executive with 25+ years scaling engineering organizations and delivering $3.2B+ revenue impact. Currently Founder & AI Product Leader at Equiti Ventures. Previously Senior Director at Cisco (grew CX Cloud to $500M+ ARR), Global Head of Data at Dropbox (led pre-IPO to IPO, doubled revenue $850M→$1.8B). Expert in data platforms, AI/ML, cloud architecture, and leading teams of 100+ people.

TARGET OPPORTUNITY:
Position: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}

Create comprehensive application strategy with these components:

1. RELEVANCE ANALYSIS (1-100 score):
- Role alignment with experience level
- Technical skills match
- Leadership scope fit
- Industry/company stage fit

2. TAILORED RESUME STRATEGY:
- Key experiences to emphasize
- Quantified achievements to highlight
- Technical skills to prioritize
- Leadership stories most relevant

3. COVER LETTER STRATEGY:
- Opening hook connecting to company/role
- 2-3 key selling points with specific examples
- Closing call-to-action

4. INTERVIEW PREPARATION:
- Top 3 stories to prepare (STAR format topics)
- Technical depth areas to review
- Questions to ask about role/company

5. APPLICATION APPROACH:
- Best application channel (if not direct apply)
- LinkedIn connection strategy
- Follow-up timeline

Return ONLY valid JSON with this structure:
{
  "relevanceScore": 85,
  "matchStrengths": ["leadership scale", "technical expertise", "industry experience"],
  "potentialConcerns": ["company stage mismatch", "location requirements"],
  "resumeStrategy": {
    "keyExperiences": ["Cisco CX Cloud growth", "Dropbox IPO leadership"],
    "quantifiedAchievements": ["$500M+ ARR growth", "600M+ users served"],
    "technicalSkills": ["AI/ML platforms", "data engineering", "cloud architecture"],
    "leadershipStories": ["scaling 100+ person teams", "pre-IPO to IPO transition"]
  },
  "coverLetterStrategy": {
    "openingHook": "Company-specific connection statement",
    "keySellingPoints": [
      "25+ years scaling technology organizations with $3.2B+ revenue impact",
      "Proven track record growing platforms from startup to $500M+ ARR",
      "Deep expertise in AI/ML and data platforms matching role requirements"
    ],
    "closingCTA": "I'd welcome the opportunity to discuss how my experience scaling data platforms and AI initiatives can drive [company]'s next growth phase."
  },
  "interviewPrep": {
    "starStories": [
      "How I grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years",
      "Leading Dropbox through pre-IPO to IPO transition with revenue doubling",
      "Building AI-first companies at Equiti Ventures with cutting-edge technology"
    ],
    "technicalDepth": ["AI/ML architecture", "data platform scaling", "cloud infrastructure"],
    "questionsToAsk": [
      "What are the biggest technical challenges facing the team?",
      "How does this role contribute to the company's AI/data strategy?",
      "What does success look like in the first 90 days?"
    ]
  },
  "applicationStrategy": {
    "preferredChannel": "Direct application + LinkedIn outreach to hiring manager",
    "networkingApproach": "Connect with current employees in similar roles",
    "followUpTimeline": "1 week post-application, then bi-weekly check-ins"
  }
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
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

      // Fallback strategy
      const fallbackStrategy = {
        relevanceScore: 75,
        matchStrengths: ["executive leadership experience", "technology expertise", "scaling experience"],
        potentialConcerns: ["role-specific requirements may need clarification"],
        resumeStrategy: {
          keyExperiences: ["Cisco CX Cloud growth to $500M+ ARR", "Dropbox pre-IPO to IPO leadership"],
          quantifiedAchievements: ["$3.2B+ total revenue impact", "Led 500+ people globally"],
          technicalSkills: ["AI/ML platforms", "data engineering", "cloud architecture", "team leadership"],
          leadershipStories: ["scaling engineering organizations", "digital transformation leadership"]
        },
        coverLetterStrategy: {
          openingHook: `Your recent work in ${company}'s technology transformation aligns perfectly with my 25+ years scaling data platforms and AI initiatives.`,
          keySellingPoints: [
            "Proven track record delivering $3.2B+ revenue impact across technology leadership roles",
            "Deep experience scaling engineering teams from startup to Fortune 500 enterprise",
            "Current expertise building AI-first companies with cutting-edge technology platforms"
          ],
          closingCTA: `I'd welcome the opportunity to discuss how my experience can accelerate ${company}'s technology strategy and growth objectives.`
        },
        interviewPrep: {
          starStories: [
            "Growing Cisco CX Cloud from MVP to $500M+ ARR through strategic leadership",
            "Leading Dropbox through successful IPO with platform serving 600M+ users",
            "Building next-generation AI applications at Equiti Ventures"
          ],
          technicalDepth: ["AI/ML architecture", "data platform scaling", "cloud infrastructure"],
          questionsToAsk: [
            "What are the key technology challenges you're looking to solve?",
            "How does this role contribute to the company's strategic objectives?",
            "What would success look like in the first 6 months?"
          ]
        },
        applicationStrategy: {
          preferredChannel: "Direct application with targeted LinkedIn outreach",
          networkingApproach: "Research and connect with team members and leadership",
          followUpTimeline: "One week post-application, then every two weeks"
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