import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { ratelimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { aiConversations, generatedResumes } from '@/lib/db/schema'
import { masterProfileData } from '@/lib/data/master-profile'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { withErrorHandling } from '@/lib/utils/error-handling'
import { logAIUsage } from '@/lib/utils/analytics'
import puppeteer from 'puppeteer'
import { generateResumeHTML } from '@/lib/utils/resume-templates'
import { extractTextFromFile } from '@/lib/utils/file-processing'

const ResumeGenerationSchema = z.object({
  jobDescription: z.string().min(50),
  targetRole: z.string().min(1),
  template: z.string().min(1),
  country: z.string().min(1),
  industry: z.string().min(1),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  customizations: z.object({
    includePhoto: z.boolean().default(false),
    colorScheme: z.string().default('blue'),
    fontStyle: z.string().default('modern'),
    sections: z.array(z.string()).default(['experience', 'education', 'skills'])
  }).optional()
})

const AI_PROVIDERS = [
  {
    name: 'openai',
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    model: 'gpt-4-1106-preview'
  },
  {
    name: 'anthropic',
    client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-3-sonnet-20240229'
  }
]

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const data = JSON.parse(dataString)

    // Validate request data
    const validatedData = ResumeGenerationSchema.parse(data)
    const { jobDescription, targetRole, template, country, industry, experienceLevel, customizations } = validatedData

    // Get user session
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'anonymous'

    // Extract text from uploaded files
    const uploadedFiles = []
    let fileIndex = 0
    let file = formData.get(`file_${fileIndex}`) as File | null

    while (file) {
      uploadedFiles.push(file)
      fileIndex++
      file = formData.get(`file_${fileIndex}`) as File | null
    }

    let existingResumeContent = ''
    if (uploadedFiles.length > 0) {
      const extractedTexts = await Promise.all(
        uploadedFiles.map(file => extractTextFromFile(file))
      )
      existingResumeContent = extractedTexts.join('\n\n')
    }

    // Build comprehensive system prompt for resume generation
    const systemPrompt = buildResumeGenerationPrompt(
      masterProfileData,
      jobDescription,
      targetRole,
      industry,
      experienceLevel,
      country,
      existingResumeContent
    )

    // Generate optimized resume content using AI
    let resumeContent = ''
    let aiProvider = ''
    let error: Error | null = null

    for (const provider of AI_PROVIDERS) {
      try {
        if (provider.name === 'openai') {
          const completion = await provider.client.chat.completions.create({
            model: provider.model,
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Generate a comprehensive, ATS-optimized resume for the role: ${targetRole}.

                Job Description:
                ${jobDescription}

                Requirements:
                - Match keywords from job description
                - Quantify achievements with metrics
                - Use action verbs
                - Format for ${country} standards
                - Optimize for ${industry} industry
                - Target ${experienceLevel} level position

                Return structured JSON with sections: personalInfo, summary, experience, education, skills, certifications, achievements.`
              }
            ],
            max_tokens: 3000,
            temperature: 0.3
          })

          resumeContent = completion.choices[0]?.message?.content || ''
          aiProvider = provider.name
          break

        } else if (provider.name === 'anthropic') {
          const completion = await provider.client.messages.create({
            model: provider.model,
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{
              role: 'user',
              content: `Generate a comprehensive, ATS-optimized resume for the role: ${targetRole}.

              Job Description:
              ${jobDescription}

              Requirements:
              - Match keywords from job description
              - Quantify achievements with metrics
              - Use action verbs
              - Format for ${country} standards
              - Optimize for ${industry} industry
              - Target ${experienceLevel} level position

              Return structured JSON with sections: personalInfo, summary, experience, education, skills, certifications, achievements.`
            }],
            temperature: 0.3
          })

          resumeContent = completion.content[0]?.text || ''
          aiProvider = provider.name
          break
        }
      } catch (providerError) {
        console.error(`${provider.name} failed:`, providerError)
        error = providerError as Error
        continue
      }
    }

    if (!resumeContent) {
      throw new Error(`All AI providers failed. Last error: ${error?.message}`)
    }

    // Parse AI-generated content
    let parsedResumeData
    try {
      parsedResumeData = JSON.parse(resumeContent)
    } catch {
      // Fallback: extract JSON from text response
      const jsonMatch = resumeContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResumeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI-generated resume content')
      }
    }

    // Generate HTML from resume data using selected template
    const resumeHTML = generateResumeHTML(parsedResumeData, template, customizations)

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(resumeHTML, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    })

    await browser.close()

    // Upload PDF to Vercel Blob storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `resume-${userId}-${timestamp}.pdf`

    const blob = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    })

    // Save resume generation record to database
    const resumeRecord = {
      id: crypto.randomUUID(),
      userId,
      jobDescription,
      targetRole,
      industry,
      template,
      country,
      experienceLevel,
      aiProvider,
      resumeData: parsedResumeData,
      pdfUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      customizations,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (userId !== 'anonymous') {
      await db.insert(generatedResumes).values(resumeRecord)
    }

    // Log AI usage
    await logAIUsage({
      userId,
      provider: aiProvider,
      model: AI_PROVIDERS.find(p => p.name === aiProvider)?.model || 'unknown',
      tokensUsed: resumeContent.length / 4,
      context: 'resume-generation',
      success: true
    })

    // Generate application tips
    const applicationTips = generateApplicationTips(jobDescription, parsedResumeData, targetRole)

    return NextResponse.json({
      success: true,
      resumeId: resumeRecord.id,
      downloadUrl: blob.downloadUrl,
      pdfUrl: blob.url,
      applicationTips,
      keywordMatches: extractKeywordMatches(jobDescription, resumeContent),
      atsScore: calculateATSScore(jobDescription, parsedResumeData),
      metadata: {
        provider: aiProvider,
        template,
        country,
        industry,
        experienceLevel,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function buildResumeGenerationPrompt(
  profileData: any,
  jobDescription: string,
  targetRole: string,
  industry: string,
  experienceLevel: string,
  country: string,
  existingResume: string
): string {
  return `
You are an expert ATS resume writer and career strategist with deep knowledge of:
- Applicant Tracking System optimization
- Industry-specific resume formatting
- Country-specific resume standards
- Keyword optimization strategies
- Achievement quantification methods

PROFESSIONAL PROFILE TO OPTIMIZE:
${JSON.stringify(profileData, null, 2)}

${existingResume ? `EXISTING RESUME CONTENT:\n${existingResume}\n\n` : ''}

TARGET ROLE: ${targetRole}
INDUSTRY: ${industry}
EXPERIENCE LEVEL: ${experienceLevel}
COUNTRY FORMAT: ${country}

RESUME GENERATION REQUIREMENTS:
1. ATS OPTIMIZATION:
   - Use standard section headers (Experience, Education, Skills)
   - Include relevant keywords from job description naturally
   - Use simple, clean formatting without complex graphics
   - Ensure consistent date formatting
   - Use standard fonts and bullet points

2. CONTENT STRATEGY:
   - Lead with quantified achievements and impact metrics
   - Use strong action verbs (Led, Architected, Scaled, Delivered)
   - Match experience level to role seniority
   - Include relevant technical skills and certifications
   - Highlight industry-relevant accomplishments

3. COUNTRY-SPECIFIC FORMATTING:
   - Follow ${country} resume standards and conventions
   - Use appropriate date formats and language variations
   - Include/exclude personal information per country norms
   - Apply correct length and structure expectations

4. ACHIEVEMENT QUANTIFICATION:
   - Include specific metrics (revenue, team size, percentages)
   - Demonstrate progression and growth over time
   - Show business impact and technical accomplishments
   - Reference scale of operations and responsibilities

IMPORTANT: Generate content that showcases the candidate's 25+ years of technology leadership, scaling organizations from startup to IPO, and current AI entrepreneurship focus. Emphasize data platform expertise, team leadership excellence, and measurable business impact.

Return only valid JSON with the complete resume structure.
`
}

function generateApplicationTips(jobDescription: string, resumeData: any, targetRole: string): string[] {
  return [
    'Customize your LinkedIn profile to match this resume',
    'Research the company\'s recent AI initiatives and mention them in your cover letter',
    'Prepare STAR method examples for your top 3 quantified achievements',
    'Review the job requirements and prepare specific examples for each',
    'Network with current employees through LinkedIn before applying',
    'Follow up 1-2 weeks after application with hiring manager'
  ]
}

function extractKeywordMatches(jobDescription: string, resumeContent: string): {
  matched: string[];
  missing: string[];
  score: number;
} {
  const jobKeywords = extractKeywords(jobDescription.toLowerCase())
  const resumeKeywords = extractKeywords(resumeContent.toLowerCase())

  const matched = jobKeywords.filter(keyword => resumeKeywords.includes(keyword))
  const missing = jobKeywords.filter(keyword => !resumeKeywords.includes(keyword))
  const score = Math.round((matched.length / jobKeywords.length) * 100)

  return { matched, missing, score }
}

function extractKeywords(text: string): string[] {
  // Extract relevant technical and professional keywords
  const keywords = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'but', 'for', 'are', 'will', 'you', 'all', 'can'].includes(word))

  return [...new Set(keywords)]
}

function calculateATSScore(jobDescription: string, resumeData: any): number {
  let score = 0
  let maxScore = 100

  // Keyword matching (40 points)
  const keywordMatch = extractKeywordMatches(jobDescription, JSON.stringify(resumeData))
  score += Math.min(40, (keywordMatch.score / 100) * 40)

  // Standard sections (20 points)
  const requiredSections = ['experience', 'education', 'skills']
  const presentSections = requiredSections.filter(section => resumeData[section])
  score += (presentSections.length / requiredSections.length) * 20

  // Quantified achievements (20 points)
  const resumeText = JSON.stringify(resumeData).toLowerCase()
  const numberMatches = resumeText.match(/\d+[%$kmb]|\d+\+|\d{1,3}(,\d{3})+/g) || []
  score += Math.min(20, (numberMatches.length / 5) * 20)

  // Contact information (20 points)
  if (resumeData.personalInfo?.email) score += 10
  if (resumeData.personalInfo?.phone) score += 10

  return Math.round(score)
}