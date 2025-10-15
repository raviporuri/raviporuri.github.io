interface CompanySeed {
  name: string
  domain: string
  careers_url: string
  ats_type: string
  industry: string
  size_category: string
  headquarters_location: string
}

// Comprehensive company database - starting with major employers
export const COMPANY_SEEDS: CompanySeed[] = [
  // FAANG + Major Tech
  { name: 'Google', domain: 'google.com', careers_url: 'https://careers.google.com/jobs/results/', ats_type: 'custom', industry: 'Technology', size_category: 'fortune500', headquarters_location: 'Mountain View, CA' },
  { name: 'Apple', domain: 'apple.com', careers_url: 'https://jobs.apple.com/en-us/search', ats_type: 'custom', industry: 'Technology', size_category: 'fortune500', headquarters_location: 'Cupertino, CA' },
  { name: 'Microsoft', domain: 'microsoft.com', careers_url: 'https://careers.microsoft.com/v2/global/en/search', ats_type: 'custom', industry: 'Technology', size_category: 'fortune500', headquarters_location: 'Redmond, WA' },
  { name: 'Amazon', domain: 'amazon.com', careers_url: 'https://www.amazon.jobs/en/search', ats_type: 'custom', industry: 'Technology', size_category: 'fortune500', headquarters_location: 'Seattle, WA' },
  { name: 'Meta', domain: 'meta.com', careers_url: 'https://www.metacareers.com/jobs/', ats_type: 'custom', industry: 'Technology', size_category: 'fortune500', headquarters_location: 'Menlo Park, CA' },
  { name: 'Netflix', domain: 'netflix.com', careers_url: 'https://jobs.netflix.com/search', ats_type: 'custom', industry: 'Technology', size_category: 'enterprise', headquarters_location: 'Los Gatos, CA' },

  // Tech Unicorns & High-Growth
  { name: 'OpenAI', domain: 'openai.com', careers_url: 'https://openai.com/careers/search', ats_type: 'greenhouse', industry: 'AI/ML', size_category: 'scale-up', headquarters_location: 'San Francisco, CA' },
  { name: 'Anthropic', domain: 'anthropic.com', careers_url: 'https://www.anthropic.com/careers', ats_type: 'greenhouse', industry: 'AI/ML', size_category: 'scale-up', headquarters_location: 'San Francisco, CA' },
  { name: 'Stripe', domain: 'stripe.com', careers_url: 'https://stripe.com/jobs/search', ats_type: 'greenhouse', industry: 'Fintech', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Databricks', domain: 'databricks.com', careers_url: 'https://www.databricks.com/company/careers/open-positions', ats_type: 'greenhouse', industry: 'Data & Analytics', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Snowflake', domain: 'snowflake.com', careers_url: 'https://careers.snowflake.com/us/en/search-results', ats_type: 'workday', industry: 'Data & Analytics', size_category: 'enterprise', headquarters_location: 'Bozeman, MT' },
  { name: 'Palantir', domain: 'palantir.com', careers_url: 'https://www.palantir.com/careers/', ats_type: 'lever', industry: 'Data & Analytics', size_category: 'enterprise', headquarters_location: 'Denver, CO' },
  { name: 'Uber', domain: 'uber.com', careers_url: 'https://www.uber.com/careers/list/', ats_type: 'lever', industry: 'Transportation', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Airbnb', domain: 'airbnb.com', careers_url: 'https://careers.airbnb.com/positions/', ats_type: 'greenhouse', industry: 'Travel & Hospitality', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'SpaceX', domain: 'spacex.com', careers_url: 'https://www.spacex.com/careers/', ats_type: 'custom', industry: 'Aerospace', size_category: 'enterprise', headquarters_location: 'Hawthorne, CA' },
  { name: 'Tesla', domain: 'tesla.com', careers_url: 'https://www.tesla.com/careers/search/', ats_type: 'custom', industry: 'Automotive', size_category: 'enterprise', headquarters_location: 'Austin, TX' },

  // Financial Services
  { name: 'Goldman Sachs', domain: 'goldmansachs.com', careers_url: 'https://www.goldmansachs.com/careers/', ats_type: 'workday', industry: 'Financial Services', size_category: 'fortune500', headquarters_location: 'New York, NY' },
  { name: 'JPMorgan Chase', domain: 'jpmorganchase.com', careers_url: 'https://careers.jpmorgan.com/global/en', ats_type: 'workday', industry: 'Financial Services', size_category: 'fortune500', headquarters_location: 'New York, NY' },
  { name: 'Bank of America', domain: 'bankofamerica.com', careers_url: 'https://careers.bankofamerica.com/en-us/job-search', ats_type: 'workday', industry: 'Financial Services', size_category: 'fortune500', headquarters_location: 'Charlotte, NC' },
  { name: 'Coinbase', domain: 'coinbase.com', careers_url: 'https://www.coinbase.com/careers/positions', ats_type: 'greenhouse', industry: 'Fintech', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Robinhood', domain: 'robinhood.com', careers_url: 'https://robinhood.com/careers/', ats_type: 'lever', industry: 'Fintech', size_category: 'enterprise', headquarters_location: 'Menlo Park, CA' },

  // Enterprise Software
  { name: 'Salesforce', domain: 'salesforce.com', careers_url: 'https://careers.salesforce.com/jobs/search', ats_type: 'workday', industry: 'Enterprise Software', size_category: 'fortune500', headquarters_location: 'San Francisco, CA' },
  { name: 'Oracle', domain: 'oracle.com', careers_url: 'https://www.oracle.com/careers/job-search/', ats_type: 'taleo', industry: 'Enterprise Software', size_category: 'fortune500', headquarters_location: 'Austin, TX' },
  { name: 'SAP', domain: 'sap.com', careers_url: 'https://jobs.sap.com/search/', ats_type: 'successfactors', industry: 'Enterprise Software', size_category: 'fortune500', headquarters_location: 'Walldorf, Germany' },
  { name: 'Adobe', domain: 'adobe.com', careers_url: 'https://careers.adobe.com/us/en/search-results', ats_type: 'workday', industry: 'Software', size_category: 'enterprise', headquarters_location: 'San Jose, CA' },
  { name: 'Atlassian', domain: 'atlassian.com', careers_url: 'https://www.atlassian.com/company/careers/all-jobs', ats_type: 'greenhouse', industry: 'Software', size_category: 'enterprise', headquarters_location: 'Sydney, Australia' },
  { name: 'ServiceNow', domain: 'servicenow.com', careers_url: 'https://careers.servicenow.com/careers/', ats_type: 'workday', industry: 'Enterprise Software', size_category: 'enterprise', headquarters_location: 'Santa Clara, CA' },

  // Cloud & Infrastructure
  { name: 'AWS', domain: 'aws.amazon.com', careers_url: 'https://www.amazon.jobs/en/teams/aws', ats_type: 'custom', industry: 'Cloud Computing', size_category: 'fortune500', headquarters_location: 'Seattle, WA' },
  { name: 'MongoDB', domain: 'mongodb.com', careers_url: 'https://www.mongodb.com/careers', ats_type: 'greenhouse', industry: 'Database', size_category: 'enterprise', headquarters_location: 'New York, NY' },
  { name: 'Elastic', domain: 'elastic.co', careers_url: 'https://www.elastic.co/careers', ats_type: 'greenhouse', industry: 'Search & Analytics', size_category: 'enterprise', headquarters_location: 'Amsterdam, Netherlands' },
  { name: 'Docker', domain: 'docker.com', careers_url: 'https://www.docker.com/careers/', ats_type: 'greenhouse', industry: 'DevOps', size_category: 'enterprise', headquarters_location: 'Palo Alto, CA' },
  { name: 'HashiCorp', domain: 'hashicorp.com', careers_url: 'https://www.hashicorp.com/jobs', ats_type: 'greenhouse', industry: 'DevOps', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Datadog', domain: 'datadoghq.com', careers_url: 'https://www.datadoghq.com/careers/', ats_type: 'greenhouse', industry: 'Monitoring', size_category: 'enterprise', headquarters_location: 'New York, NY' },

  // Consulting & Professional Services
  { name: 'McKinsey & Company', domain: 'mckinsey.com', careers_url: 'https://www.mckinsey.com/careers', ats_type: 'custom', industry: 'Consulting', size_category: 'enterprise', headquarters_location: 'New York, NY' },
  { name: 'Deloitte', domain: 'deloitte.com', careers_url: 'https://careers.deloitte.com/us/en', ats_type: 'workday', industry: 'Consulting', size_category: 'fortune500', headquarters_location: 'New York, NY' },
  { name: 'PwC', domain: 'pwc.com', careers_url: 'https://www.pwc.com/us/en/careers.html', ats_type: 'workday', industry: 'Consulting', size_category: 'fortune500', headquarters_location: 'New York, NY' },
  { name: 'EY', domain: 'ey.com', careers_url: 'https://careers.ey.com/ey/', ats_type: 'workday', industry: 'Consulting', size_category: 'fortune500', headquarters_location: 'London, UK' },
  { name: 'KPMG', domain: 'kpmg.com', careers_url: 'https://careers.kpmg.com/careers/', ats_type: 'workday', industry: 'Consulting', size_category: 'fortune500', headquarters_location: 'Amstelveen, Netherlands' },

  // E-commerce & Retail
  { name: 'Shopify', domain: 'shopify.com', careers_url: 'https://www.shopify.com/careers', ats_type: 'greenhouse', industry: 'E-commerce', size_category: 'enterprise', headquarters_location: 'Ottawa, Canada' },
  { name: 'eBay', domain: 'ebay.com', careers_url: 'https://careers.ebayinc.com/', ats_type: 'workday', industry: 'E-commerce', size_category: 'enterprise', headquarters_location: 'San Jose, CA' },
  { name: 'Etsy', domain: 'etsy.com', careers_url: 'https://careers.etsy.com/', ats_type: 'greenhouse', industry: 'E-commerce', size_category: 'enterprise', headquarters_location: 'Brooklyn, NY' },
  { name: 'Walmart', domain: 'walmart.com', careers_url: 'https://careers.walmart.com/', ats_type: 'workday', industry: 'Retail', size_category: 'fortune500', headquarters_location: 'Bentonville, AR' },
  { name: 'Target', domain: 'target.com', careers_url: 'https://corporate.target.com/careers', ats_type: 'workday', industry: 'Retail', size_category: 'fortune500', headquarters_location: 'Minneapolis, MN' },

  // Healthcare & Biotech
  { name: 'Johnson & Johnson', domain: 'jnj.com', careers_url: 'https://jobs.jnj.com/', ats_type: 'workday', industry: 'Healthcare', size_category: 'fortune500', headquarters_location: 'New Brunswick, NJ' },
  { name: 'Pfizer', domain: 'pfizer.com', careers_url: 'https://www.pfizer.com/about/careers', ats_type: 'workday', industry: 'Pharmaceuticals', size_category: 'fortune500', headquarters_location: 'New York, NY' },
  { name: 'Moderna', domain: 'modernatx.com', careers_url: 'https://modernatx.com/careers', ats_type: 'greenhouse', industry: 'Biotechnology', size_category: 'enterprise', headquarters_location: 'Cambridge, MA' },
  { name: 'Gilead Sciences', domain: 'gilead.com', careers_url: 'https://careers.gilead.com/', ats_type: 'workday', industry: 'Biotechnology', size_category: 'enterprise', headquarters_location: 'Foster City, CA' },

  // Gaming & Entertainment
  { name: 'Epic Games', domain: 'epicgames.com', careers_url: 'https://www.epicgames.com/site/en-US/careers', ats_type: 'greenhouse', industry: 'Gaming', size_category: 'enterprise', headquarters_location: 'Cary, NC' },
  { name: 'Riot Games', domain: 'riotgames.com', careers_url: 'https://www.riotgames.com/en/work-with-us', ats_type: 'greenhouse', industry: 'Gaming', size_category: 'enterprise', headquarters_location: 'Los Angeles, CA' },
  { name: 'Unity', domain: 'unity.com', careers_url: 'https://careers.unity.com/', ats_type: 'greenhouse', industry: 'Gaming', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Discord', domain: 'discord.com', careers_url: 'https://discord.com/careers', ats_type: 'greenhouse', industry: 'Communication', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },

  // Emerging Unicorns
  { name: 'ByteDance', domain: 'bytedance.com', careers_url: 'https://careers.bytedance.com/en/', ats_type: 'custom', industry: 'Social Media', size_category: 'enterprise', headquarters_location: 'Singapore' },
  { name: 'Figma', domain: 'figma.com', careers_url: 'https://www.figma.com/careers/', ats_type: 'greenhouse', industry: 'Design Tools', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Notion', domain: 'notion.so', careers_url: 'https://www.notion.so/careers', ats_type: 'greenhouse', industry: 'Productivity', size_category: 'scale-up', headquarters_location: 'San Francisco, CA' },
  { name: 'Canva', domain: 'canva.com', careers_url: 'https://www.canva.com/careers/', ats_type: 'greenhouse', industry: 'Design Tools', size_category: 'enterprise', headquarters_location: 'Sydney, Australia' },
  { name: 'Zoom', domain: 'zoom.us', careers_url: 'https://careers.zoom.us/careers', ats_type: 'greenhouse', industry: 'Video Communications', size_category: 'enterprise', headquarters_location: 'San Jose, CA' },
  { name: 'Slack', domain: 'slack.com', careers_url: 'https://slack.com/careers', ats_type: 'greenhouse', industry: 'Communication', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },

  // Additional High-Growth Companies
  { name: 'GitHub', domain: 'github.com', careers_url: 'https://github.com/about/careers', ats_type: 'greenhouse', industry: 'Developer Tools', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'GitLab', domain: 'gitlab.com', careers_url: 'https://about.gitlab.com/jobs/', ats_type: 'greenhouse', industry: 'Developer Tools', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'Twilio', domain: 'twilio.com', careers_url: 'https://www.twilio.com/company/jobs', ats_type: 'greenhouse', industry: 'Communications API', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
  { name: 'SendGrid', domain: 'sendgrid.com', careers_url: 'https://sendgrid.com/careers/', ats_type: 'greenhouse', industry: 'Email Services', size_category: 'enterprise', headquarters_location: 'Denver, CO' },
  { name: 'Segment', domain: 'segment.com', careers_url: 'https://segment.com/careers/', ats_type: 'greenhouse', industry: 'Customer Data', size_category: 'enterprise', headquarters_location: 'San Francisco, CA' },
]

// Function to generate additional companies from domains/patterns
export function generateAdditionalCompanies(): CompanySeed[] {
  const additionalCompanies: CompanySeed[] = []

  // Add more companies based on common patterns
  const domainPatterns = [
    // Major consulting firms
    { domain: 'accenture.com', name: 'Accenture', industry: 'Consulting', ats_type: 'workday' },
    { domain: 'bain.com', name: 'Bain & Company', industry: 'Consulting', ats_type: 'custom' },
    { domain: 'bcg.com', name: 'Boston Consulting Group', industry: 'Consulting', ats_type: 'custom' },

    // Major banks
    { domain: 'citi.com', name: 'Citigroup', industry: 'Financial Services', ats_type: 'workday' },
    { domain: 'wellsfargo.com', name: 'Wells Fargo', industry: 'Financial Services', ats_type: 'workday' },
    { domain: 'morganstanley.com', name: 'Morgan Stanley', industry: 'Financial Services', ats_type: 'workday' },

    // Major tech companies
    { domain: 'intel.com', name: 'Intel', industry: 'Semiconductors', ats_type: 'workday' },
    { domain: 'amd.com', name: 'AMD', industry: 'Semiconductors', ats_type: 'workday' },
    { domain: 'qualcomm.com', name: 'Qualcomm', industry: 'Semiconductors', ats_type: 'workday' },
    { domain: 'broadcom.com', name: 'Broadcom', industry: 'Semiconductors', ats_type: 'workday' },

    // Aerospace & Defense
    { domain: 'boeing.com', name: 'Boeing', industry: 'Aerospace', ats_type: 'workday' },
    { domain: 'lockheedmartin.com', name: 'Lockheed Martin', industry: 'Defense', ats_type: 'workday' },
    { domain: 'raytheon.com', name: 'Raytheon Technologies', industry: 'Defense', ats_type: 'workday' },
  ]

  domainPatterns.forEach(pattern => {
    additionalCompanies.push({
      name: pattern.name,
      domain: pattern.domain,
      careers_url: `https://${pattern.domain}/careers`,
      ats_type: pattern.ats_type,
      industry: pattern.industry,
      size_category: 'enterprise',
      headquarters_location: 'United States'
    })
  })

  return additionalCompanies
}

// Export the complete company list
export const ALL_COMPANIES = [...COMPANY_SEEDS, ...generateAdditionalCompanies()]

export default ALL_COMPANIES