const { Configuration, OpenAIApi } = require('openai');
const masterProfile = require('../data/master_professional_profile.json');

// Resume templates for different purposes
const RESUME_TEMPLATES = {
  'executive-leadership': {
    name: 'Executive Leadership',
    focus: ['leadership', 'revenue-impact', 'strategic-vision', 'team-building'],
    format: 'executive',
    length: 'concise',
    sections: ['executive-summary', 'key-achievements', 'professional-experience', 'board-positions', 'education']
  },
  'technical-architect': {
    name: 'Technical Architect',
    focus: ['technical-depth', 'system-design', 'platform-scaling', 'innovation'],
    format: 'technical',
    length: 'detailed',
    sections: ['technical-summary', 'technical-achievements', 'architecture-experience', 'patents', 'certifications']
  },
  'ai-product-manager': {
    name: 'AI Product Manager',
    focus: ['ai-innovation', 'product-strategy', 'market-analysis', 'cross-functional-leadership'],
    format: 'product',
    length: 'balanced',
    sections: ['product-summary', 'ai-products', 'product-metrics', 'professional-experience', 'technical-skills']
  },
  'startup-founder': {
    name: 'Startup Founder',
    focus: ['entrepreneurship', 'innovation', 'revenue-generation', 'team-building'],
    format: 'founder',
    length: 'story-driven',
    sections: ['founder-summary', 'ventures', 'achievements', 'investment-experience', 'advisory-roles']
  },
  'data-strategy-leader': {
    name: 'Data Strategy Leader',
    focus: ['data-platforms', 'analytics', 'business-intelligence', 'digital-transformation'],
    format: 'strategic',
    length: 'metrics-heavy',
    sections: ['data-summary', 'platform-achievements', 'transformation-projects', 'technical-expertise']
  },
  'consultant-advisor': {
    name: 'Technology Consultant',
    focus: ['consulting', 'advisory', 'transformation', 'expertise'],
    format: 'consulting',
    length: 'expertise-focused',
    sections: ['consulting-summary', 'expertise-areas', 'client-successes', 'thought-leadership']
  }
};

// Country-specific formatting
const COUNTRY_FORMATS = {
  'us': {
    name: 'United States',
    phone_format: '(XXX) XXX-XXXX',
    date_format: 'MM/YYYY',
    address_style: 'city-state',
    cv_length: '1-2 pages',
    photo_required: false,
    personal_info: 'minimal'
  },
  'uk': {
    name: 'United Kingdom',
    phone_format: '+44 XXXX XXXXXX',
    date_format: 'MM/YYYY',
    address_style: 'city-county',
    cv_length: '2 pages max',
    photo_required: false,
    personal_info: 'minimal'
  },
  'germany': {
    name: 'Germany',
    phone_format: '+49 XXX XXXXXXX',
    date_format: 'MM.YYYY',
    address_style: 'full-address',
    cv_length: '2-3 pages',
    photo_required: true,
    personal_info: 'detailed'
  },
  'canada': {
    name: 'Canada',
    phone_format: '(XXX) XXX-XXXX',
    date_format: 'MM/YYYY',
    address_style: 'city-province',
    cv_length: '2 pages',
    photo_required: false,
    personal_info: 'moderate'
  },
  'singapore': {
    name: 'Singapore',
    phone_format: '+65 XXXX XXXX',
    date_format: 'MM/YYYY',
    address_style: 'district',
    cv_length: '2 pages',
    photo_required: false,
    personal_info: 'moderate'
  },
  'australia': {
    name: 'Australia',
    phone_format: '+61 X XXXX XXXX',
    date_format: 'MM/YYYY',
    address_style: 'city-state',
    cv_length: '2-4 pages',
    photo_required: false,
    personal_info: 'moderate'
  }
};

