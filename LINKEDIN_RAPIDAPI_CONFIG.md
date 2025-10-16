# LinkedIn RapidAPI Configuration

## API Key Configuration

**Correct API Key**: `a91f096968mshfd3781c621d5c70p1a6024jsnec9101b65a04`

**Environment Variable**:
```
LINKEDIN_RAPIDAPI_KEY="a91f096968mshfd3781c621d5c70p1a6024jsnec9101b65a04"
```

## API Endpoints

### Base URL
```
https://linkedin-job-search-api.p.rapidapi.com
```

### Available Endpoints

#### 1. Ultra - Get Jobs Hourly
- **Endpoint**: `/active-jb-1h`
- **Method**: GET
- **Description**: Fetches the most recent job postings (updated hourly)
- **Use Case**: Real-time job updates, most current listings

#### 2. Get Jobs 24h
- **Endpoint**: `/active-jb-24h`
- **Method**: GET
- **Description**: Fetches job postings from the last 24 hours
- **Use Case**: Daily job updates, recent listings

#### 3. Get Jobs 7 Days (Currently Used)
- **Endpoint**: `/active-jb-7d`
- **Method**: GET
- **Description**: Fetches job postings from the last 7 days
- **Use Case**: Weekly job updates, broader selection of recent jobs

## Current Implementation

**Active Endpoint**: `/active-jb-7d`

**Request Headers**:
```javascript
{
  'x-rapidapi-key': process.env.LINKEDIN_RAPIDAPI_KEY,
  'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
}
```

**Parameters**:
```javascript
{
  limit: '300',           // Number of jobs to return
  offset: '0',           // Pagination offset
  description_type: 'text', // Text format for descriptions
  title_filter: searchQuery, // Job title/keyword filter (optional)
  location_filter: location, // Location filter (optional)
  remote: 'true'         // Remote jobs only (optional)
}
```

## Example Usage

### Basic Request
```bash
curl --request GET \
  --url 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d?limit=300&offset=0&title_filter=software%20engineer&description_type=text' \
  --header 'x-rapidapi-host: linkedin-job-search-api.p.rapidapi.com' \
  --header 'x-rapidapi-key: a91f096968mshfd3781c621d5c70p1a6024jsnec9101b65a04'
```

### Response Format
```json
[
  {
    "id": "1887432886",
    "date_posted": "2025-10-16T06:27:13.891",
    "title": "Software Engineer",
    "organization": "Company Name",
    "organization_url": "https://linkedin.com/company/...",
    "locations_raw": [...],
    "salary_raw": null,
    "employment_type": null,
    "url": "https://linkedin.com/jobs/view/...",
    "source": "linkedin",
    "description_text": "Job description...",
    "linkedin_org_employees": 4,
    "linkedin_org_size": "11-50 employees",
    "linkedin_org_industry": "Industry Name",
    "remote_derived": false
  }
]
```

## Endpoint Selection Guide

- **Use `/active-jb-1h`** for: Real-time job alerts, instant notifications
- **Use `/active-jb-24h`** for: Daily job digest, recent opportunities
- **Use `/active-jb-7d`** for: Weekly job search, comprehensive recent listings (recommended for most use cases)

## Troubleshooting

### Common Issues
1. **"You are not subscribed to this API"** - Check API key is correct
2. **503 errors** - Wrong endpoint being used (ensure using correct endpoint path)
3. **Empty results** - Check filter parameters and endpoint availability

### Verification
Test API key and endpoint with:
```bash
curl --request GET \
  --url 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d?limit=10' \
  --header 'x-rapidapi-host: linkedin-job-search-api.p.rapidapi.com' \
  --header 'x-rapidapi-key: YOUR_API_KEY'
```

## Implementation Location
- **File**: `app/api/linkedin-jobs/route.ts`
- **Current Status**: ✅ Working with `/active-jb-7d` endpoint
- **Last Updated**: October 16, 2025