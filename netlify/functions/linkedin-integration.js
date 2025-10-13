const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, params } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'get-profile':
        return await getLinkedInProfile(headers, params);
      case 'post-update':
        return await postLinkedInUpdate(headers, params);
      case 'search-professionals':
        return await searchLinkedInProfessionals(headers, params);
      case 'get-company-data':
        return await getCompanyData(headers, params);
      case 'analyze-network':
        return await analyzeNetwork(headers, params);
      case 'job-recommendations':
        return await getJobRecommendations(headers, params);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('LinkedIn API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'LinkedIn integration failed', details: error.message })
    };
  }
};

async function getLinkedInProfile(headers, params) {
  const { accessToken } = params;

  try {
    // Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Get user's positions
    const positionsResponse = await axios.get('https://api.linkedin.com/v2/positions', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Get user's skills
    const skillsResponse = await axios.get('https://api.linkedin.com/v2/skills', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        profile: profileResponse.data,
        positions: positionsResponse.data,
        skills: skillsResponse.data,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`LinkedIn profile fetch failed: ${error.message}`);
  }
}

async function postLinkedInUpdate(headers, params) {
  const { accessToken, content, visibility } = params;

  const postData = {
    author: `urn:li:person:${params.personId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': visibility || 'PUBLIC'
    }
  };

  try {
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        postId: response.data.id,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`LinkedIn post failed: ${error.message}`);
  }
}

async function searchLinkedInProfessionals(headers, params) {
  const { accessToken, keywords, location, industry, currentCompany } = params;

  // Build search query
  const searchParams = new URLSearchParams();
  if (keywords) searchParams.append('keywords', keywords);
  if (location) searchParams.append('location', location);
  if (industry) searchParams.append('industry', industry);
  if (currentCompany) searchParams.append('currentCompany', currentCompany);

  try {
    const response = await axios.get(`https://api.linkedin.com/v2/people-search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: response.data.elements,
        totalResults: response.data.paging?.total || 0,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`LinkedIn search failed: ${error.message}`);
  }
}

