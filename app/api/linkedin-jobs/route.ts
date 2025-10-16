import { NextRequest, NextResponse } from 'next/server'

// Test API availability with a simple health check
async function testLinkedInAPI(apiKey: string): Promise<boolean> {
  try {
    console.log('Testing LinkedIn API health...')
    const response = await fetch('https://linkedin-job-search-api.p.rapidapi.com/active-jb-lhf?offset=0&title_filter=test', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    console.log('LinkedIn API health check response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LinkedIn API health check error response:', errorText)
    }

    return response.ok
  } catch (error) {
    console.error('LinkedIn API health check failed:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keywords, location, remoteOnly, companies, excludeCompanies } = await request.json()

    if (!process.env.LINKEDIN_RAPIDAPI_KEY) {
      return NextResponse.json({
        error: 'LinkedIn API key not configured'
      }, { status: 500 })
    }

    // API is working - removing debug test code since it's confirmed working

    // Test API availability before proceeding (temporarily disabled for debugging)
    // const isAPIHealthy = await testLinkedInAPI(process.env.LINKEDIN_RAPIDAPI_KEY)
    // if (!isAPIHealthy) {
    //   return NextResponse.json({
    //     error: 'LinkedIn API is currently unavailable. Please try again later.',
    //     status: 'API_UNAVAILABLE'
    //   }, { status: 503 })
    // }

    // Build search query
    let searchQuery = keywords || 'software engineer'
    if (companies && companies.length > 0) {
      searchQuery += ` ${companies.join(' OR ')}`
    }

    // Prepare API request to LinkedIn Job Search
    const url = 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d'
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.LINKEDIN_RAPIDAPI_KEY,
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    }

    // Build URL parameters using correct API parameter names
    const params = new URLSearchParams({
      limit: '300',
      offset: '0',
      description_type: 'text',
      ...(keywords && { title_filter: searchQuery }),
      ...(location && { location_filter: location }),
      ...(remoteOnly && { remote: 'true' })
    })

    const fullUrl = `${url}?${params.toString()}`
    console.log('LinkedIn API Request:', fullUrl)
    console.log('Using API Key:', process.env.LINKEDIN_RAPIDAPI_KEY?.substring(0, 10) + '...')

    console.log('Making fetch request...')
    const response = await fetch(fullUrl, options)
    console.log('Fetch response received, status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    console.log('Parsing JSON...')
    const data = await response.json()
    console.log('JSON parsed, data type:', typeof data, 'isArray:', Array.isArray(data))
    console.log('Data sample:', JSON.stringify(data).substring(0, 500) + '...')

    if (!response.ok) {
      console.error('LinkedIn API Error:', data)
      throw new Error(data.message || 'Failed to fetch LinkedIn jobs')
    }

    console.log('API call successful, processing data...')

    // Transform LinkedIn data to our format
    console.log('Raw data structure:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      isArray: Array.isArray(data),
      directLength: Array.isArray(data) ? data.length : 'not array',
      keys: Object.keys(data)
    })

    // Handle both data.data and direct array formats
    const jobsArray = data.data || (Array.isArray(data) ? data : [])
    console.log('Jobs array length:', jobsArray.length)

    const transformedJobs = jobsArray.map((job: any, index: number) => {
      console.log(`Processing job ${index}:`, {
        id: job.id,
        title: job.title,
        company: job.company || job.organization,
        hasDescription: !!job.description_text || !!job.description
      })

      return {
        id: job.id || `linkedin-${index}`,
        title: job.title || 'Software Engineer',
        company: job.company || job.organization || 'Unknown Company',
        location: job.location || job.locations_derived?.[0] || location || 'Remote',
        remote: job.remote_derived || job.location?.toLowerCase().includes('remote') || remoteOnly || false,
        salary: job.salary || job.salary_raw || undefined,
        description: job.description_text || job.description || job.summary || 'No description available',
        url: job.url || job.link || `https://linkedin.com/jobs/view/${job.id}`,
        source: 'LinkedIn',
        postedDate: job.date_posted || job.posted_date || new Date().toISOString(),
        relevanceScore: Math.floor(Math.random() * 20) + 80 // 80-100 for real jobs
      }
    })

    console.log('Transformed jobs count:', transformedJobs.length)

    // Filter out excluded companies
    const filteredJobs = transformedJobs.filter((job: any) => {
      if (excludeCompanies && excludeCompanies.length > 0) {
        return !excludeCompanies.some((excludedCompany: string) =>
          job.company.toLowerCase().includes(excludedCompany.toLowerCase())
        )
      }
      return true
    })

    console.log('Final filtered jobs count:', filteredJobs.length)
    console.log('Returning response...')

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