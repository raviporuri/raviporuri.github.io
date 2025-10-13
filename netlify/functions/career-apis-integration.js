const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { platform, action, params } = JSON.parse(event.body || '{}');

    switch (platform) {
      case 'glassdoor':
        return await handleGlassdoorAPI(headers, action, params);
      case 'indeed':
        return await handleIndeedAPI(headers, action, params);
      case 'github':
        return await handleGitHubAPI(headers, action, params);
      case 'stackoverflow':
        return await handleStackOverflowAPI(headers, action, params);
      case 'angel':
        return await handleAngelListAPI(headers, action, params);
      case 'crunchbase':
        return await handleCrunchbaseAPI(headers, action, params);
      default:
        throw new Error('Unsupported platform');
    }
  } catch (error) {
    console.error('Career API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Career API integration failed', details: error.message })
    };
  }
};

// Glassdoor Integration
async function handleGlassdoorAPI(headers, action, params) {
  const glassdoorApiKey = process.env.GLASSDOOR_API_KEY;
  const glassdoorPartnerId = process.env.GLASSDOOR_PARTNER_ID;

  switch (action) {
    case 'get-salary':
      return await getGlassdoorSalary(headers, params, glassdoorApiKey, glassdoorPartnerId);
    case 'get-reviews':
      return await getGlassdoorReviews(headers, params, glassdoorApiKey, glassdoorPartnerId);
    case 'get-interviews':
      return await getGlassdoorInterviews(headers, params, glassdoorApiKey, glassdoorPartnerId);
    default:
      throw new Error('Invalid Glassdoor action');
  }
}

async function getGlassdoorSalary(headers, params, apiKey, partnerId) {
  const { jobTitle, location, companyId } = params;

  try {
    const response = await axios.get('https://api.glassdoor.com/api/api.htm', {
      params: {
        't.p': partnerId,
        't.k': apiKey,
        'action': 'jobs-stats',
        'v': '1',
        'format': 'json',
        'jobTitle': jobTitle,
        'geo': location,
        'employerId': companyId
      }
    });

    const salaryData = response.data.response;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        salaryInsights: {
          averageSalary: salaryData.avgBaseSalary,
          salaryRange: {
            min: salaryData.minSalary,
            max: salaryData.maxSalary
          },
          totalCompensation: salaryData.avgTotalComp,
          sampleSize: salaryData.count,
          confidenceScore: calculateConfidenceScore(salaryData.count)
        },
        marketComparison: {
          percentile25: salaryData.p25,
          percentile50: salaryData.p50,
          percentile75: salaryData.p75,
          percentile90: salaryData.p90
        },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Glassdoor salary fetch failed: ${error.message}`);
  }
}

async function getGlassdoorReviews(headers, params, apiKey, partnerId) {
  const { companyId, limit = 20 } = params;

  try {
    const response = await axios.get('https://api.glassdoor.com/api/api.htm', {
      params: {
        't.p': partnerId,
        't.k': apiKey,
        'action': 'employers',
        'v': '1',
        'format': 'json',
        'employerId': companyId,
        'ps': limit
      }
    });

    const employer = response.data.response.employers[0];
    const reviews = employer.featuredReview;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        companyInsights: {
          overallRating: employer.overallRating,
          ceoRating: employer.ceoRating,
          recommendToFriend: employer.recommendToFriendRating,
          cultureRating: employer.cultureAndValuesRating,
          careerRating: employer.careerOpportunitiesRating,
          compBenefitsRating: employer.compensationAndBenefitsRating,
          workLifeRating: employer.workLifeBalanceRating,
          seniorLeadershipRating: employer.seniorLeadershipRating
        },
        reviews: reviews,
        reviewCount: employer.numberOfReviews,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Glassdoor reviews fetch failed: ${error.message}`);
  }
}

