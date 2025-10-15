import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  salary?: string
  description: string
  url: string
  source: string
  postedDate: string
  relevanceScore?: number
  matchReasons?: string[]
}

interface JobSearchParams {
  keywords: string
  location?: string
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
  companies?: string[]
  excludeCompanies?: string[]
}

// Rate limiting tracking
let jsearchRequestCount = 0
let glassdoorRequestCount = 0

// JSearch API integration - DISABLED (subscription required for both keys)
async function searchJSearch(params: JobSearchParams): Promise<JobListing[]> {
  console.log('JSearch API disabled - both direct and RapidAPI keys require subscription')
  return []
}

// RemoteOK API integration
async function searchRemoteOK(params: JobSearchParams): Promise<JobListing[]> {
  try {
    const response = await fetch('https://remoteok.io/api')
    const data = await response.json()

    if (!Array.isArray(data)) return []

    // Filter by keywords and exclude the first item (usually metadata)
    const jobs = data.slice(1).filter((job: any) => {
      if (!job.position) return false
      const keywords = params.keywords.toLowerCase()
      const searchText = `${job.position} ${job.company} ${job.description || ''}`.toLowerCase()
      return searchText.includes(keywords) ||
             keywords.split(' ').some(keyword => searchText.includes(keyword))
    })

    return jobs.slice(0, 10).map((job: any) => ({
      id: `remoteok-${job.id}`,
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      remote: true,
      salary: job.salary_min && job.salary_max ?
        `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k` :
        undefined,
      description: job.description || '',
      url: `https://remoteok.io/remote-jobs/${job.id}`,
      source: 'RemoteOK',
      postedDate: new Date(job.date).toISOString()
    }))
  } catch (error) {
    console.error('RemoteOK API error:', error)
    return []
  }
}

// Apify API integration - DISABLED (no successful actor runs found)
async function searchApify(params: JobSearchParams): Promise<JobListing[]> {
  console.log('Apify API disabled - no successful recent runs available')
  return []
}

// Fantastic Jobs API integration - DISABLED (API endpoint returns 404)
async function searchFantasticJobs(params: JobSearchParams): Promise<JobListing[]> {
  console.log('Fantastic Jobs API disabled - endpoint returns 404')
  return []
}

// Adzuna API integration
async function searchAdzuna(params: JobSearchParams): Promise<JobListing[]> {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    console.log('Adzuna API credentials not configured')
    return []
  }

  try {
    const searchParams = new URLSearchParams({
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      what: params.keywords,
      where: params.location || 'United States',
      results_per_page: '20',
      distance: '50'
    })

    const response = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?${searchParams}`)
    const data = await response.json()

    if (!data.results) return []

    return data.results.map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Location not specified',
      remote: job.title.toLowerCase().includes('remote') || job.description.toLowerCase().includes('remote'),
      salary: job.salary_min && job.salary_max ? `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k` : undefined,
      description: job.description,
      url: job.redirect_url,
      source: 'Adzuna',
      postedDate: job.created
    }))
  } catch (error) {
    console.error('Adzuna API error:', error)
    return []
  }
}

// Greenhouse API integration - Discovery mode
async function searchGreenhouse(params: JobSearchParams): Promise<JobListing[]> {
  // Use common tech company greenhouse boards - but this is just a sample
  // In practice, we'd want to discover these dynamically
  const knownBoards = [
    'databricks', 'snowflake', 'airbnb', 'stripe', 'openai', 'anthropic',
    'cisco', 'nvidia', 'microsoft', 'google', 'meta', 'amazon', 'apple',
    'uber', 'lyft', 'square', 'zoom', 'slack', 'figma', 'notion', 'coinbase',
    'dropbox', 'twilio', 'github', 'atlassian', 'salesforce', 'mongodb',
    'elastic', 'docker', 'hashicorp', 'datadog', 'pagerduty', 'segment'
  ]

  const jobs: JobListing[] = []

  // Sample from known boards, but filter by keywords after fetching
  const sampleBoards = knownBoards.slice(0, 10) // Limit to avoid too many requests

  for (const company of sampleBoards) {
    try {
      const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs`)
      const data = await response.json()

      if (data.jobs) {
        const filteredJobs = data.jobs.filter((job: any) => {
          const keywords = params.keywords.toLowerCase()
          const searchText = `${job.title} ${job.content || ''}`.toLowerCase()
          return searchText.includes(keywords) ||
                 keywords.split(' ').some(keyword => searchText.includes(keyword))
        })

        const companyJobs = filteredJobs.map((job: any) => ({
          id: `greenhouse-${job.id}`,
          title: job.title,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.name || 'Location not specified',
          remote: job.title.toLowerCase().includes('remote') ||
                 job.location?.name?.toLowerCase().includes('remote') ||
                 job.content?.toLowerCase().includes('remote'),
          description: job.content || '',
          url: job.absolute_url,
          source: 'Greenhouse',
          postedDate: job.updated_at
        }))
        jobs.push(...companyJobs.slice(0, 3)) // Limit per company
      }
    } catch (error) {
      console.error(`Greenhouse API error for ${company}:`, error)
    }
  }

  return jobs.slice(0, 15) // Overall limit
}