// Industry-specific customizations
const INDUSTRY_CUSTOMIZATIONS = {
  'technology': {
    keywords: ['innovation', 'scalability', 'digital transformation', 'agile', 'cloud', 'AI/ML'],
    metrics_focus: ['user growth', 'platform scale', 'performance', 'revenue'],
    technical_depth: 'high'
  },
  'finance': {
    keywords: ['risk management', 'compliance', 'fintech', 'regulatory', 'ROI', 'cost optimization'],
    metrics_focus: ['revenue impact', 'cost savings', 'risk reduction', 'compliance'],
    technical_depth: 'moderate'
  },
  'healthcare': {
    keywords: ['patient outcomes', 'HIPAA', 'clinical workflow', 'healthcare technology', 'data privacy'],
    metrics_focus: ['patient satisfaction', 'operational efficiency', 'compliance', 'cost per patient'],
    technical_depth: 'moderate'
  },
  'consulting': {
    keywords: ['strategic planning', 'business transformation', 'change management', 'client success'],
    metrics_focus: ['client satisfaction', 'project success', 'business impact', 'team efficiency'],
    technical_depth: 'strategic'
  },
  'startup': {
    keywords: ['MVP development', 'product-market fit', 'scaling', 'fundraising', 'rapid growth'],
    metrics_focus: ['growth rate', 'user acquisition', 'burn rate', 'funding raised'],
    technical_depth: 'versatile'
  }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, params } = JSON.parse(event.body);

    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    }));

    switch (action) {
      case 'generate-resume':
        return await generateResume(headers, openai, params);
      case 'analyze-job-posting':
        return await analyzeJobPosting(headers, openai, params);
      case 'tailor-resume':
        return await tailorResumeToJob(headers, openai, params);
      case 'get-templates':
        return await getAvailableTemplates(headers);
      case 'optimize-for-ats':
        return await optimizeForATS(headers, openai, params);
      case 'generate-cover-letter':
        return await generateCoverLetter(headers, openai, params);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Resume Generator Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Resume generation failed', details: error.message })
    };
  }
};

async function generateResume(headers, openai, params) {
  const {
    template_type,
    country,
    industry,
    target_role,
    experience_level,
    custom_focus,
    include_projects
  } = params;

  // Get template configuration
  const template = RESUME_TEMPLATES[template_type] || RESUME_TEMPLATES['executive-leadership'];
  const countryFormat = COUNTRY_FORMATS[country] || COUNTRY_FORMATS['us'];
  const industryCustomization = INDUSTRY_CUSTOMIZATIONS[industry] || INDUSTRY_CUSTOMIZATIONS['technology'];

  // Build comprehensive context
  const resumeContext = buildResumeContext(masterProfile, template, industryCustomization, include_projects);

  const prompt = `
    Generate a professional resume for Ravi Poruri based on the following specifications:

    TEMPLATE: ${template.name}
    TARGET ROLE: ${target_role}
    COUNTRY: ${countryFormat.name}
    INDUSTRY: ${industry}
    EXPERIENCE LEVEL: ${experience_level}

    TEMPLATE CONFIGURATION:
    - Focus Areas: ${template.focus.join(', ')}
    - Format Style: ${template.format}
    - Length: ${template.length}
    - Required Sections: ${template.sections.join(', ')}

    COUNTRY FORMATTING:
    - Phone Format: ${countryFormat.phone_format}
    - Date Format: ${countryFormat.date_format}
    - CV Length: ${countryFormat.cv_length}
    - Personal Info Level: ${countryFormat.personal_info}

    INDUSTRY CUSTOMIZATION:
    - Key Keywords: ${industryCustomization.keywords.join(', ')}
    - Metrics Focus: ${industryCustomization.metrics_focus.join(', ')}
    - Technical Depth: ${industryCustomization.technical_depth}

    COMPREHENSIVE PROFILE DATA:
    ${JSON.stringify(resumeContext, null, 2)}

    REQUIREMENTS:
    1. Generate a complete, professional resume optimized for ${target_role}
    2. Use country-specific formatting for ${countryFormat.name}
    3. Emphasize achievements relevant to ${industry} industry
    4. Include specific metrics and quantifiable results
    5. Optimize for ATS (Applicant Tracking Systems)
    6. Maintain professional tone appropriate for ${experience_level} level
    7. Highlight unique differentiators and value propositions
    8. Include relevant keywords for the target role and industry

    CUSTOM FOCUS: ${custom_focus || 'Standard focus based on template'}

    Generate the resume in markdown format with clear sections and professional formatting.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
    temperature: 0.6
  });

  const generatedResume = response.data.choices[0].message.content;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      resume: generatedResume,
      template_used: template.name,
      country_format: countryFormat.name,
      industry_focus: industry,
      optimization_score: calculateOptimizationScore(generatedResume, industryCustomization),
      suggestions: generateImprovementSuggestions(generatedResume, template, industryCustomization),
      timestamp: new Date().toISOString()
    })
  };
}

async function analyzeJobPosting(headers, openai, params) {
  const { job_description, company_info, job_url } = params;

  const prompt = `
    Analyze this job posting and provide detailed insights for Ravi Poruri's application strategy:

    JOB DESCRIPTION:
    ${job_description}

    COMPANY INFO:
    ${company_info || 'Not provided'}

    JOB URL:
    ${job_url || 'Not provided'}

    RAVI'S BACKGROUND:
    ${JSON.stringify(masterProfile, null, 2)}

    ANALYSIS REQUIRED:
    1. Job Requirements Analysis
       - Required skills and qualifications
       - Preferred skills and experience
       - Technical requirements
       - Leadership/management expectations
       - Industry-specific needs

    2. Fit Assessment (1-100 score)
       - Skills alignment
       - Experience relevance
       - Leadership requirements match
       - Technical stack compatibility
       - Industry experience fit

    3. Gap Analysis
       - Missing qualifications
       - Areas needing emphasis
       - Potential concerns
       - Strengths to highlight

    4. Resume Tailoring Strategy
       - Key achievements to emphasize
       - Skills to highlight
       - Experience to feature prominently
       - Metrics to include
       - Keywords to incorporate

    5. Application Strategy
       - Networking approach
       - Interview preparation focus
       - Questions to ask
       - Value proposition to present

    6. Salary and Negotiation Insights
       - Market rate analysis
       - Compensation components
       - Negotiation strategy
       - Benefits considerations

    Provide actionable, specific recommendations based on Ravi's extensive background.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.7
  });

  const analysis = response.data.choices[0].message.content;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      analysis,
      job_info: {
        company: extractCompanyName(job_description),
        role: extractJobTitle(job_description),
        location: extractLocation(job_description),
        experience_level: extractExperienceLevel(job_description)
      },
      next_steps: [
        'Review the fit assessment and gap analysis',
        'Generate tailored resume using the tailoring strategy',
        'Prepare for potential interviews using the preparation focus',
        'Research the company and role for networking opportunities'
      ],
      timestamp: new Date().toISOString()
    })
  };
}