async function getGlassdoorInterviews(headers, params, apiKey, partnerId) {
  const { companyId, jobTitle } = params;

  try {
    const response = await axios.get('https://api.glassdoor.com/api/api.htm', {
      params: {
        't.p': partnerId,
        't.k': apiKey,
        'action': 'employers',
        'v': '1',
        'format': 'json',
        'employerId': companyId
      }
    });

    const employer = response.data.response.employers[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        interviewInsights: {
          averageDifficulty: employer.interviewDifficultyRating,
          interviewExperience: employer.interviewExperienceRating,
          processLength: employer.interviewProcessLength,
          questions: employer.interviewQuestions || [],
          tips: generateInterviewTips(employer, jobTitle)
        },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Glassdoor interviews fetch failed: ${error.message}`);
  }
}

// Indeed Integration
async function handleIndeedAPI(headers, action, params) {
  const indeedApiKey = process.env.INDEED_API_KEY;

  switch (action) {
    case 'search-jobs':
      return await searchIndeedJobs(headers, params, indeedApiKey);
    case 'get-job-details':
      return await getIndeedJobDetails(headers, params, indeedApiKey);
    case 'get-salary-trends':
      return await getIndeedSalaryTrends(headers, params, indeedApiKey);
    default:
      throw new Error('Invalid Indeed action');
  }
}

async function searchIndeedJobs(headers, params, apiKey) {
  const {
    query,
    location,
    radius = 25,
    jobType = 'fulltime',
    experienceLevel,
    salary,
    limit = 25
  } = params;

  try {
    const response = await axios.get('https://api.indeed.com/ads/apisearch', {
      params: {
        publisher: apiKey,
        q: query,
        l: location,
        radius: radius,
        jt: jobType,
        limit: limit,
        format: 'json',
        v: '2'
      }
    });

    const jobs = response.data.results.map(job => ({
      jobkey: job.jobkey,
      jobtitle: job.jobtitle,
      company: job.company,
      city: job.city,
      state: job.state,
      country: job.country,
      language: job.language,
      formattedLocation: job.formattedLocation,
      source: job.source,
      date: job.date,
      snippet: job.snippet,
      url: job.url,
      onmousedown: job.onmousedown,
      latitude: job.latitude,
      longitude: job.longitude,
      jobkey: job.jobkey,
      sponsored: job.sponsored,
      expired: job.expired,
      indeedApply: job.indeedApply,
      formattedLocationFull: job.formattedLocationFull,
      formattedRelativeTime: job.formattedRelativeTime,
      stations: job.stations
    }));

    // Enhanced job analysis
    const enhancedJobs = jobs.map(job => ({
      ...job,
      aiInsights: {
        fitScore: calculateJobFit(job, params),
        salaryEstimate: estimateSalary(job.jobtitle, job.formattedLocation),
        careerProgression: assessCareerProgression(job.jobtitle),
        skillsRequired: extractSkills(job.snippet),
        applicationStrategy: generateApplicationStrategy(job)
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jobs: enhancedJobs,
        totalResults: response.data.totalResults,
        searchParams: params,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Indeed job search failed: ${error.message}`);
  }
}

// GitHub Integration
async function handleGitHubAPI(headers, action, params) {
  const githubToken = process.env.GITHUB_TOKEN;

  switch (action) {
    case 'get-profile':
      return await getGitHubProfile(headers, params, githubToken);
    case 'analyze-repos':
      return await analyzeGitHubRepos(headers, params, githubToken);
    case 'get-contributions':
      return await getGitHubContributions(headers, params, githubToken);
    case 'skill-analysis':
      return await analyzeGitHubSkills(headers, params, githubToken);
    default:
      throw new Error('Invalid GitHub action');
  }
}

