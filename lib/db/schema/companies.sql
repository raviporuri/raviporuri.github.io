-- Companies and their career sites table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  careers_url VARCHAR(500),
  ats_type VARCHAR(50), -- greenhouse, workday, lever, custom, etc.
  industry VARCHAR(100),
  size_category VARCHAR(50), -- startup, scale-up, enterprise, fortune500
  headquarters_location VARCHAR(255),
  logo_url VARCHAR(500),
  linkedin_url VARCHAR(255),
  description TEXT,

  -- Scraping metadata
  last_scraped_at TIMESTAMP,
  scraping_enabled BOOLEAN DEFAULT true,
  scraping_frequency_hours INTEGER DEFAULT 24,
  jobs_found_last_scrape INTEGER DEFAULT 0,
  scraping_errors INTEGER DEFAULT 0,

  -- Quality metrics
  job_quality_score DECIMAL(3,2) DEFAULT 0.0, -- 0-5 rating
  response_time_ms INTEGER,
  success_rate DECIMAL(5,4) DEFAULT 1.0, -- 0.0-1.0

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_ats_type ON companies(ats_type);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_last_scraped ON companies(last_scraped_at);
CREATE INDEX IF NOT EXISTS idx_companies_scraping_enabled ON companies(scraping_enabled);

-- Job listings cache table
CREATE TABLE IF NOT EXISTS job_listings_cache (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  external_id VARCHAR(255), -- company's internal job ID
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  remote BOOLEAN DEFAULT false,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  requirements TEXT,
  benefits TEXT[],
  job_url VARCHAR(500),

  -- Metadata
  posted_date TIMESTAMP,
  scraped_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  -- Search optimization
  keywords TEXT[], -- extracted keywords for search
  experience_level VARCHAR(50), -- entry, mid, senior, executive
  job_type VARCHAR(50), -- full-time, part-time, contract, intern

  UNIQUE(company_id, external_id)
);

-- Indexes for job search
CREATE INDEX IF NOT EXISTS idx_job_listings_title ON job_listings_cache USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_job_listings_description ON job_listings_cache USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_job_listings_keywords ON job_listings_cache USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_job_listings_active ON job_listings_cache(is_active);
CREATE INDEX IF NOT EXISTS idx_job_listings_remote ON job_listings_cache(remote);
CREATE INDEX IF NOT EXISTS idx_job_listings_experience ON job_listings_cache(experience_level);

-- Scraping queue for background jobs
CREATE TABLE IF NOT EXISTS scraping_queue (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  priority INTEGER DEFAULT 1, -- 1=low, 5=high
  scheduled_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
  error_message TEXT,
  jobs_found INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraping_queue_status ON scraping_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_scheduled ON scraping_queue(scheduled_at);