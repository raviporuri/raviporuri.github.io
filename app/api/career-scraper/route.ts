import { NextRequest, NextResponse } from 'next/server'

interface CompanyCareerSite {
  name: string
  domain: string
  careersUrl: string
  atsType?: string
  lastScraped?: string
}

interface ScrapedJob {
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
  atsType?: string
}

// Major company career sites to scrape
const COMPANY_CAREER_SITES: CompanyCareerSite[] = [
  // Tech Giants
  { name: 'Google', domain: 'google.com', careersUrl: 'https://careers.google.com/jobs/results/', atsType: 'custom' },
  { name: 'Microsoft', domain: 'microsoft.com', careersUrl: 'https://careers.microsoft.com/v2/global/en/search', atsType: 'custom' },
  { name: 'Amazon', domain: 'amazon.com', careersUrl: 'https://www.amazon.jobs/en/search', atsType: 'custom' },
  { name: 'Meta', domain: 'meta.com', careersUrl: 'https://www.metacareers.com/jobs/', atsType: 'custom' },
  { name: 'Apple', domain: 'apple.com', careersUrl: 'https://jobs.apple.com/en-us/search', atsType: 'custom' },
  { name: 'Netflix', domain: 'netflix.com', careersUrl: 'https://jobs.netflix.com/search', atsType: 'custom' },

  // Unicorns & High-Growth
  { name: 'Stripe', domain: 'stripe.com', careersUrl: 'https://stripe.com/jobs/search', atsType: 'greenhouse' },
  { name: 'OpenAI', domain: 'openai.com', careersUrl: 'https://openai.com/careers/search', atsType: 'greenhouse' },
  { name: 'Anthropic', domain: 'anthropic.com', careersUrl: 'https://www.anthropic.com/careers', atsType: 'greenhouse' },
  { name: 'Databricks', domain: 'databricks.com', careersUrl: 'https://www.databricks.com/company/careers/open-positions', atsType: 'greenhouse' },
  { name: 'Snowflake', domain: 'snowflake.com', careersUrl: 'https://careers.snowflake.com/us/en/search-results', atsType: 'workday' },
  { name: 'Palantir', domain: 'palantir.com', careersUrl: 'https://www.palantir.com/careers/', atsType: 'lever' },
  { name: 'Uber', domain: 'uber.com', careersUrl: 'https://www.uber.com/careers/list/', atsType: 'lever' },
  { name: 'Airbnb', domain: 'airbnb.com', careersUrl: 'https://careers.airbnb.com/positions/', atsType: 'greenhouse' },

  // Financial Services
  { name: 'Goldman Sachs', domain: 'goldmansachs.com', careersUrl: 'https://www.goldmansachs.com/careers/students-and-graduates/programs/', atsType: 'workday' },
  { name: 'JPMorgan Chase', domain: 'jpmorganchase.com', careersUrl: 'https://careers.jpmorgan.com/global/en/students/programs', atsType: 'workday' },
  { name: 'Coinbase', domain: 'coinbase.com', careersUrl: 'https://www.coinbase.com/careers/positions', atsType: 'greenhouse' },

  // Enterprise Software
  { name: 'Salesforce', domain: 'salesforce.com', careersUrl: 'https://careers.salesforce.com/jobs/search', atsType: 'workday' },
  { name: 'Oracle', domain: 'oracle.com', careersUrl: 'https://www.oracle.com/careers/job-search/', atsType: 'taleo' },
  { name: 'SAP', domain: 'sap.com', careersUrl: 'https://jobs.sap.com/search/', atsType: 'successfactors' },
  { name: 'Adobe', domain: 'adobe.com', careersUrl: 'https://careers.adobe.com/us/en/search-results', atsType: 'workday' },
  { name: 'Atlassian', domain: 'atlassian.com', careersUrl: 'https://www.atlassian.com/company/careers/all-jobs', atsType: 'greenhouse' },

  // Cloud & Infrastructure
  { name: 'AWS', domain: 'aws.amazon.com', careersUrl: 'https://www.amazon.jobs/en/teams/aws', atsType: 'custom' },
  { name: 'MongoDB', domain: 'mongodb.com', careersUrl: 'https://www.mongodb.com/careers', atsType: 'greenhouse' },
  { name: 'Elastic', domain: 'elastic.co', careersUrl: 'https://www.elastic.co/careers', atsType: 'greenhouse' },
  { name: 'Docker', domain: 'docker.com', careersUrl: 'https://www.docker.com/careers/', atsType: 'greenhouse' },
  { name: 'HashiCorp', domain: 'hashicorp.com', careersUrl: 'https://www.hashicorp.com/jobs', atsType: 'greenhouse' },

  // Emerging Tech
  { name: 'Tesla', domain: 'tesla.com', careersUrl: 'https://www.tesla.com/careers/search/', atsType: 'custom' },
  { name: 'SpaceX', domain: 'spacex.com', careersUrl: 'https://www.spacex.com/careers/', atsType: 'custom' },
  { name: 'NVIDIA', domain: 'nvidia.com', careersUrl: 'https://nvidia.wd5.myworkdayjobs.com/en-us/nvidiaexternalcareersite', atsType: 'workday' },
]