async function tailorResumeToJob(headers, openai, params) {
  const { job_analysis, resume_template, additional_requirements } = params;

  // Extract key requirements from job analysis
  const jobRequirements = extractJobRequirements(job_analysis);
  const template = RESUME_TEMPLATES[resume_template] || RESUME_TEMPLATES['executive-leadership'];

  const prompt = `
    Create a tailored resume for Ravi Poruri specifically optimized for this job opportunity:

    JOB REQUIREMENTS:
    ${JSON.stringify(jobRequirements, null, 2)}

    ADDITIONAL REQUIREMENTS:
    ${additional_requirements || 'None specified'}

    BASE TEMPLATE: ${template.name}

    RAVI'S COMPLETE PROFILE:
    ${JSON.stringify(masterProfile, null, 2)}

    TAILORING REQUIREMENTS:
    1. Reorganize experience to highlight most relevant roles first
    2. Emphasize achievements that directly align with job requirements
    3. Include specific keywords from the job posting
    4. Quantify results using metrics relevant to the target role
    5. Adjust technical skills section to match required technologies
    6. Customize professional summary for the specific opportunity
    7. Prioritize leadership examples that match the scope of the role
    8. Include relevant projects from recent entrepreneurial work

    OPTIMIZATION FOCUS:
    - ATS keyword optimization
    - Relevance scoring for each section
    - Impact statements aligned with job requirements
    - Industry-specific terminology
    - Role-appropriate achievement emphasis

    Generate a complete, tailored resume that maximizes relevance to this specific opportunity.
    Include a relevance score (1-100) for each major section.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
    temperature: 0.6
  });

  const tailoredResume = response.data.choices[0].message.content;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      tailored_resume: tailoredResume,
      job_requirements: jobRequirements,
      relevance_score: calculateJobRelevanceScore(tailoredResume, jobRequirements),
      keyword_optimization: analyzeKeywordOptimization(tailoredResume, jobRequirements),
      improvement_suggestions: generateJobSpecificSuggestions(jobRequirements),
      ats_optimization_score: calculateATSScore(tailoredResume),
      timestamp: new Date().toISOString()
    })
  };
}

async function getAvailableTemplates(headers) {
  const templates = Object.entries(RESUME_TEMPLATES).map(([key, template]) => ({
    id: key,
    name: template.name,
    focus_areas: template.focus,
    format_style: template.format,
    best_for: generateUseCaseDescription(template),
    sections_included: template.sections,
    length_style: template.length
  }));

  const countries = Object.entries(COUNTRY_FORMATS).map(([key, country]) => ({
    id: key,
    name: country.name,
    phone_format: country.phone_format,
    cv_length: country.cv_length,
    photo_required: country.photo_required,
    personal_info_level: country.personal_info
  }));

  const industries = Object.entries(INDUSTRY_CUSTOMIZATIONS).map(([key, industry]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    keywords: industry.keywords,
    metrics_focus: industry.metrics_focus,
    technical_depth: industry.technical_depth
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      resume_templates: templates,
      country_formats: countries,
      industry_customizations: industries,
      popular_combinations: [
        { template: 'executive-leadership', country: 'us', industry: 'technology' },
        { template: 'ai-product-manager', country: 'us', industry: 'technology' },
        { template: 'startup-founder', country: 'us', industry: 'startup' },
        { template: 'technical-architect', country: 'us', industry: 'technology' },
        { template: 'consultant-advisor', country: 'us', industry: 'consulting' }
      ],
      timestamp: new Date().toISOString()
    })
  };
}

async function optimizeForATS(headers, openai, params) {
  const { resume_content, job_keywords } = params;

  const prompt = `
    Optimize this resume for ATS (Applicant Tracking Systems) while maintaining readability:

    ORIGINAL RESUME:
    ${resume_content}

    TARGET JOB KEYWORDS:
    ${job_keywords ? job_keywords.join(', ') : 'General technology leadership keywords'}

    ATS OPTIMIZATION REQUIREMENTS:
    1. Keyword Integration
       - Include relevant keywords naturally in context
       - Use both acronyms and full forms (e.g., "AI" and "Artificial Intelligence")
       - Include skill variations and synonyms

    2. Formatting Optimization
       - Use standard section headers
       - Avoid complex formatting, tables, or graphics
       - Use bullet points effectively
       - Ensure clean, parseable structure

    3. Content Structure
       - Place most important keywords in prominent positions
       - Use action verbs and quantifiable achievements
       - Include relevant technical skills section
       - Optimize professional summary with keywords

    4. Compatibility Checks
       - Remove any characters that could cause parsing issues
       - Use standard fonts and formatting
       - Ensure proper date formats
       - Use consistent formatting throughout

    Provide the optimized resume and an ATS compatibility score (1-100).
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3500,
    temperature: 0.5
  });

  const optimizedResume = response.data.choices[0].message.content;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      optimized_resume: optimizedResume,
      ats_score: calculateATSScore(optimizedResume),
      keyword_analysis: analyzeKeywordDensity(optimizedResume, job_keywords),
      formatting_score: assessFormattingCompatibility(optimizedResume),
      recommendations: generateATSRecommendations(optimizedResume),
      timestamp: new Date().toISOString()
    })
  };
}