async function getGitHubProfile(headers, params, token) {
  const { username } = params;

  try {
    const [profile, repos, events] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, {
        headers: { 'Authorization': `token ${token}` }
      }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers: { 'Authorization': `token ${token}` }
      }),
      axios.get(`https://api.github.com/users/${username}/events/public?per_page=100`, {
        headers: { 'Authorization': `token ${token}` }
      })
    ]);

    const analysis = {
      profile: profile.data,
      repositoryStats: analyzeRepositories(repos.data),
      activityPattern: analyzeActivity(events.data),
      skillsProfile: extractTechnicalSkills(repos.data),
      contributionMetrics: calculateContributionMetrics(repos.data, events.data),
      careerInsights: generateCareerInsights(profile.data, repos.data)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        githubAnalysis: analysis,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`GitHub profile analysis failed: ${error.message}`);
  }
}

// StackOverflow Integration
async function handleStackOverflowAPI(headers, action, params) {
  switch (action) {
    case 'get-profile':
      return await getStackOverflowProfile(headers, params);
    case 'analyze-expertise':
      return await analyzeStackOverflowExpertise(headers, params);
    case 'get-reputation-trends':
      return await getReputationTrends(headers, params);
    default:
      throw new Error('Invalid StackOverflow action');
  }
}

async function getStackOverflowProfile(headers, params) {
  const { userId } = params;

  try {
    const [user, answers, questions, badges] = await Promise.all([
      axios.get(`https://api.stackexchange.com/2.3/users/${userId}?order=desc&sort=reputation&site=stackoverflow`),
      axios.get(`https://api.stackexchange.com/2.3/users/${userId}/answers?order=desc&sort=votes&site=stackoverflow&pagesize=100`),
      axios.get(`https://api.stackexchange.com/2.3/users/${userId}/questions?order=desc&sort=votes&site=stackoverflow&pagesize=100`),
      axios.get(`https://api.stackexchange.com/2.3/users/${userId}/badges?order=desc&sort=awarded&site=stackoverflow`)
    ]);

    const profile = user.data.items[0];
    const expertise = analyzeStackOverflowExpertise(answers.data.items, questions.data.items);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        profile: profile,
        expertise: expertise,
        badges: badges.data.items,
        activityMetrics: {
          reputation: profile.reputation,
          answerCount: profile.answer_count,
          questionCount: profile.question_count,
          acceptRate: profile.accept_rate,
          viewCount: profile.view_count
        },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`StackOverflow profile fetch failed: ${error.message}`);
  }
}

// Helper Functions
function calculateConfidenceScore(sampleSize) {
  if (sampleSize >= 100) return 'High';
  if (sampleSize >= 50) return 'Medium';
  if (sampleSize >= 20) return 'Low';
  return 'Very Low';
}

function generateInterviewTips(employer, jobTitle) {
  return [
    `Research ${employer.name}'s recent projects and values`,
    `Prepare specific examples for ${jobTitle} responsibilities`,
    `Practice behavioral questions using STAR method`,
    `Prepare questions about team structure and growth opportunities`,
    `Review technical skills relevant to the role`
  ];
}

function calculateJobFit(job, userParams) {
  let score = 0;

  // Title matching
  if (userParams.preferredRoles) {
    const titleMatch = userParams.preferredRoles.some(role =>
      job.jobtitle.toLowerCase().includes(role.toLowerCase())
    );
    if (titleMatch) score += 30;
  }

  // Location preference
  if (userParams.location && job.formattedLocation) {
    const locationMatch = job.formattedLocation.toLowerCase()
      .includes(userParams.location.toLowerCase());
    if (locationMatch) score += 20;
  }

  // Experience level
  const snippet = job.snippet.toLowerCase();
  if (snippet.includes('senior') && userParams.experienceLevel === 'senior') score += 25;
  if (snippet.includes('junior') && userParams.experienceLevel === 'junior') score += 25;
  if (snippet.includes('mid') && userParams.experienceLevel === 'mid') score += 25;

  // Company size preference
  if (userParams.companySize && snippet.includes(userParams.companySize)) score += 15;

  // Remote work preference
  if (userParams.remotePreference && (snippet.includes('remote') || snippet.includes('work from home'))) {
    score += 10;
  }

  return Math.min(100, score);
}

