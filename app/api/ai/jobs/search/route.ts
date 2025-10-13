import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { ratelimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { jobSearches, jobMatches } from '@/lib/db/schema'
import { masterProfileData } from '@/lib/data/master-profile'
import { z } from 'zod'
import { withErrorHandling } from '@/lib/utils/error-handling'
import { logAIUsage } from '@/lib/utils/analytics'
import { extractTextFromFile } from '@/lib/utils/file-processing'

const JobSearchSchema = z.object({
  keywords: z.string().min(3),
  location: z.string().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'any']).default('any'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive', 'any']).default('any'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  remote: z.boolean().default(false),
  industry: z.string().optional(),
  company: z.string().optional()
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

// Mock job sources - in production, integrate with real APIs
const JOB_SOURCES = {
  indeed: process.env.INDEED_API_KEY,
  linkedin: process.env.LINKEDIN_API_KEY,
  greenhouse: process.env.GREENHOUSE_API_KEY,
  lever: process.env.LEVER_API_KEY
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
    const searchParamsString = formData.get('searchParams') as string
    const filtersString = formData.get('filters') as string
    const resumeFile = formData.get('resume') as File | null

    const searchParams = JSON.parse(searchParamsString)
    const filters = JSON.parse(filtersString)

    // Validate search parameters
    const validatedSearch = JobSearchSchema.parse(searchParams)

    // Get user session
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'anonymous'

    // Extract resume content if provided
    let resumeContent = ''
    if (resumeFile) {
      resumeContent = await extractTextFromFile(resumeFile)
    }

    // Search for jobs from multiple sources
    const jobs = await searchJobsFromSources(validatedSearch, resumeContent)

    // Analyze job matches using AI
    const analyzedJobs = await analyzeJobMatches(jobs, resumeContent, validatedSearch)

    // Apply filters and sorting
    const filteredJobs = applyFiltersAndSorting(analyzedJobs, filters)

    // Calculate search statistics
    const stats = calculateSearchStats(filteredJobs)

    // Save search to database (if authenticated)
    if (userId !== 'anonymous') {
      const searchRecord = {
        id: crypto.randomUUID(),
        userId,
        searchParams: validatedSearch,
        resultsCount: filteredJobs.length,
        filters,
        createdAt: new Date()
      }

      await db.insert(jobSearches).values(searchRecord)
    }

    // Log AI usage
    await logAIUsage({
      userId,
      provider: 'multiple',
      model: 'job-matching',
      tokensUsed: resumeContent.length / 4,
      context: 'job-search',
      success: true
    })

    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      stats,
      searchId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function searchJobsFromSources(searchParams: any, resumeContent: string) {
  // Mock job data - in production, integrate with real job APIs
  const mockJobs = [
    {
      id: '1',
      title: 'Senior AI/ML Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$180,000 - $250,000',
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
      ],
      postedDate: '2 days ago',
      source: 'LinkedIn',
      url: 'https://linkedin.com/jobs/123',
      remote: true
    },
    {
      id: '2',
      title: 'VP of Engineering',
      company: 'GrowthTech',
      location: 'New York, NY',
      salary: '$300,000 - $450,000',
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
      ],
      postedDate: '1 day ago',
      source: 'Indeed',
      url: 'https://indeed.com/jobs/456',
      remote: false
    },
    {
      id: '3',
      title: 'Principal Data Architect',
      company: 'DataFlow Inc',
      location: 'Seattle, WA',
      salary: '$200,000 - $280,000',
      description: `Join our team as a Principal Data Architect to design and implement enterprise-scale data platforms. You will work on cutting-edge data technologies and drive the technical direction for our data infrastructure.

      Key Responsibilities:
      - Design scalable data architectures and pipelines
      - Lead data platform strategy and implementation
      - Work with petabyte-scale data processing
      - Mentor data engineering teams
      - Drive adoption of best practices and new technologies

      Required Skills:
      - 10+ years of data engineering and architecture experience
      - Expert knowledge of big data technologies (Spark, Kafka, Hadoop)
      - Strong experience with cloud data platforms
      - Experience with real-time streaming and batch processing
      - Leadership and mentoring experience`,
      requirements: [
        'Data Architecture',
        'Big Data',
        'Apache Spark',
        'Kafka',
        'Cloud Platforms',
        'Real-time Processing',
        'Leadership',
        'Mentoring'
      ],
      postedDate: '3 days ago',
      source: 'Greenhouse',
      url: 'https://boards.greenhouse.io/dataflow/789',
      remote: true
    },
    {
      id: '4',
      title: 'AI Product Manager',
      company: 'InnovateAI',
      location: 'Austin, TX',
      salary: '$150,000 - $220,000',
      description: `We're seeking an AI Product Manager to drive the development of our AI-powered products. You'll work closely with engineering, data science, and business teams to deliver innovative AI solutions.

      Key Responsibilities:
      - Define product strategy for AI-powered features
      - Work with data scientists and ML engineers
      - Analyze market trends and customer needs
      - Drive product roadmap and prioritization
      - Collaborate with cross-functional teams

      Required Experience:
      - 5+ years of product management experience
      - Strong understanding of AI/ML technologies
      - Experience with data-driven product decisions
      - B2B or B2C product experience
      - Excellent communication and analytical skills`,
      requirements: [
        'Product Management',
        'AI/ML Understanding',
        'Data Analysis',
        'Roadmap Planning',
        'Cross-functional Collaboration',
        'Market Analysis',
        'Communication',
        'Analytics'
      ],
      postedDate: '5 days ago',
      source: 'Lever',
      url: 'https://jobs.lever.co/innovateai/101',
      remote: true
    }
  ]

  // Filter jobs based on search criteria
  let filteredJobs = mockJobs.filter(job => {
    const titleMatch = job.title.toLowerCase().includes(searchParams.keywords.toLowerCase())
    const descriptionMatch = job.description.toLowerCase().includes(searchParams.keywords.toLowerCase())
    const keywordMatch = titleMatch || descriptionMatch

    const locationMatch = !searchParams.location ||
      job.location.toLowerCase().includes(searchParams.location.toLowerCase()) ||
      (searchParams.remote && job.remote)

    return keywordMatch && locationMatch
  })

  return filteredJobs
}

async function analyzeJobMatches(jobs: any[], resumeContent: string, searchParams: any) {
  if (!resumeContent) {
    // If no resume provided, return jobs with basic scoring
    return jobs.map(job => ({
      ...job,
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
      keywordMatches: job.requirements.slice(0, 5),
      missingSkills: job.requirements.slice(5)
    }))
  }

  const analyzedJobs = []

  for (const job of jobs) {
    try {
      // Use AI to analyze job match
      const matchAnalysis = await analyzeJobMatch(job, resumeContent, searchParams)
      analyzedJobs.push({
        ...job,
        ...matchAnalysis
      })
    } catch (error) {
      console.error(`Failed to analyze job ${job.id}:`, error)
      // Fallback to basic scoring
      analyzedJobs.push({
        ...job,
        matchScore: 75,
        keywordMatches: job.requirements.slice(0, 3),
        missingSkills: job.requirements.slice(3)
      })
    }
  }

  return analyzedJobs
}

async function analyzeJobMatch(job: any, resumeContent: string, searchParams: any) {
  const prompt = `
  Analyze the match between this job posting and the candidate's resume.

  JOB POSTING:
  Title: ${job.title}
  Company: ${job.company}
  Description: ${job.description}
  Required Skills: ${job.requirements.join(', ')}

  CANDIDATE RESUME:
  ${resumeContent}

  ANALYSIS REQUIREMENTS:
  1. Calculate match score (0-100) based on:
     - Skills alignment
     - Experience level fit
     - Industry relevance
     - Role progression logic

  2. Identify matching keywords/skills from the job requirements
  3. Identify skills the candidate should emphasize
  4. Consider the candidate's ${searchParams.experienceLevel} level preference

  Return JSON format:
  {
    "matchScore": number,
    "keywordMatches": string[],
    "missingSkills": string[],
    "reasoning": "Brief explanation of the match score",
    "recommendedEmphasis": string[]
  }
  `

  // Try AI providers for analysis
  for (const provider of AI_PROVIDERS) {
    try {
      let response = ''

      if (provider.name === 'openai') {
        const completion = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            { role: 'system', content: 'You are an expert career counselor and job matching specialist.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
        response = completion.choices[0]?.message?.content || ''
      } else if (provider.name === 'anthropic') {
        const completion = await provider.client.messages.create({
          model: provider.model,
          max_tokens: 1000,
          system: 'You are an expert career counselor and job matching specialist.',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
        response = completion.content[0]?.text || ''
      }

      if (response) {
        const analysis = JSON.parse(response)
        return {
          matchScore: Math.min(100, Math.max(0, analysis.matchScore)),
          keywordMatches: analysis.keywordMatches || [],
          missingSkills: analysis.missingSkills || [],
          reasoning: analysis.reasoning || '',
          recommendedEmphasis: analysis.recommendedEmphasis || []
        }
      }
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error)
      continue
    }
  }

  // Fallback analysis
  return {
    matchScore: 75,
    keywordMatches: job.requirements.slice(0, 4),
    missingSkills: job.requirements.slice(4),
    reasoning: 'Basic keyword matching analysis',
    recommendedEmphasis: []
  }
}

function applyFiltersAndSorting(jobs: any[], filters: any) {
  let filteredJobs = [...jobs]

  // Apply minimum match score filter
  if (filters.minMatchScore) {
    filteredJobs = filteredJobs.filter(job => job.matchScore >= filters.minMatchScore)
  }

  // Apply sorting
  filteredJobs.sort((a, b) => {
    switch (filters.sortBy) {
      case 'match-score':
        return b.matchScore - a.matchScore
      case 'date':
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      case 'salary':
        const aSalary = extractSalaryNumber(a.salary)
        const bSalary = extractSalaryNumber(b.salary)
        return bSalary - aSalary
      case 'relevance':
      default:
        // Sort by combination of match score and keyword matches
        const aScore = a.matchScore + (a.keywordMatches.length * 2)
        const bScore = b.matchScore + (b.keywordMatches.length * 2)
        return bScore - aScore
    }
  })

  return filteredJobs
}

function extractSalaryNumber(salaryString?: string): number {
  if (!salaryString) return 0

  const matches = salaryString.match(/\$[\d,]+/g)
  if (!matches || matches.length === 0) return 0

  // Take the higher number if it's a range
  const numbers = matches.map(match =>
    parseInt(match.replace(/[$,]/g, ''))
  )

  return Math.max(...numbers)
}

function calculateSearchStats(jobs: any[]) {
  const totalJobs = jobs.length
  const highMatch = jobs.filter(job => job.matchScore >= 90).length
  const goodMatch = jobs.filter(job => job.matchScore >= 70 && job.matchScore < 90).length

  const salaries = jobs
    .map(job => extractSalaryNumber(job.salary))
    .filter(salary => salary > 0)

  const averageSalary = salaries.length > 0
    ? `$${Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length).toLocaleString()}`
    : 'Not available'

  return {
    totalJobs,
    highMatch,
    goodMatch,
    averageSalary,
    searchTime: new Date().toISOString()
  }
}