async function generateCoverLetter(headers, openai, params) {
  const { job_info, company_research, personal_motivation, resume_highlights } = params;

  const prompt = `
    Generate a compelling cover letter for Ravi Poruri based on this opportunity:

    JOB INFORMATION:
    ${JSON.stringify(job_info, null, 2)}

    COMPANY RESEARCH:
    ${company_research || 'Standard technology company'}

    PERSONAL MOTIVATION:
    ${personal_motivation || 'Interest in technology leadership and innovation'}

    RESUME HIGHLIGHTS TO INCLUDE:
    ${resume_highlights ? resume_highlights.join(', ') : 'Key achievements from master profile'}

    RAVI'S BACKGROUND:
    ${JSON.stringify(masterProfile.career_progression.slice(0, 5), null, 2)}

    COVER LETTER REQUIREMENTS:
    1. Professional yet engaging opening
    2. Specific connection to the company and role
    3. Highlight 2-3 most relevant achievements
    4. Demonstrate understanding of company challenges
    5. Show enthusiasm for the opportunity
    6. Include specific examples with quantifiable results
    7. Professional closing with clear next steps

    TONE: Professional, confident, results-focused
    LENGTH: 3-4 paragraphs, approximately 300-400 words
    STYLE: Executive level, appropriate for senior roles

    Generate a complete cover letter that would compel the hiring manager to interview Ravi.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    temperature: 0.7
  });

  const coverLetter = response.data.choices[0].message.content;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      cover_letter: coverLetter,
      key_points_highlighted: extractKeyPoints(coverLetter),
      personalization_score: calculatePersonalizationScore(coverLetter, job_info),
      suggestions: generateCoverLetterSuggestions(coverLetter),
      timestamp: new Date().toISOString()
    })
  };
}

// Helper functions
function buildResumeContext(profile, template, industry, includeProjects) {
  const context = {
    personal: profile.personal,
    current_ventures: includeProjects ? profile.current_ai_ventures : null,
    career_progression: profile.complete_career_progression.slice(0, 6), // Most recent roles
    key_achievements: profile.quantified_achievements,
    technical_skills: profile.technical_evolution.current_ai_stack,
    recognition: profile.recognition_and_awards,
    speaking: profile.speaking_and_thought_leadership,
    patents: profile.patents_and_innovation
  };

  // Filter based on template focus
  if (template.focus.includes('ai-innovation')) {
    context.ai_projects = profile.current_ai_ventures.products;
  }

  if (template.focus.includes('leadership')) {
    context.leadership_metrics = profile.quantified_achievements.team_leadership;
  }

  return context;
}

function calculateOptimizationScore(resume, industryCustomization) {
  let score = 0;
  const keywords = industryCustomization.keywords;

  // Keyword presence (40 points)
  keywords.forEach(keyword => {
    if (resume.toLowerCase().includes(keyword.toLowerCase())) {
      score += 40 / keywords.length;
    }
  });

  // Quantifiable metrics (30 points)
  const metricPattern = /(\d+([,.]?\d+)*\s*[%$BM+]|\d+\s*(million|billion|percent|years?))/gi;
  const metrics = resume.match(metricPattern) || [];
  score += Math.min(30, metrics.length * 5);

  // Professional formatting (30 points)
  const sections = resume.match(/^#+\s/gm) || [];
  score += Math.min(30, sections.length * 6);

  return Math.round(score);
}

function generateImprovementSuggestions(resume, template, industry) {
  const suggestions = [];

  // Check keyword density
  const keywordCount = industry.keywords.filter(keyword =>
    resume.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  if (keywordCount < industry.keywords.length * 0.7) {
    suggestions.push('Consider including more industry-specific keywords');
  }

  // Check metrics
  const metricPattern = /\d+([,.]?\d+)*\s*[%$BM+]/g;
  const metrics = resume.match(metricPattern) || [];

  if (metrics.length < 5) {
    suggestions.push('Add more quantifiable achievements and metrics');
  }

  // Check for action verbs
  const actionVerbs = ['led', 'built', 'scaled', 'achieved', 'delivered', 'transformed'];
  const verbCount = actionVerbs.filter(verb =>
    resume.toLowerCase().includes(verb)
  ).length;

  if (verbCount < 3) {
    suggestions.push('Use more strong action verbs to describe achievements');
  }

  return suggestions;
}

function extractJobRequirements(jobAnalysis) {
  // Extract key requirements from job analysis
  // This would be more sophisticated in production
  return {
    technical_skills: ['AI/ML', 'Data Platforms', 'Cloud Architecture'],
    leadership_requirements: ['Team Leadership', 'Strategic Planning', 'Cross-functional Collaboration'],
    experience_level: 'Senior Executive',
    industry_knowledge: 'Technology/Software',
    specific_achievements: ['Revenue Growth', 'Platform Scaling', 'Team Building']
  };
}

function calculateJobRelevanceScore(resume, requirements) {
  // Calculate how well the resume matches job requirements
  let score = 0;
  let totalChecks = 0;

  // Check technical skills
  if (requirements.technical_skills) {
    requirements.technical_skills.forEach(skill => {
      totalChecks++;
      if (resume.toLowerCase().includes(skill.toLowerCase())) {
        score += 20;
      }
    });
  }

  // Check leadership requirements
  if (requirements.leadership_requirements) {
    requirements.leadership_requirements.forEach(req => {
      totalChecks++;
      if (resume.toLowerCase().includes(req.toLowerCase())) {
        score += 25;
      }
    });
  }

  return Math.round(score / Math.max(totalChecks, 1));
}

function analyzeKeywordOptimization(resume, requirements) {
  const analysis = {
    technical_keywords: [],
    leadership_keywords: [],
    missing_keywords: [],
    keyword_density: 0
  };

  // Analyze keyword presence and density
  const allKeywords = [
    ...(requirements.technical_skills || []),
    ...(requirements.leadership_requirements || [])
  ];

  const totalWords = resume.split(/\s+/).length;
  let keywordCount = 0;

  allKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = resume.match(regex) || [];
    keywordCount += matches.length;

    if (matches.length > 0) {
      if (requirements.technical_skills?.includes(keyword)) {
        analysis.technical_keywords.push({ keyword, count: matches.length });
      } else {
        analysis.leadership_keywords.push({ keyword, count: matches.length });
      }
    } else {
      analysis.missing_keywords.push(keyword);
    }
  });

  analysis.keyword_density = (keywordCount / totalWords * 100).toFixed(2);

  return analysis;
}

function generateJobSpecificSuggestions(requirements) {
  const suggestions = [];

  if (requirements.technical_skills?.length > 0) {
    suggestions.push(`Emphasize experience with: ${requirements.technical_skills.join(', ')}`);
  }

  if (requirements.leadership_requirements?.length > 0) {
    suggestions.push(`Highlight leadership in: ${requirements.leadership_requirements.join(', ')}`);
  }

  suggestions.push('Include specific metrics related to the target role');
  suggestions.push('Customize professional summary for this opportunity');

  return suggestions;
}

function calculateATSScore(resume) {
  let score = 0;

  // Check for standard section headers (20 points)
  const standardHeaders = ['experience', 'education', 'skills', 'summary'];
  standardHeaders.forEach(header => {
    if (resume.toLowerCase().includes(header)) {
      score += 5;
    }
  });

  // Check for bullet points (20 points)
  const bulletPoints = resume.match(/^\s*[\-\*\•]/gm) || [];
  score += Math.min(20, bulletPoints.length * 2);

  // Check for dates in standard format (20 points)
  const datePattern = /\d{4}\s*[-–]\s*(\d{4}|Present)/g;
  const dates = resume.match(datePattern) || [];
  score += Math.min(20, dates.length * 4);

  // Check for absence of complex formatting (20 points)
  if (!resume.includes('|') && !resume.includes('─') && !resume.includes('│')) {
    score += 20;
  }

  // Check for keywords density (20 points)
  const keywordPattern = /\b(leadership|management|strategy|innovation|technology|data|AI|platform)\b/gi;
  const keywords = resume.match(keywordPattern) || [];
  score += Math.min(20, keywords.length * 2);

  return Math.round(score);
}

function analyzeKeywordDensity(resume, targetKeywords) {
  if (!targetKeywords) return { density: 0, keywords_found: 0 };

  const totalWords = resume.split(/\s+/).length;
  let keywordCount = 0;
  const foundKeywords = [];

  targetKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = resume.match(regex) || [];
    if (matches.length > 0) {
      keywordCount += matches.length;
      foundKeywords.push({ keyword, count: matches.length });
    }
  });

  return {
    density: (keywordCount / totalWords * 100).toFixed(2),
    keywords_found: foundKeywords.length,
    total_keywords: targetKeywords.length,
    found_keywords: foundKeywords
  };
}

function assessFormattingCompatibility(resume) {
  let score = 100;

  // Deduct points for problematic formatting
  if (resume.includes('│') || resume.includes('─') || resume.includes('┌')) score -= 20;
  if (resume.includes('\\t') || resume.includes('\\n\\n\\n')) score -= 10;
  if (resume.match(/\s{5,}/)) score -= 5; // Excessive spacing

  return Math.max(0, score);
}

function generateATSRecommendations(resume) {
  const recommendations = [];

  if (!resume.toLowerCase().includes('summary') && !resume.toLowerCase().includes('objective')) {
    recommendations.push('Add a professional summary section at the top');
  }

  if (!(resume.match(/^\s*[\-\*\•]/gm) || []).length) {
    recommendations.push('Use bullet points to list achievements and responsibilities');
  }

  if (!(resume.match(/\d{4}\s*[-–]\s*(\d{4}|Present)/g) || []).length) {
    recommendations.push('Use consistent date formats (YYYY - YYYY or YYYY - Present)');
  }

  return recommendations;
}

function extractKeyPoints(coverLetter) {
  // Extract key points from cover letter
  const sentences = coverLetter.split(/[.!?]+/);
  return sentences
    .filter(sentence => sentence.length > 50 && sentence.includes('achieved') || sentence.includes('led') || sentence.includes('built'))
    .slice(0, 3)
    .map(sentence => sentence.trim());
}

function calculatePersonalizationScore(coverLetter, jobInfo) {
  let score = 0;

  // Check for company name
  if (jobInfo.company && coverLetter.includes(jobInfo.company)) score += 30;

  // Check for role title
  if (jobInfo.role && coverLetter.includes(jobInfo.role)) score += 25;

  // Check for specific requirements
  if (jobInfo.requirements) {
    jobInfo.requirements.forEach(req => {
      if (coverLetter.toLowerCase().includes(req.toLowerCase())) score += 15;
    });
  }

  return Math.min(100, score);
}

function generateCoverLetterSuggestions(coverLetter) {
  const suggestions = [];

  if (coverLetter.length < 250) {
    suggestions.push('Consider expanding the cover letter with more specific examples');
  }

  if (!coverLetter.includes('$') && !coverLetter.includes('%') && !coverLetter.includes('million')) {
    suggestions.push('Include quantifiable achievements to strengthen your claims');
  }

  if (!coverLetter.toLowerCase().includes('excited') && !coverLetter.toLowerCase().includes('passionate')) {
    suggestions.push('Express more enthusiasm for the opportunity');
  }

  return suggestions;
}

function generateUseCaseDescription(template) {
  const useCases = {
    'executive': 'C-level positions, board roles, senior leadership positions',
    'technical': 'Technical architect, CTO, engineering leadership roles',
    'product': 'Product management, AI/ML product roles, innovation leadership',
    'founder': 'Startup founder, entrepreneur, innovation roles',
    'strategic': 'Strategy consulting, transformation leadership, advisory roles',
    'consulting': 'Management consulting, advisory positions, fractional executive roles'
  };

  return useCases[template.format] || 'General professional roles';
}

function extractCompanyName(jobDescription) {
  // Simple extraction - in production, use more sophisticated NLP
  const companyMatch = jobDescription.match(/at ([A-Z][a-zA-Z\s&]+)(?=\s|,|\.)/);
  return companyMatch ? companyMatch[1].trim() : 'Company Name';
}

function extractJobTitle(jobDescription) {
  const titleMatch = jobDescription.match(/(Senior|Lead|Principal|Director|VP|Chief)?\s*(Product|Engineering|Technology|Data|AI|Software)\s*(Manager|Leader|Director|Engineer|Architect)/i);
  return titleMatch ? titleMatch[0] : 'Technology Role';
}

function extractLocation(jobDescription) {
  const locationMatch = jobDescription.match(/(San Francisco|New York|Seattle|Los Angeles|Austin|Boston|Remote)/i);
  return locationMatch ? locationMatch[0] : 'Location TBD';
}

function extractExperienceLevel(jobDescription) {
  if (jobDescription.toLowerCase().includes('senior') || jobDescription.toLowerCase().includes('lead')) {
    return 'Senior';
  } else if (jobDescription.toLowerCase().includes('principal') || jobDescription.toLowerCase().includes('staff')) {
    return 'Principal/Staff';
  } else if (jobDescription.toLowerCase().includes('director') || jobDescription.toLowerCase().includes('vp')) {
    return 'Executive';
  }
  return 'Mid-level';
}