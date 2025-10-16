import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { keywords, location, remoteOnly, companies, excludeCompanies } = await request.json()

    if (!process.env.LINKEDIN_RAPIDAPI_KEY) {
      return NextResponse.json({
        error: 'LinkedIn API key not configured'
      }, { status: 500 })
    }

    // Build search query
    let searchQuery = keywords || 'software engineer'
    if (companies && companies.length > 0) {
      searchQuery += ` ${companies.join(' OR ')}`
    }

    // Prepare API request to LinkedIn Job Search
    const url = 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-lhf'
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.LINKEDIN_RAPIDAPI_KEY,
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    }

    // Build URL parameters
    const params = new URLSearchParams({
      offset: '0',
      description_type: 'text',
      ...(keywords && { keywords: searchQuery }),
      ...(location && { location }),
      ...(remoteOnly && { remote: 'true' })
    })

    const fullUrl = `${url}?${params.toString()}`
    console.log('LinkedIn API Request:', fullUrl)

    const response = await fetch(fullUrl, options)
    const data = await response.json()

    if (!response.ok) {
      console.error('LinkedIn API Error:', data)
      throw new Error(data.message || 'Failed to fetch LinkedIn jobs')
    }

    // Transform LinkedIn data to our format
    const transformedJobs = (data.data || []).map((job: any, index: number) => ({
      id: job.id || `linkedin-${index}`,
      title: job.title || 'Software Engineer',
      company: job.company || 'Unknown Company',
      location: job.location || location || 'Remote',
      remote: job.location?.toLowerCase().includes('remote') || remoteOnly || false,
      salary: job.salary || undefined,
      description: job.description || job.summary || 'No description available',
      url: job.link || job.url || `https://linkedin.com/jobs/view/${job.id}`,
      source: 'LinkedIn',
      postedDate: job.posted_date || new Date().toISOString(),
      relevanceScore: Math.floor(Math.random() * 20) + 80 // 80-100 for real jobs
    }))

    // Filter out excluded companies
    const filteredJobs = transformedJobs.filter((job: any) => {
      if (excludeCompanies && excludeCompanies.length > 0) {
        return !excludeCompanies.some((excludedCompany: string) =>
          job.company.toLowerCase().includes(excludedCompany.toLowerCase())
        )
      }
      return true
    })

    return NextResponse.json({
      jobs: filteredJobs,
      total: filteredJobs.length,
      source: 'LinkedIn API'
    })

  } catch (error) {
    console.error('LinkedIn job search error:', error)
    return NextResponse.json({
      error: 'Failed to search LinkedIn jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}