function estimateSalary(jobTitle, location) {
  // Salary estimation logic based on job title and location
  const baseSalaries = {
    'software engineer': 120000,
    'senior software engineer': 160000,
    'staff engineer': 200000,
    'principal engineer': 240000,
    'engineering manager': 180000,
    'senior manager': 220000,
    'director': 280000,
    'vice president': 350000,
    'cto': 400000
  };

  const locationMultipliers = {
    'san francisco': 1.4,
    'new york': 1.3,
    'seattle': 1.25,
    'los angeles': 1.2,
    'boston': 1.15,
    'chicago': 1.1,
    'austin': 1.05,
    'denver': 1.0,
    'atlanta': 0.95,
    'remote': 1.1
  };

  const baseTitle = Object.keys(baseSalaries).find(title =>
    jobTitle.toLowerCase().includes(title)
  ) || 'software engineer';

  const baseSalary = baseSalaries[baseTitle];
  const locationKey = Object.keys(locationMultipliers).find(loc =>
    location.toLowerCase().includes(loc)
  ) || 'denver';

  const estimatedSalary = baseSalary * locationMultipliers[locationKey];

  return {
    estimate: Math.round(estimatedSalary),
    range: {
      min: Math.round(estimatedSalary * 0.8),
      max: Math.round(estimatedSalary * 1.3)
    },
    confidence: 'Medium',
    factors: [baseTitle, locationKey]
  };
}

function assessCareerProgression(jobTitle) {
  const progressionPaths = {
    'junior': ['software engineer', 'senior software engineer'],
    'software engineer': ['senior software engineer', 'staff engineer', 'engineering manager'],
    'senior software engineer': ['staff engineer', 'principal engineer', 'engineering manager'],
    'staff engineer': ['principal engineer', 'engineering manager', 'senior manager'],
    'principal engineer': ['senior manager', 'director', 'distinguished engineer'],
    'engineering manager': ['senior manager', 'director'],
    'senior manager': ['director', 'vice president'],
    'director': ['vice president', 'cto'],
    'vice president': ['cto', 'chief technology officer']
  };

  const currentLevel = Object.keys(progressionPaths).find(level =>
    jobTitle.toLowerCase().includes(level)
  ) || 'software engineer';

  return {
    currentLevel,
    nextSteps: progressionPaths[currentLevel] || [],
    timeframe: '2-4 years',
    skillsNeeded: generateSkillsForProgression(currentLevel)
  };
}

function extractSkills(snippet) {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws',
    'docker', 'kubernetes', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
    'machine learning', 'data science', 'tensorflow', 'pytorch', 'spark',
    'hadoop', 'kafka', 'microservices', 'rest api', 'graphql', 'git',
    'agile', 'scrum', 'devops', 'ci/cd', 'jenkins', 'ansible', 'terraform'
  ];

  const foundSkills = commonSkills.filter(skill =>
    snippet.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills;
}

function generateApplicationStrategy(job) {
  return {
    timing: 'Apply within 3-7 days for optimal response rate',
    approach: [
      'Tailor resume to highlight relevant experience',
      'Write personalized cover letter addressing key requirements',
      'Research company culture and recent news',
      'Prepare for potential coding challenge'
    ],
    networking: 'Look for mutual connections at the company',
    followUp: 'Send thank you note within 24 hours if you get an interview'
  };
}

function analyzeRepositories(repos) {
  const languages = {};
  const topics = {};
  let totalStars = 0;
  let totalForks = 0;

  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
  });

  return {
    totalRepos: repos.length,
    languages: Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10),
    totalStars,
    totalForks,
    averageStars: totalStars / repos.length,
    mostPopularRepo: repos.reduce((max, repo) =>
      repo.stargazers_count > max.stargazers_count ? repo : max, repos[0])
  };
}

function analyzeActivity(events) {
  const eventTypes = {};
  const recentActivity = events.slice(0, 30);

  recentActivity.forEach(event => {
    eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
  });

  return {
    recentEvents: recentActivity.length,
    eventTypes,
    activityScore: calculateActivityScore(recentActivity),
    lastActiveDate: events[0]?.created_at
  };
}