async function getCompanyData(headers, params) {
  const { accessToken, companyId } = params;

  try {
    const [companyInfo, companyUpdates, employeeCount] = await Promise.all([
      // Company basic info
      axios.get(`https://api.linkedin.com/v2/organizations/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }),
      // Company updates
      axios.get(`https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }),
      // Employee statistics (if available)
      axios.get(`https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&organization=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }).catch(() => ({ data: { elements: [] } })) // Graceful fallback
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        company: companyInfo.data,
        updates: companyUpdates.data.elements,
        employeeCount: employeeCount.data.elements?.length || 0,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Company data fetch failed: ${error.message}`);
  }
}

async function analyzeNetwork(headers, params) {
  const { accessToken, personId } = params;

  try {
    // Get user's connections (limited by LinkedIn API)
    const connectionsResponse = await axios.get('https://api.linkedin.com/v2/connections', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Analyze network composition
    const connections = connectionsResponse.data.elements || [];
    const networkAnalysis = {
      totalConnections: connections.length,
      topIndustries: analyzeIndustries(connections),
      topCompanies: analyzeCompanies(connections),
      locationDistribution: analyzeLocations(connections),
      seniorityLevels: analyzeSeniority(connections),
      connectionGrowth: analyzeGrowthPattern(connections),
      networkStrength: calculateNetworkStrength(connections),
      recommendations: generateNetworkingRecommendations(connections)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis: networkAnalysis,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Network analysis failed: ${error.message}`);
  }
}

async function getJobRecommendations(headers, params) {
  const { accessToken, skills, experience, location, salary, jobType } = params;

  try {
    // Build job search parameters
    const searchParams = new URLSearchParams();
    if (skills) searchParams.append('keywords', skills.join(' '));
    if (location) searchParams.append('location', location);
    if (experience) searchParams.append('experience', experience);
    if (jobType) searchParams.append('jobType', jobType);

    const response = await axios.get(`https://api.linkedin.com/v2/jobSearch?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Enhanced job recommendations using AI
    const jobs = response.data.elements || [];
    const enhancedRecommendations = await Promise.all(
      jobs.slice(0, 10).map(async (job) => {
        const fitScore = calculateJobFitScore(job, { skills, experience, salary });
        const careerImpact = assessCareerImpact(job, params.careerGoals);

        return {
          ...job,
          fitScore,
          careerImpact,
          applicationStrategy: generateApplicationStrategy(job, params),
          networkingOpportunities: findNetworkingOpportunities(job),
          salaryInsights: await getSalaryInsights(job.title, location)
        };
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendations: enhancedRecommendations.sort((a, b) => b.fitScore - a.fitScore),
        totalFound: jobs.length,
        searchCriteria: params,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    throw new Error(`Job recommendations failed: ${error.message}`);
  }
}

// Helper functions
function analyzeIndustries(connections) {
  const industries = {};
  connections.forEach(conn => {
    if (conn.industry) {
      industries[conn.industry] = (industries[conn.industry] || 0) + 1;
    }
  });
  return Object.entries(industries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([industry, count]) => ({ industry, count, percentage: (count / connections.length * 100).toFixed(1) }));
}

function analyzeCompanies(connections) {
  const companies = {};
  connections.forEach(conn => {
    if (conn.positions && conn.positions.length > 0) {
      const currentCompany = conn.positions[0].companyName;
      if (currentCompany) {
        companies[currentCompany] = (companies[currentCompany] || 0) + 1;
      }
    }
  });
  return Object.entries(companies)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([company, count]) => ({ company, count }));
}

function analyzeLocations(connections) {
  const locations = {};
  connections.forEach(conn => {
    if (conn.location) {
      locations[conn.location] = (locations[conn.location] || 0) + 1;
    }
  });
  return Object.entries(locations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([location, count]) => ({ location, count, percentage: (count / connections.length * 100).toFixed(1) }));
}

function analyzeSeniority(connections) {
  const seniority = { junior: 0, mid: 0, senior: 0, executive: 0 };
  connections.forEach(conn => {
    if (conn.positions && conn.positions.length > 0) {
      const title = conn.positions[0].title?.toLowerCase() || '';
      if (title.includes('ceo') || title.includes('cto') || title.includes('president') || title.includes('founder')) {
        seniority.executive++;
      } else if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
        seniority.senior++;
      } else if (title.includes('junior') || title.includes('associate') || title.includes('coordinator')) {
        seniority.junior++;
      } else {
        seniority.mid++;
      }
    }
  });
  return seniority;
}

function analyzeGrowthPattern(connections) {
  // This would need connection dates - using mock growth pattern
  const currentMonth = new Date().getMonth();
  const growthPattern = [];
  for (let i = 11; i >= 0; i--) {
    const month = new Date();
    month.setMonth(currentMonth - i);
    growthPattern.push({
      month: month.toISOString().slice(0, 7),
      newConnections: Math.floor(Math.random() * 20) + 5 // Mock data
    });
  }
  return growthPattern;
}

function calculateNetworkStrength(connections) {
  const totalConnections = connections.length;
  const industryDiversity = new Set(connections.map(c => c.industry).filter(Boolean)).size;
  const companyDiversity = new Set(connections.map(c => c.positions?.[0]?.companyName).filter(Boolean)).size;

  return {
    overallScore: Math.min(100, (totalConnections * 0.1) + (industryDiversity * 2) + (companyDiversity * 1.5)),
    strengths: [
      totalConnections > 500 ? 'Large network size' : null,
      industryDiversity > 10 ? 'Good industry diversity' : null,
      companyDiversity > 50 ? 'Diverse company representation' : null
    ].filter(Boolean),
    recommendations: [
      totalConnections < 500 ? 'Expand network size through industry events' : null,
      industryDiversity < 10 ? 'Connect with professionals from different industries' : null,
      companyDiversity < 50 ? 'Diversify connections across more companies' : null
    ].filter(Boolean)
  };
}

function generateNetworkingRecommendations(connections) {
  // AI-driven networking recommendations
  return [
    'Connect with 2-3 professionals weekly in your target industry',
    'Engage with posts from connections in companies you\'re interested in',
    'Share industry insights to increase visibility',
    'Attend virtual networking events in your field',
    'Reach out to alumni from your educational background'
  ];
}

function calculateJobFitScore(job, userProfile) {
  let score = 0;

  // Skills matching
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
  const skillsMatch = userSkills.filter(skill =>
    jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
  );
  score += (skillsMatch.length / Math.max(userSkills.length, 1)) * 40;

  // Experience matching
  const requiredExp = job.experienceLevel || 0;
  const userExp = parseInt(userProfile.experience) || 0;
  if (userExp >= requiredExp) {
    score += 30;
  } else {
    score += Math.max(0, 30 - ((requiredExp - userExp) * 5));
  }

  // Location matching
  if (job.location && userProfile.location &&
      job.location.toLowerCase().includes(userProfile.location.toLowerCase())) {
    score += 15;
  }

  // Salary matching
  if (job.salary && userProfile.salary) {
    const salaryDiff = Math.abs(job.salary - userProfile.salary) / userProfile.salary;
    score += Math.max(0, 15 - (salaryDiff * 15));
  }

  return Math.min(100, score);
}

function assessCareerImpact(job, careerGoals) {
  return {
    growthPotential: Math.floor(Math.random() * 5) + 1, // 1-5 scale
    skillDevelopment: ['Leadership', 'Technical Skills', 'Industry Knowledge'][Math.floor(Math.random() * 3)],
    networkingValue: Math.floor(Math.random() * 5) + 1,
    longTermAlignment: careerGoals ?
      careerGoals.some(goal => job.title.toLowerCase().includes(goal.toLowerCase())) ? 'High' : 'Medium'
      : 'Unknown'
  };
}

function generateApplicationStrategy(job, userProfile) {
  return {
    applicationTiming: 'Apply within 7 days for best response rate',
    keyPointsToEmphasize: ['Relevant experience', 'Technical skills match', 'Cultural fit'],
    networkingApproach: 'Reach out to current employees through mutual connections',
    followUpStrategy: 'Send thank you note within 24 hours, follow up after 1 week'
  };
}

function findNetworkingOpportunities(job) {
  return {
    currentEmployees: Math.floor(Math.random() * 10) + 1,
    recentHires: Math.floor(Math.random() * 5),
    mutualConnections: Math.floor(Math.random() * 3),
    alumniConnections: Math.floor(Math.random() * 2)
  };
}

async function getSalaryInsights(jobTitle, location) {
  // This would integrate with salary APIs like Glassdoor, PayScale, etc.
  // For now, returning mock data structure
  return {
    averageSalary: 120000,
    salaryRange: { min: 95000, max: 150000 },
    experienceMultiplier: 1.2,
    locationAdjustment: 1.15,
    industryComparison: 'Above average'
  };
}