// Lever API integration - Discovery mode
async function searchLever(params: JobSearchParams): Promise<JobListing[]> {
  const knownLeverCompanies = [
    'netflix', 'uber', 'lyft', 'square', 'zoom', 'slack', 'figma', 'notion',
    'coinbase', 'robinhood', 'palantir', 'postmates', 'canva', 'reddit',
    'box', 'cloudflare', 'mixpanel', 'affirm', 'plaid', 'compass'
  ]

  const jobs: JobListing[] = []
  const sampleCompanies = knownLeverCompanies.slice(0, 8) // Limit requests

  for (const company of sampleCompanies) {
    try {
      const response = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`)
      const data = await response.json()

      if (Array.isArray(data)) {
        const filteredJobs = data.filter((job: any) => {
          const keywords = params.keywords.toLowerCase()
          const searchText = `${job.text} ${job.description || ''}`.toLowerCase()
          return searchText.includes(keywords) ||
                 keywords.split(' ').some(keyword => searchText.includes(keyword))
        })

        const companyJobs = filteredJobs.map((job: any) => ({
          id: `lever-${job.id}`,
          title: job.text,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.categories?.location || 'Location not specified',
          remote: job.categories?.location?.toLowerCase().includes('remote') ||
                 job.text?.toLowerCase().includes('remote') ||
                 job.description?.toLowerCase().includes('remote'),
          description: job.description || '',
          url: job.hostedUrl,
          source: 'Lever',
          postedDate: job.createdAt
        }))
        jobs.push(...companyJobs.slice(0, 2)) // Limit per company
      }
    } catch (error) {
      console.error(`Lever API error for ${company}:`, error)
    }
  }

  return jobs.slice(0, 10) // Overall limit
}

// AI-powered job scoring
async function scoreJobs(jobs: JobListing[], userProfile: string): Promise<JobListing[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return jobs.map(job => ({ ...job, relevanceScore: 50 }))
  }

  const scoringPrompt = `You are an expert career advisor analyzing job opportunities for a senior technology executive.

USER PROFILE:
${userProfile}

JOBS TO SCORE:
${jobs.map((job, i) => `
${i + 1}. ${job.title} at ${job.company}
Location: ${job.location}
Description: ${job.description.substring(0, 500)}...
`).join('\n')}

For each job, provide a relevance score (1-100) and 2-3 key match reasons. Consider:
- Role seniority match
- Technical skills alignment
- Industry experience fit
- Company stage/culture fit
- Leadership scope match

Return ONLY a JSON array with this format:
[
  {
    "jobIndex": 0,
    "score": 85,
    "reasons": ["Matches senior data platform leadership experience", "Requires Snowflake/Databricks expertise", "Scaling team responsibilities align with background"]
  }
]`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: scoringPrompt
      }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    const scores = JSON.parse(responseText)

    return jobs.map((job, index) => {
      const scoring = scores.find((s: any) => s.jobIndex === index)
      return {
        ...job,
        relevanceScore: scoring?.score || 50,
        matchReasons: scoring?.reasons || []
      }
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

  } catch (error) {
    console.error('Job scoring error:', error)
    return jobs.map(job => ({ ...job, relevanceScore: 50 }))
  }
}

export async function POST(request: NextRequest) {
  try {
    const params: JobSearchParams = await request.json()

    if (!params.keywords) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    // User profile for AI scoring
    const userProfile = `Senior technology executive with 25+ years experience in data engineering, analytics, AI/ML, and cloud platforms. Currently Founder & AI Product Leader at Equiti Ventures. Previously Senior Director at Cisco, Global Head of Data at Dropbox. Expertise in scaling engineering teams (100+ people), building data platforms, and leading companies through IPO. Looking for C-level or senior leadership roles in technology, data, or AI companies.`

    // Aggregate jobs from multiple sources
    const [
      jsearchJobs,
      remoteOKJobs,
      apifyJobs,
      fantasticJobs,
      adzunaJobs,
      greehouseJobs,
      leverJobs
    ] = await Promise.all([
      searchJSearch(params),
      searchRemoteOK(params),
      searchApify(params),
      searchFantasticJobs(params),
      searchAdzuna(params),
      searchGreenhouse(params),
      searchLever(params)
    ])

    let allJobs = [...jsearchJobs, ...remoteOKJobs, ...apifyJobs, ...fantasticJobs, ...adzunaJobs, ...greehouseJobs, ...leverJobs]

    // Filter by criteria
    if (params.remote !== undefined) {
      allJobs = allJobs.filter(job => job.remote === params.remote)
    }

    if (params.companies?.length) {
      allJobs = allJobs.filter(job =>
        params.companies!.some(company =>
          job.company.toLowerCase().includes(company.toLowerCase())
        )
      )
    }

    if (params.excludeCompanies?.length) {
      allJobs = allJobs.filter(job =>
        !params.excludeCompanies!.some(company =>
          job.company.toLowerCase().includes(company.toLowerCase())
        )
      )
    }

    // Remove duplicates by URL
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex(j => j.url === job.url)
    )

    // Score jobs with AI
    const scoredJobs = await scoreJobs(uniqueJobs, userProfile)

    return NextResponse.json({
      jobs: scoredJobs,
      total: scoredJobs.length,
      sources: {
        jsearch: jsearchJobs.length,
        remoteok: remoteOKJobs.length,
        apify: apifyJobs.length,
        fantastic: fantasticJobs.length,
        adzuna: adzunaJobs.length,
        greenhouse: greehouseJobs.length,
        lever: leverJobs.length
      },
      apiUsage: {
        jsearch: {
          used: jsearchRequestCount,
          remaining: Math.max(0, 200 - jsearchRequestCount),
          limit: 200
        },
        glassdoor: {
          used: glassdoorRequestCount,
          remaining: Math.max(0, 100 - glassdoorRequestCount),
          limit: 100
        }
      }
    })

  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 })
  }
}