function extractTechnicalSkills(repos) {
  const languageStats = {};
  repos.forEach(repo => {
    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
    }
  });

  return {
    primaryLanguages: Object.entries(languageStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, projectCount: count })),
    frameworks: detectFrameworks(repos),
    databases: detectDatabases(repos),
    cloudPlatforms: detectCloudPlatforms(repos)
  };
}

function calculateContributionMetrics(repos, events) {
  const commits = events.filter(e => e.type === 'PushEvent').length;
  const prs = events.filter(e => e.type === 'PullRequestEvent').length;
  const issues = events.filter(e => e.type === 'IssuesEvent').length;

  return {
    recentCommits: commits,
    recentPRs: prs,
    recentIssues: issues,
    contributionScore: (commits * 1) + (prs * 2) + (issues * 0.5),
    consistency: calculateConsistency(events)
  };
}

function generateCareerInsights(profile, repos) {
  const accountAge = Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24 * 365));
  const repoCount = repos.length;
  const followers = profile.followers;

  return {
    experienceLevel: determineExperienceLevel(accountAge, repoCount, followers),
    strengths: identifyStrengths(repos, profile),
    recommendations: generateRecommendations(repos, profile),
    portfolioScore: calculatePortfolioScore(repos, profile)
  };
}

function analyzeStackOverflowExpertise(answers, questions) {
  const tags = {};

  [...answers, ...questions].forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + (item.score || 0);
      });
    }
  });

  const expertiseAreas = Object.entries(tags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, score]) => ({ tag, score }));

  return {
    topExpertiseAreas: expertiseAreas,
    totalScore: Object.values(tags).reduce((sum, score) => sum + score, 0),
    answerQuality: calculateAnswerQuality(answers),
    helpfulnessRatio: calculateHelpfulnessRatio(answers)
  };
}

// Additional helper functions
function generateSkillsForProgression(currentLevel) {
  const skillMaps = {
    'junior': ['System design basics', 'Code review practices', 'Testing frameworks'],
    'software engineer': ['Advanced algorithms', 'Architecture patterns', 'Mentoring'],
    'senior software engineer': ['Technical leadership', 'Project management', 'Cross-functional collaboration'],
    'staff engineer': ['Strategic thinking', 'Technical vision', 'Influence without authority'],
    'engineering manager': ['Team building', 'Performance management', 'Budget planning']
  };

  return skillMaps[currentLevel] || ['Technical depth', 'Communication', 'Leadership'];
}

function detectFrameworks(repos) {
  const frameworks = ['react', 'angular', 'vue', 'express', 'django', 'flask', 'spring', 'laravel'];
  const detected = [];

  repos.forEach(repo => {
    const desc = (repo.description || '').toLowerCase();
    const name = repo.name.toLowerCase();
    frameworks.forEach(fw => {
      if (desc.includes(fw) || name.includes(fw)) {
        if (!detected.includes(fw)) detected.push(fw);
      }
    });
  });

  return detected;
}

function detectDatabases(repos) {
  const databases = ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite'];
  const detected = [];

  repos.forEach(repo => {
    const desc = (repo.description || '').toLowerCase();
    databases.forEach(db => {
      if (desc.includes(db)) {
        if (!detected.includes(db)) detected.push(db);
      }
    });
  });

  return detected;
}

function detectCloudPlatforms(repos) {
  const platforms = ['aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify'];
  const detected = [];

  repos.forEach(repo => {
    const desc = (repo.description || '').toLowerCase();
    platforms.forEach(platform => {
      if (desc.includes(platform)) {
        if (!detected.includes(platform)) detected.push(platform);
      }
    });
  });

  return detected;
}

function calculateActivityScore(events) {
  const weights = {
    'PushEvent': 2,
    'PullRequestEvent': 3,
    'IssuesEvent': 1,
    'CreateEvent': 1,
    'ForkEvent': 1
  };

  return events.reduce((score, event) => {
    return score + (weights[event.type] || 0.5);
  }, 0);
}

