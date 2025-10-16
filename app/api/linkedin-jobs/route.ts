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
    const { keywords, location, remoteOnly, companies, excludeCompanies, timePeriod, maxResults = 200, radius = 25 } = await request.json()

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

    // Build search query - use simpler terms for better results
    let searchQuery = keywords || 'software engineer'
    if (companies && companies.length > 0) {
      searchQuery += ` ${companies.join(' OR ')}`
    }

    // Simple location handling for maximum job listings
    function enhanceLocationSearch(inputLocation: string, userRadius: number): { location_filter: string } {
      if (!inputLocation) return { location_filter: '' }
      return { location_filter: inputLocation }
    }

    const enhancedLocation = enhanceLocationSearch(location, radius)

    console.log('Search parameters:', {
      keywords,
      location,
      enhancedLocation,
      remoteOnly,
      companies,
      excludeCompanies,
      timePeriod,
      maxResults,
      finalSearchQuery: searchQuery
    })

    // Determine endpoint based on time period
    const endpointMap = {
      '1h': 'active-jb-1h',
      '24h': 'active-jb-24h',
      '7d': 'active-jb-7d'
    }
    const endpoint = endpointMap[timePeriod as keyof typeof endpointMap] || 'active-jb-7d'

    // Calculate pagination parameters
    const jobsPerPage = 100 // LinkedIn API returns max 100 jobs per request
    const totalPages = Math.ceil(maxResults / jobsPerPage)
    const pagesToFetch = Math.min(totalPages, 5) // Limit to 5 pages max to avoid hitting rate limits

    console.log(`Fetching ${pagesToFetch} pages (${jobsPerPage} jobs each) to get up to ${pagesToFetch * jobsPerPage} jobs`)

    // Prepare base API request parameters
    const url = `https://linkedin-job-search-api.p.rapidapi.com/${endpoint}`
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.LINKEDIN_RAPIDAPI_KEY,
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    }

    const baseParams = {
      description_type: 'text',
      order: 'desc', // Most recent jobs first
      include_ai: 'true', // Get AI-enhanced fields including better salary data
      ...(keywords && { title_filter: searchQuery }),
      ...(enhancedLocation.location_filter && { location_filter: enhancedLocation.location_filter }),
      // Note: distance parameter is not supported by this LinkedIn API
      ...(remoteOnly && { remote: 'true' }),
      // Add filters to get more relevant results
      type_filter: 'FULL_TIME,PART_TIME,CONTRACTOR', // Include multiple job types
      seniority_filter: 'Entry level,Mid-Senior level,Director,Executive', // Include all relevant levels
      employees_gte: '1', // Exclude very small companies (1+ employees)
      ai_experience_level_filter: '0-2,2-5,5-10,10+', // Include all experience levels
      // Enhanced AI filters for better results
      ai_work_arrangement_filter: 'On-site,Hybrid,Remote OK,Remote Solely', // All work arrangements
      directapply: 'false' // Exclude easy apply jobs which are often lower quality
    }

    // Fetch multiple pages of results
    const allJobs: any[] = []
    let totalFetched = 0

    for (let page = 0; page < pagesToFetch; page++) {
      const offset = page * jobsPerPage
      const params = new URLSearchParams({
        ...baseParams,
        offset: offset.toString()
      })

      const fullUrl = `${url}?${params.toString()}`
      console.log(`Page ${page + 1}/${pagesToFetch}: LinkedIn API Request with offset ${offset}`)

      try {
        const response = await fetch(fullUrl, options)
        console.log(`Page ${page + 1} response status:`, response.status)

        if (!response.ok) {
          console.error(`Page ${page + 1} API Error:`, response.statusText)
          continue // Skip this page but continue with others
        }

        const data = await response.json()
        const jobsArray = data.data || (Array.isArray(data) ? data : [])

        console.log(`Page ${page + 1} jobs received:`, jobsArray.length)

        if (jobsArray.length === 0) {
          console.log(`Page ${page + 1} returned no jobs, stopping pagination`)
          break // No more jobs available
        }

        allJobs.push(...jobsArray)
        totalFetched += jobsArray.length

        // Add small delay between requests to be respectful to the API
        if (page < pagesToFetch - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        console.error(`Error fetching page ${page + 1}:`, error)
        continue // Continue with next page
      }
    }

    console.log(`Total jobs fetched across ${pagesToFetch} pages:`, totalFetched)
    const jobsArray = allJobs

    const transformedJobs = jobsArray.map((job: any, index: number) => {
      console.log(`Processing job ${index}:`, {
        id: job.id,
        title: job.title,
        company: job.company || job.organization,
        hasDescription: !!job.description_text || !!job.description,
        salary: job.salary,
        salaryType: typeof job.salary,
        salary_raw: job.salary_raw,
        salaryRawType: typeof job.salary_raw
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
        salary: (() => {
          if (job.salary) {
            if (typeof job.salary === 'object') {
              // Handle LinkedIn's complex salary structure
              if (job.salary.value) {
                const val = job.salary.value
                if (val.minValue && val.maxValue) {
                  const currency = job.salary.currency || 'USD'
                  const unit = val.unitText || 'YEAR'
                  return `${currency} ${val.minValue.toLocaleString()}-${val.maxValue.toLocaleString()} per ${unit.toLowerCase()}`
                }
              }
              // Handle MonetaryAmount format: {"@type":"MonetaryAmount","currency":"USD","value":{"@type":"QuantitativeValue","minValue":10106,"maxValue":32441,"unitText":"YEAR"}}
              if (job.salary['@type'] === 'MonetaryAmount' && job.salary.value) {
                const val = job.salary.value
                if (val.minValue && val.maxValue) {
                  const currency = job.salary.currency || 'USD'
                  const unit = val.unitText || 'YEAR'
                  return `${currency} ${val.minValue.toLocaleString()}-${val.maxValue.toLocaleString()} per ${unit.toLowerCase()}`
                }
              }
              if (job.salary.base) {
                return job.salary.base
              }
              if (job.salary.total) {
                return job.salary.total
              }
              return JSON.stringify(job.salary)
            } else if (typeof job.salary === 'string') {
              // Try to parse stringified JSON salary objects
              if (job.salary.startsWith('{') && job.salary.includes('@type')) {
                try {
                  const parsed = JSON.parse(job.salary)
                  if (parsed['@type'] === 'MonetaryAmount' && parsed.value) {
                    const val = parsed.value
                    if (val.minValue && val.maxValue) {
                      const currency = parsed.currency || 'USD'
                      const unit = val.unitText || 'YEAR'
                      return `${currency} ${val.minValue.toLocaleString()}-${val.maxValue.toLocaleString()} per ${unit.toLowerCase()}`
                    }
                  }
                } catch (e) {
                  // If JSON parsing fails, return original string
                }
              }
              return job.salary
            } else {
              return String(job.salary)
            }
          } else if (job.salary_raw) {
            if (typeof job.salary_raw === 'object') {
              // Handle MonetaryAmount format in salary_raw field
              if (job.salary_raw['@type'] === 'MonetaryAmount' && job.salary_raw.value) {
                const val = job.salary_raw.value
                if (val.minValue && val.maxValue) {
                  const currency = job.salary_raw.currency || 'USD'
                  const unit = val.unitText || 'YEAR'
                  return `${currency} ${val.minValue.toLocaleString()}-${val.maxValue.toLocaleString()} per ${unit.toLowerCase()}`
                }
              }
              return JSON.stringify(job.salary_raw)
            } else {
              return String(job.salary_raw)
            }
          }

          // Extract salary from description as fallback
          const description = job.description_text || job.description || ''
          const salaryMatch = description.match(/\$[\d,]+(?:\s*-\s*\$?[\d,]+)?(?:\s*(?:per\s+year|annually|\/year))?/i)
          if (salaryMatch) {
            return salaryMatch[0]
          }

          return undefined
        })(),
        description: (() => {
          const rawDescription = job.description_text || job.description || job.summary || 'No description available'

          // Format the description for better readability
          return rawDescription
            .replace(/\n\n+/g, '\n\n') // Normalize multiple line breaks
            .replace(/([A-Z][a-z\s]+:?)(?=\n|\r)/g, '\n**$1**\n') // Bold section headers
            .replace(/(\n|^)([A-Z][A-Za-z\s&/(),-]+)\n\n/g, '\n## $2\n\n') // Convert major sections to h2
            .replace(/Job Description\n\n/g, '') // Remove redundant "Job Description" header
            .replace(/\n(Required Qualifications|Preferred Qualifications|Who You Are|Your Impact|About [A-Z][A-Za-z\s]+|Benefits|Compensation|Notice To Third Party Agencies)\n/g, '\n\n## $1\n\n') // Format major sections
            .replace(/\n([A-Z][A-Za-z\s&]+)\n\n(?=[A-Z])/g, '\n\n### $1\n\n') // Format subsections
            .replace(/\n\n\n+/g, '\n\n') // Clean up excessive line breaks
            .trim()
        })(),
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
          try {
            // Try to stringify and use meaningful content
            const stringified = JSON.stringify(value)
            if (stringified && stringified !== '{}') {
              ;(transformedJob as any)[key] = stringified
            } else {
              ;(transformedJob as any)[key] = '[object Object]'
            }
          } catch (e) {
            ;(transformedJob as any)[key] = '[object Object]'
          }
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

    // Limit to maxResults if we fetched more than requested
    const finalJobs = filteredJobs.slice(0, maxResults)

    console.log('Final filtered jobs count:', filteredJobs.length)
    console.log('Jobs after maxResults limit:', finalJobs.length)
    console.log('Returning response...')

    return NextResponse.json({
      jobs: finalJobs,
      total: finalJobs.length,
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