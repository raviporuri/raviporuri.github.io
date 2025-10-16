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
    const { keywords, location, remoteOnly, companies, excludeCompanies, timePeriod } = await request.json()

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

    // Determine endpoint based on time period
    const endpointMap = {
      '1h': 'active-jb-1h',
      '24h': 'active-jb-24h',
      '7d': 'active-jb-7d'
    }
    const endpoint = endpointMap[timePeriod as keyof typeof endpointMap] || 'active-jb-7d'

    // Prepare API request to LinkedIn Job Search
    const url = `https://linkedin-job-search-api.p.rapidapi.com/${endpoint}`
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.LINKEDIN_RAPIDAPI_KEY,
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    }

    // Build URL parameters using correct API parameter names (removed limits as requested)
    const params = new URLSearchParams({
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

      // Extract clean location string
      let jobLocation = location || 'Remote'
      if (job.location && typeof job.location === 'string') {
        jobLocation = job.location
      } else if (job.locations_derived && Array.isArray(job.locations_derived) && job.locations_derived[0]) {
        jobLocation = job.locations_derived[0]
      } else if (job.locations_raw && Array.isArray(job.locations_raw) && job.locations_raw[0]?.address?.addressLocality) {
        jobLocation = job.locations_raw[0].address.addressLocality
      }

      // Ensure all fields are strings/primitives, not objects
      const transformedJob = {
        id: String(job.id || `linkedin-${index}`),
        title: String(job.title || 'Software Engineer'),
        company: String(job.company || job.organization || 'Unknown Company'),
        location: String(jobLocation),
        remote: Boolean(job.remote_derived || job.location?.toLowerCase().includes('remote') || remoteOnly || false),
        salary: job.salary ? String(job.salary) : (job.salary_raw ? String(job.salary_raw) : undefined),
        description: String(job.description_text || job.description || job.summary || 'No description available'),
        url: String(job.url || job.link || `https://linkedin.com/jobs/view/${job.id}`),
        source: 'LinkedIn',
        postedDate: String(job.date_posted || job.posted_date || new Date().toISOString()),
        relevanceScore: Math.floor(Math.random() * 20) + 80, // 80-100 for real jobs
        matchReasons: [] // Initialize as empty array to prevent undefined errors
      }

      // Additional safety check - convert any remaining objects to strings
      Object.keys(transformedJob).forEach(key => {
        const value = transformedJob[key as keyof typeof transformedJob]
        if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
          console.warn(`Converting object field ${key} to string:`, value)
          ;(transformedJob as any)[key] = String(value)
        }
      })

      return transformedJob
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