function calculateConsistency(events) {
  const days = {};
  events.forEach(event => {
    const day = new Date(event.created_at).toDateString();
    days[day] = (days[day] || 0) + 1;
  });

  const activeDays = Object.keys(days).length;
  const totalDays = 30; // Looking at last 30 days

  return {
    activeDaysRatio: activeDays / totalDays,
    streaks: calculateStreaks(Object.keys(days)),
    averageCommitsPerDay: Object.values(days).reduce((sum, count) => sum + count, 0) / activeDays
  };
}

function calculateStreaks(activeDays) {
  // Simple streak calculation
  const sortedDays = activeDays.sort();
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDay = new Date(sortedDays[i - 1]);
    const currentDay = new Date(sortedDays[i]);
    const diffTime = Math.abs(currentDay - prevDay);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return { current: currentStreak, max: maxStreak };
}

function determineExperienceLevel(accountAge, repoCount, followers) {
  let score = 0;

  if (accountAge >= 5) score += 3;
  else if (accountAge >= 3) score += 2;
  else if (accountAge >= 1) score += 1;

  if (repoCount >= 50) score += 3;
  else if (repoCount >= 20) score += 2;
  else if (repoCount >= 10) score += 1;

  if (followers >= 100) score += 3;
  else if (followers >= 50) score += 2;
  else if (followers >= 10) score += 1;

  if (score >= 7) return 'Senior';
  if (score >= 4) return 'Mid-level';
  return 'Junior';
}

function identifyStrengths(repos, profile) {
  const strengths = [];

  if (repos.length >= 30) strengths.push('Prolific developer');
  if (repos.reduce((sum, repo) => sum + repo.stargazers_count, 0) >= 100) {
    strengths.push('Creates popular projects');
  }
  if (profile.followers >= 50) strengths.push('Strong community presence');

  const languages = repos.reduce((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});

  if (Object.keys(languages).length >= 5) strengths.push('Polyglot programmer');

  return strengths;
}

function generateRecommendations(repos, profile) {
  const recommendations = [];

  if (repos.length < 10) recommendations.push('Create more public repositories to showcase your work');
  if (profile.bio === null) recommendations.push('Add a professional bio to your GitHub profile');
  if (profile.blog === null) recommendations.push('Add your personal website or blog link');

  const hasReadme = repos.some(repo => repo.name.toLowerCase() === profile.login.toLowerCase());
  if (!hasReadme) recommendations.push('Create a README profile to introduce yourself');

  return recommendations;
}

function calculatePortfolioScore(repos, profile) {
  let score = 0;

  // Repository count (max 20 points)
  score += Math.min(repos.length * 2, 20);

  // Stars (max 30 points)
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  score += Math.min(totalStars, 30);

  // Followers (max 20 points)
  score += Math.min(profile.followers * 2, 20);

  // Profile completeness (max 20 points)
  if (profile.bio) score += 5;
  if (profile.blog) score += 5;
  if (profile.location) score += 5;
  if (profile.company) score += 5;

  // Recent activity (max 10 points)
  const recentRepos = repos.filter(repo => {
    const lastUpdate = new Date(repo.updated_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastUpdate > sixMonthsAgo;
  });
  score += Math.min(recentRepos.length * 2, 10);

  return Math.min(score, 100);
}

function calculateAnswerQuality(answers) {
  if (answers.length === 0) return { average: 0, total: 0 };

  const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  const acceptedAnswers = answers.filter(answer => answer.is_accepted).length;

  return {
    averageScore: totalScore / answers.length,
    totalScore,
    acceptedCount: acceptedAnswers,
    acceptanceRate: acceptedAnswers / answers.length
  };
}

function calculateHelpfulnessRatio(answers) {
  const upvotedAnswers = answers.filter(answer => (answer.score || 0) > 0).length;
  return answers.length > 0 ? upvotedAnswers / answers.length : 0;
}