// Generic scraping function that adapts to different ATS platforms
async function scrapeCareerSite(site: CompanyCareerSite, keywords: string): Promise<ScrapedJob[]> {
  try {
    // This would use Puppeteer/Playwright for dynamic content
    const response = await fetch(site.careersUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0; +https://raviporuri.com/jobs)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!response.ok) {
      console.warn(`Failed to fetch ${site.name}: ${response.status}`)
      return []
    }

    const html = await response.text()

    // Parse based on ATS type
    switch (site.atsType) {
      case 'greenhouse':
        return parseGreenhouseJobs(html, site, keywords)
      case 'workday':
        return parseWorkdayJobs(html, site, keywords)
      case 'lever':
        return parseLeverJobs(html, site, keywords)
      case 'custom':
        return parseCustomJobs(html, site, keywords)
      default:
        return parseGenericJobs(html, site, keywords)
    }
  } catch (error) {
    console.error(`Error scraping ${site.name}:`, error)
    return []
  }
}

// Greenhouse ATS parser
function parseGreenhouseJobs(html: string, site: CompanyCareerSite, keywords: string): ScrapedJob[] {
  const jobs: ScrapedJob[] = []

  // Greenhouse typically uses JSON-LD structured data
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs)

  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match.replace(/<\/?script[^>]*>/g, ''))
        if (data['@type'] === 'JobPosting' || Array.isArray(data)) {
          const jobData = Array.isArray(data) ? data : [data]

          for (const job of jobData) {
            if (job['@type'] === 'JobPosting' && matchesKeywords(job.title || '', keywords)) {
              jobs.push({
                id: `${site.domain}-${job.identifier || Math.random().toString(36)}`,
                title: job.title || '',
                company: site.name,
                location: job.jobLocation?.address?.addressLocality || 'Location not specified',
                remote: (job.jobLocationType === 'TELECOMMUTE') || (job.title?.toLowerCase().includes('remote')),
                salary: job.baseSalary ? `$${job.baseSalary.value?.minValue/1000}k - $${job.baseSalary.value?.maxValue/1000}k` : undefined,
                description: job.description?.substring(0, 500) + '...' || '',
                url: job.url || site.careersUrl,
                source: `${site.name} (Career Site)`,
                postedDate: job.datePosted || new Date().toISOString(),
                atsType: 'greenhouse'
              })
            }
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  return jobs
}

// Workday ATS parser
function parseWorkdayJobs(html: string, site: CompanyCareerSite, keywords: string): ScrapedJob[] {
  // Workday often uses specific CSS classes and data attributes
  // This would require DOM parsing with cheerio or similar
  return []
}

// Lever ATS parser
function parseLeverJobs(html: string, site: CompanyCareerSite, keywords: string): ScrapedJob[] {
  // Lever has its own structure
  return []
}

// Custom parser for companies with proprietary systems
function parseCustomJobs(html: string, site: CompanyCareerSite, keywords: string): ScrapedJob[] {
  // Each custom site would need its own parsing logic
  return []
}

// Generic fallback parser
function parseGenericJobs(html: string, site: CompanyCareerSite, keywords: string): ScrapedJob[] {
  const jobs: ScrapedJob[] = []

  // Look for common job posting patterns
  const titlePatterns = [
    /<h[1-6][^>]*>(.*?engineer.*?)<\/h[1-6]>/gi,
    /<a[^>]*class="[^"]*job[^"]*"[^>]*>(.*?)<\/a>/gi,
    /<div[^>]*class="[^"]*position[^"]*"[^>]*>(.*?)<\/div>/gi
  ]

  for (const pattern of titlePatterns) {
    const matches = html.match(pattern)
    if (matches) {
      for (const match of matches.slice(0, 10)) { // Limit to prevent spam
        const title = match.replace(/<[^>]*>/g, '').trim()
        if (matchesKeywords(title, keywords)) {
          jobs.push({
            id: `${site.domain}-${Math.random().toString(36)}`,
            title,
            company: site.name,
            location: 'Location not specified',
            remote: title.toLowerCase().includes('remote'),
            description: 'Job details available on company website',
            url: site.careersUrl,
            source: `${site.name} (Career Site)`,
            postedDate: new Date().toISOString()
          })
        }
      }
    }
  }

  return jobs
}

// Keyword matching helper
function matchesKeywords(text: string, keywords: string): boolean {
  const searchText = text.toLowerCase()
  const keywordArray = keywords.toLowerCase().split(' ')
  return keywordArray.some(keyword => searchText.includes(keyword))
}

// Main scraping orchestrator
export async function POST(request: NextRequest) {
  try {
    const { keywords, maxCompanies = 10 } = await request.json()

    if (!keywords) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    console.log(`Starting career site scraping for: ${keywords}`)

    // Select companies to scrape (rotate to avoid overwhelming any single site)
    const selectedSites = COMPANY_CAREER_SITES
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, maxCompanies)

    // Scrape sites with rate limiting
    const allJobs: ScrapedJob[] = []

    for (const site of selectedSites) {
      console.log(`Scraping ${site.name}...`)
      const jobs = await scrapeCareerSite(site, keywords)
      allJobs.push(...jobs)

      // Rate limiting: 2 second delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Remove duplicates and sort by relevance
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex(j => j.url === job.url || j.title === job.title)
    )

    return NextResponse.json({
      jobs: uniqueJobs,
      total: uniqueJobs.length,
      companiesScraped: selectedSites.length,
      sources: selectedSites.map(s => s.name)
    })

  } catch (error) {
    console.error('Career scraping error:', error)
    return NextResponse.json({ error: 'Failed to scrape career sites' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Career Site Scraper API',
    companies: COMPANY_CAREER_SITES.length,
    supportedATS: ['greenhouse', 'workday', 'lever', 'custom', 'generic'],
    usage: 'POST with {"keywords": "data engineer", "maxCompanies": 10}'
  })
}