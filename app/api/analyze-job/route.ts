import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'API configuration missing'
      }, { status: 500 })
    }

    const analysisPrompt = `Analyze this job description for ATS optimization and resume tailoring. Extract key information needed to create an ATS-friendly resume.

JOB DESCRIPTION:
${jobDescription}

Return a JSON analysis with this exact structure:
{
  "jobTitle": "extracted job title",
  "companyName": "company name if mentioned",
  "experience": "required years of experience",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "preferredSkills": ["preferred1", "preferred2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "industryTerms": ["term1", "term2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "qualifications": ["qualification1", "qualification2"],
  "atsKeywords": ["critical keyword for ATS", "another ATS keyword"],
  "compensationRange": "salary range if mentioned",
  "location": "job location",
  "remoteOption": "remote/hybrid/onsite",
  "resumeStrategy": [
    "Key strategy point for tailoring resume",
    "Another important positioning tip",
    "Specific formatting recommendation"
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const analysis = JSON.parse(responseText)
      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error('Failed to parse job analysis:', responseText)

      // Fallback analysis
      const fallbackAnalysis = {
        jobTitle: "Technology Leadership Role",
        companyName: "Not specified",
        experience: "10+ years",
        requiredSkills: ["Leadership", "Data Engineering", "Cloud Platforms"],
        preferredSkills: ["AI/ML", "Team Management", "Strategic Planning"],
        keywords: ["technology", "leadership", "data", "engineering", "cloud"],
        industryTerms: ["digital transformation", "scalability", "architecture"],
        responsibilities: ["Lead engineering teams", "Drive technical strategy", "Manage stakeholders"],
        qualifications: ["Bachelor's degree", "10+ years experience", "Leadership experience"],
        atsKeywords: ["technology leader", "engineering manager", "data platforms"],
        compensationRange: "Not specified",
        location: "Not specified",
        remoteOption: "Not specified",
        resumeStrategy: [
          "Emphasize leadership and technical expertise",
          "Highlight quantified business impact",
          "Focus on relevant technology stack experience"
        ]
      }

      return NextResponse.json(fallbackAnalysis)
    }

  } catch (error) {
    console.error('Job analysis error:', error)
    return NextResponse.json({
      error: 'Failed to analyze job description'
    }, { status: 500 })
  }
}