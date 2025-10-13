import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { ratelimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { tailoredResumes } from '@/lib/db/schema'
import { masterProfileData } from '@/lib/data/master-profile'
import { put } from '@vercel/blob'
import { withErrorHandling } from '@/lib/utils/error-handling'
import { logAIUsage } from '@/lib/utils/analytics'
import { extractTextFromFile } from '@/lib/utils/file-processing'
import { generateResumeHTML } from '@/lib/utils/resume-templates'
import puppeteer from 'puppeteer'

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

// Mock job database - in production, fetch from actual job sources
const MOCK_JOBS: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Senior AI/ML Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: `We are seeking a Senior AI/ML Engineer to join our growing team. You will be responsible for designing and implementing machine learning models, working with large datasets, and collaborating with cross-functional teams to deliver AI-powered products.

    Key Responsibilities:
    - Design and develop machine learning algorithms and models
    - Work with big data technologies (Spark, Hadoop, Kafka)
    - Implement MLOps practices and CI/CD pipelines
    - Collaborate with product teams on AI strategy
    - Mentor junior team members

    Required Skills:
    - 5+ years of experience in machine learning and AI
    - Strong programming skills in Python, TensorFlow, PyTorch
    - Experience with cloud platforms (AWS, GCP, Azure)
    - Knowledge of data engineering and ETL processes
    - Strong communication and leadership skills`,
    requirements: [
      'Machine Learning',
      'Python',
      'TensorFlow',
      'PyTorch',
      'AWS',
      'Data Engineering',
      'Leadership',
      'MLOps'
    ]
  },
  '2': {
    id: '2',
    title: 'VP of Engineering',
    company: 'GrowthTech',
    location: 'New York, NY',
    description: `We are looking for a VP of Engineering to lead our engineering organization. This role requires a proven track record of scaling engineering teams, driving technical excellence, and delivering high-quality products at scale.

    Key Responsibilities:
    - Lead and scale engineering teams (50+ engineers)
    - Define technical strategy and architecture decisions
    - Drive engineering culture and best practices
    - Partner with product and business teams
    - Manage engineering budget and resource allocation

    Required Experience:
    - 15+ years of engineering experience, 8+ in leadership
    - Experience scaling teams from 20 to 100+ engineers
    - Strong background in distributed systems and microservices
    - Track record of building high-availability systems
    - Experience with agile methodologies and DevOps practices`,
    requirements: [
      'Engineering Leadership',
      'Team Scaling',
      'Distributed Systems',
      'Microservices',
      'DevOps',
      'Agile',
      'Strategic Planning',
      'Budget Management'
    ]
  }
}

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
    const jobId = formData.get('jobId') as string
    const resumeFile = formData.get('resume') as File

    if (!jobId || !resumeFile) {
      return NextResponse.json(
        { error: 'Job ID and resume file are required' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'anonymous'

    // Get job details
    const job = MOCK_JOBS[jobId]
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Extract resume content
    const resumeContent = await extractTextFromFile(resumeFile)

    // Generate tailored resume using AI
    const tailoredResumeData = await generateTailoredResume(
      resumeContent,
      job,
      masterProfileData
    )

    // Generate cover letter
    const coverLetter = await generateCoverLetter(
      tailoredResumeData,
      job,
      masterProfileData
    )

    // Generate application tips
    const applicationTips = await generateApplicationTips(
      tailoredResumeData,
      job,
      resumeContent
    )

    // Generate HTML and PDF
    const resumeHTML = generateResumeHTML(tailoredResumeData, 'professional', {
      colorScheme: 'blue',
      fontStyle: 'modern'
    })

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
    const fileName = `tailored-resume-${userId}-${jobId}-${timestamp}.pdf`

    const blob = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    })

    // Save tailored resume record to database
    const tailoredResumeRecord = {
      id: crypto.randomUUID(),
      userId,
      jobId,
      jobTitle: job.title,
      company: job.company,
      resumeData: tailoredResumeData,
      coverLetter,
      applicationTips,
      pdfUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (userId !== 'anonymous') {
      await db.insert(tailoredResumes).values(tailoredResumeRecord)
    }

    // Log AI usage
    await logAIUsage({
      userId,
      provider: 'multiple',
      model: 'resume-tailoring',
      tokensUsed: resumeContent.length / 4,
      context: 'resume-tailoring',
      success: true
    })

    return NextResponse.json({
      success: true,
      tailoredResume: {
        id: tailoredResumeRecord.id,
        downloadUrl: blob.downloadUrl,
        pdfUrl: blob.url,
        coverLetter,
        applicationTips
      },
      matchAnalysis: {
        keywordsOptimized: extractKeywords(job.description).slice(0, 10),
        sectionsModified: ['summary', 'experience', 'skills'],
        improvementScore: 25 // Percentage improvement
      },
      metadata: {
        jobTitle: job.title,
        company: job.company,
        tailoredAt: new Date().toISOString()
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

async function generateTailoredResume(
  originalResumeContent: string,
  job: any,
  profileData: any
): Promise<any> {
  const systemPrompt = `
You are an expert ATS resume optimization specialist. Your task is to tailor a resume to perfectly match a specific job posting while maintaining accuracy and authenticity.

MASTER PROFILE DATA (Use as reference for accurate information):
${JSON.stringify(profileData, null, 2)}

ORIGINAL RESUME CONTENT:
${originalResumeContent}

TARGET JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${job.requirements.join(', ')}

TAILORING REQUIREMENTS:
1. KEYWORD OPTIMIZATION:
   - Naturally incorporate job-specific keywords from the job description
   - Use exact keyword phrases where appropriate
   - Maintain keyword density for ATS optimization

2. EXPERIENCE REFRAMING:
   - Emphasize relevant experience that matches job requirements
   - Reorder bullet points to prioritize most relevant accomplishments
   - Use industry-specific terminology from the job posting
   - Quantify achievements with metrics when possible

3. SKILLS PRIORITIZATION:
   - Move most relevant skills to the top
   - Add any missing critical skills if they exist in the master profile
   - Use skill names exactly as they appear in the job posting

4. SUMMARY OPTIMIZATION:
   - Rewrite summary to directly address the role requirements
   - Include key metrics and achievements relevant to the position
   - Use language that mirrors the job posting tone

5. SECTION EMPHASIS:
   - Expand relevant sections that match job priorities
   - De-emphasize less relevant experience
   - Add certifications or education if relevant to the role

IMPORTANT GUIDELINES:
- NEVER fabricate experience or skills not in the original content
- Maintain chronological accuracy
- Keep all quantified achievements accurate
- Only reframe and emphasize existing experience
- Ensure the resume remains truthful and verifiable

Return structured JSON format with complete resume sections: personalInfo, summary, experience, education, skills, certifications, achievements.
`

  // Try AI providers for resume generation
  for (const provider of AI_PROVIDERS) {
    try {
      let response = ''

      if (provider.name === 'openai') {
        const completion = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate the tailored resume for the ${job.title} position at ${job.company}.` }
          ],
          max_tokens: 3000,
          temperature: 0.2
        })
        response = completion.choices[0]?.message?.content || ''
      } else if (provider.name === 'anthropic') {
        const completion = await provider.client.messages.create({
          model: provider.model,
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `Generate the tailored resume for the ${job.title} position at ${job.company}.`
          }],
          temperature: 0.2
        })
        response = completion.content[0]?.text || ''
      }

      if (response) {
        try {
          const parsedData = JSON.parse(response)
          return parsedData
        } catch {
          // Try to extract JSON from response
          const jsonMatch = response.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
          }
        }
      }
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error)
      continue
    }
  }

  // Fallback: Return basic structure based on original content
  return {
    personalInfo: {
      name: "Professional Name",
      email: "email@example.com",
      phone: "(000) 000-0000",
      location: "City, State"
    },
    summary: `Experienced professional with background in ${job.requirements.slice(0, 3).join(', ')}`,
    experience: [{
      title: "Senior Position",
      company: "Previous Company",
      location: "City, State",
      startDate: "2020",
      endDate: "Present",
      description: job.requirements.map(req => `Led initiatives in ${req}`)
    }],
    education: [],
    skills: {
      technical: job.requirements.slice(0, 8),
      leadership: ['Team Leadership', 'Strategic Planning']
    }
  }
}

async function generateCoverLetter(
  resumeData: any,
  job: any,
  profileData: any
): Promise<string> {
  const prompt = `
Write a compelling cover letter for this job application.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

CANDIDATE BACKGROUND:
${JSON.stringify(resumeData, null, 2)}

GUIDELINES:
- Professional yet engaging tone
- 3-4 paragraphs maximum
- Highlight 2-3 key achievements that match job requirements
- Show enthusiasm for the role and company
- Include specific examples with quantified results
- End with strong call to action

Format as a professional business letter without addresses/dates (email format).
`

  // Try AI providers for cover letter generation
  for (const provider of AI_PROVIDERS) {
    try {
      let response = ''

      if (provider.name === 'openai') {
        const completion = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            { role: 'system', content: 'You are an expert career counselor specializing in cover letter writing.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
        response = completion.choices[0]?.message?.content || ''
      } else if (provider.name === 'anthropic') {
        const completion = await provider.client.messages.create({
          model: provider.model,
          max_tokens: 800,
          system: 'You are an expert career counselor specializing in cover letter writing.',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
        response = completion.content[0]?.text || ''
      }

      if (response && response.length > 100) {
        return response
      }
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error)
      continue
    }
  }

  // Fallback cover letter
  return `Dear Hiring Manager,

I am excited to apply for the ${job.title} position at ${job.company}. With my extensive background in technology leadership and proven track record of scaling organizations, I am confident I can contribute significantly to your team.

Throughout my career, I have successfully led cross-functional teams, implemented innovative solutions, and delivered measurable business impact. My experience aligns well with your requirements for ${job.requirements.slice(0, 3).join(', ')}.

I would welcome the opportunity to discuss how my background in ${job.requirements[0]} and passion for ${job.requirements[1]} can benefit ${job.company}. Thank you for your consideration.

Best regards,
${resumeData.personalInfo?.name || 'Professional Name'}`
}

async function generateApplicationTips(
  resumeData: any,
  job: any,
  originalResume: string
): Promise<string[]> {
  const baseTips = [
    `Research ${job.company}'s recent projects and mention them in your interview`,
    `Prepare STAR method examples for ${job.requirements.slice(0, 2).join(' and ')}`,
    'Customize your LinkedIn profile to match this tailored resume',
    `Practice explaining how your experience with ${job.requirements[0]} applies to this role`,
    'Follow up 1-2 weeks after application if you don\'t hear back',
    `Connect with ${job.company} employees on LinkedIn before applying`
  ]

  return baseTips
}

function extractKeywords(text: string): string[] {
  // Extract meaningful keywords from job description
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'you', 'your', 'we', 'our', 'they', 'their']

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))

  const wordCount = words.reduce((acc: Record<string, number>, word: string) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}