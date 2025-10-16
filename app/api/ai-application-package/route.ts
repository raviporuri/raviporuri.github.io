import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const {
      jobTitle,
      company,
      jobDescription,
      jobUrl,
      location,
      salary,
      source,
      candidateProfile
    } = await request.json()

    if (!jobTitle || !company || !jobDescription || !candidateProfile) {
      return NextResponse.json({
        error: 'Job details and candidate profile are required'
      }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'API configuration missing'
      }, { status: 500 })
    }

    // Dynamic AI prompt generation based on job specifics
    const dynamicPrompt = generateDynamicPrompt(
      jobTitle,
      company,
      jobDescription,
      location,
      salary,
      candidateProfile
    )

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 16000,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: dynamicPrompt
      }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const applicationPackage = JSON.parse(responseText)

      // Enhanced package with additional processing
      const enhancedPackage = await enhanceApplicationPackage(
        applicationPackage,
        { jobTitle, company, jobDescription, location, salary, candidateProfile }
      )

      return NextResponse.json({
        ...enhancedPackage,
        jobDetails: {
          title: jobTitle,
          company: company,
          location: location,
          salary: salary,
          url: jobUrl,
          source: source
        },
        generatedAt: new Date().toISOString()
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)

      // Enhanced fallback with dynamic content
      const fallbackPackage = generateEnhancedFallback(
        jobTitle,
        company,
        jobDescription,
        candidateProfile
      )

      return NextResponse.json(fallbackPackage)
    }

  } catch (error) {
    console.error('Application package generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate application package'
    }, { status: 500 })
  }
}

function generateDynamicPrompt(
  jobTitle: string,
  company: string,
  jobDescription: string,
  location: string,
  salary: string | undefined,
  candidateProfile: any
): string {
  // Extract key requirements from job description
  const isExecutiveRole = /CTO|Chief|VP|Director|Head of|SVP/i.test(jobTitle)
  const isAIRole = /AI|ML|Machine Learning|Artificial Intelligence|Data Science/i.test(jobTitle + ' ' + jobDescription)
  const isStartup = /startup|series|funding|early stage/i.test(jobDescription.toLowerCase())
  const companySize = extractCompanySize(jobDescription)
  const techStack = extractTechStack(jobDescription)
  const leadership = extractLeadershipReqs(jobDescription)

  return `You are an expert executive career strategist, company research analyst, and professional document writer.

MISSION: Generate a comprehensive, industry-standard application package for a senior technology executive, including detailed company research, ATS-optimized resume, compelling cover letter, and complete application strategy.

CANDIDATE PROFILE:
Name: ${candidateProfile.name}
Current Role: ${candidateProfile.currentRole}
Experience: ${candidateProfile.experience}
Core Expertise: ${candidateProfile.expertise.join(', ')}

Key Achievements:
${candidateProfile.achievements.map((achievement: string) => `- ${achievement}`).join('\n')}

TARGET OPPORTUNITY:
Position: ${jobTitle}
Company: ${company}
Location: ${location}
${salary ? `Salary Range: ${salary}` : ''}
Source: Job found via professional search

Job Description Analysis:
${isExecutiveRole ? '🎯 EXECUTIVE LEADERSHIP ROLE - Focus on strategic vision, organizational transformation, and business impact' : ''}
${isAIRole ? '🤖 AI/ML FOCUS - Emphasize AI platform expertise, machine learning at scale, and data-driven decision making' : ''}
${isStartup ? '🚀 STARTUP ENVIRONMENT - Highlight rapid scaling, agility, and hands-on leadership experience' : ''}
${companySize ? `👥 COMPANY SIZE: ${companySize}` : ''}
${techStack ? `⚙️ TECH STACK: ${techStack}` : ''}
${leadership ? `👨‍💼 LEADERSHIP REQUIREMENTS: ${leadership}` : ''}

Full Job Description:
${jobDescription}

COMPANY-SPECIFIC RESEARCH REQUIREMENTS:
Research ${company} specifically and provide:
1. Current business model, mission, and market position
2. Recent news, funding, product launches, or strategic initiatives
3. Company culture, values, and work environment assessment
4. Leadership team analysis and potential hiring managers
5. Competitive landscape and market challenges
6. Growth stage and scaling requirements

DOCUMENT GENERATION REQUIREMENTS:

1. RESUME - Industry-Standard Executive Format:
- ATS-optimized with relevant keywords from job description
- Executive summary (3-4 lines) positioning for this specific role
- Quantified achievements that directly relate to job requirements
- Technical skills section tailored to role needs
- Professional experience with impact metrics
- Format: Clean, professional, executive-level presentation

2. COVER LETTER - Compelling Executive Communication:
- 3-4 paragraphs, 300-350 words
- Opening: Strong hook related to ${company} and ${jobTitle}
- Body: Specific achievements that solve their challenges
- Closing: Clear call to action and next steps
- Tone: Executive confidence with demonstrated value

3. INTERVIEW PREPARATION - Comprehensive Strategy:
- 5 STAR-method stories tailored to role requirements
- Technical discussion points relevant to their tech stack
- Strategic questions demonstrating executive-level thinking
- Salary negotiation approach based on market data

4. APPLICATION STRATEGY - Multi-Channel Approach:
- Optimal application method and timing
- LinkedIn networking strategy with specific contact approach
- Follow-up sequence with value-added touchpoints
- Additional research recommendations

Return ONLY valid JSON with this exact structure:

{
  "jobAnalysis": {
    "relevanceScore": 85,
    "matchStrengths": ["specific strength matching job requirement", "quantified achievement relevant to role", "technical expertise alignment"],
    "potentialConcerns": ["gap or challenge to address", "area requiring explanation"],
    "positioningStrategy": "How to position ${candidateProfile.name} for maximum impact and differentiation"
  },

  "companyResearch": {
    "overview": "Comprehensive 2-3 sentence overview of ${company} - business model, market position, mission",
    "recentNews": ["Recent development 1 with date", "Recent development 2 with date", "Recent development 3 with date"],
    "cultureAndValues": "Assessment of company culture, values, work environment based on research",
    "glassdoorEstimate": {
      "rating": "4.2/5.0",
      "pros": ["Specific pro 1", "Specific pro 2", "Specific pro 3"],
      "cons": ["Specific challenge 1", "Specific challenge 2"],
      "salaryRange": "${salary || 'Estimated range based on role and location'}"
    },
    "hiringManager": {
      "potentialTitles": ["Likely hiring manager titles for this role"],
      "researchTips": "Specific advice for identifying and researching the hiring manager",
      "connectionStrategy": "LinkedIn outreach approach and messaging strategy"
    },
    "competitiveLandscape": "Analysis of ${company}'s competitive position and market challenges"
  },

  "resume": {
    "formattedResume": "Complete ATS-optimized resume in clean text format with proper spacing and structure",
    "professionalSummary": "3-4 line executive summary optimized for this role",
    "keyAchievements": [
      "Quantified achievement 1 directly relevant to ${jobTitle}",
      "Quantified achievement 2 solving their business challenges",
      "Quantified achievement 3 demonstrating required expertise",
      "Quantified achievement 4 showing leadership at scale"
    ],
    "technicalSkills": ["Skill 1 from job description", "Skill 2 from job description", "Skill 3 relevant to role"],
    "workExperience": [
      "COMPANY - TITLE (MM/YYYY - MM/YYYY)\\n• Achievement with metrics relevant to new role\\n• Impact statement addressing job requirements\\n• Leadership accomplishment with quantified results"
    ]
  },

  "coverLetter": {
    "fullText": "Complete 300-350 word cover letter specifically tailored to ${company} and ${jobTitle}",
    "keyPoints": ["Main value proposition 1", "Key differentiator 2", "Specific company connection 3"],
    "customization": "Explanation of how this letter is specifically tailored to ${company} and role requirements"
  },

  "interviewPrep": {
    "starStories": [
      {
        "situation": "Context relevant to ${jobTitle} challenges",
        "task": "What needed to be accomplished",
        "action": "Specific actions ${candidateProfile.name} took",
        "result": "Quantified business impact",
        "relevance": "Why this story matters for ${company} and this role"
      }
    ],
    "technicalDiscussion": ["Technical point 1 relevant to their stack", "Technical point 2 addressing role requirements"],
    "questionsToAsk": [
      "Strategic question about ${company}'s direction",
      "Technical question about their platform/architecture",
      "Leadership question about team and culture",
      "Growth question about scaling challenges",
      "Success metrics question for the role"
    ],
    "salaryNegotiation": {
      "marketData": "Research-based salary insights for ${jobTitle} at ${company} level companies",
      "valueProposition": "Key points highlighting ${candidateProfile.name}'s worth",
      "negotiationApproach": "Recommended strategy for salary discussions"
    }
  },

  "applicationStrategy": {
    "preferredChannel": "Optimal application method for ${company}",
    "linkedinStrategy": "Specific networking approach and connection sequence",
    "followUpPlan": "Timeline and content for follow-up communications",
    "additionalResearch": "Company-specific research recommendations",
    "timeline": ["Day 1: Action", "Day 3: Follow-up", "Week 1: Check-in", "Week 2: Value-add touchpoint"]
  }
}

CRITICAL REQUIREMENTS:
- All content must be specific to ${company} and ${jobTitle}
- Resume must be ATS-optimized with keywords from job description
- Cover letter must reference specific ${company} initiatives or challenges
- Company research must be accurate and current
- All achievements must be quantified with metrics
- Response must be valid JSON only, no additional text`
}

function extractCompanySize(jobDescription: string): string {
  if (/fortune 500|enterprise|large scale|global/i.test(jobDescription)) return 'Large Enterprise'
  if (/startup|early stage|series [abc]/i.test(jobDescription)) return 'Startup/Scale-up'
  if (/mid-size|growing|scale/i.test(jobDescription)) return 'Mid-size'
  return 'Unknown'
}

function extractTechStack(jobDescription: string): string {
  const techTerms = []
  if (/aws|amazon web services/i.test(jobDescription)) techTerms.push('AWS')
  if (/kubernetes|k8s/i.test(jobDescription)) techTerms.push('Kubernetes')
  if (/python/i.test(jobDescription)) techTerms.push('Python')
  if (/react|javascript/i.test(jobDescription)) techTerms.push('React/JavaScript')
  if (/tensorflow|pytorch/i.test(jobDescription)) techTerms.push('ML Frameworks')
  if (/snowflake|databricks/i.test(jobDescription)) techTerms.push('Data Platforms')

  return techTerms.length > 0 ? techTerms.join(', ') : 'Modern tech stack'
}

function extractLeadershipReqs(jobDescription: string): string {
  const requirements = []
  if (/build.*team|hire|recruit/i.test(jobDescription)) requirements.push('Team Building')
  if (/strategy|vision|roadmap/i.test(jobDescription)) requirements.push('Strategic Planning')
  if (/scale|growth|expand/i.test(jobDescription)) requirements.push('Scaling Operations')
  if (/stakeholder|cross.?functional/i.test(jobDescription)) requirements.push('Stakeholder Management')

  return requirements.join(', ')
}

async function enhanceApplicationPackage(
  packageData: any,
  jobContext: any
): Promise<any> {
  // Add industry-standard resume formatting
  if (packageData.resume?.formattedResume) {
    packageData.resume.formattedResume = formatExecutiveResume(
      packageData.resume.formattedResume,
      jobContext.candidateProfile
    )
  }

  // Add professional cover letter formatting
  if (packageData.coverLetter?.fullText) {
    packageData.coverLetter.fullText = formatCoverLetter(
      packageData.coverLetter.fullText,
      jobContext.candidateProfile,
      jobContext.company
    )
  }

  // Add downloadable URLs (would integrate with file generation service)
  packageData.resume.downloadUrl = `/api/generate-resume?format=pdf&job=${encodeURIComponent(jobContext.jobTitle)}`
  packageData.coverLetter.downloadUrl = `/api/generate-cover-letter?format=pdf&company=${encodeURIComponent(jobContext.company)}`

  return packageData
}

function formatExecutiveResume(resumeContent: string, candidateProfile: any): string {
  // Industry-standard executive resume formatting
  return `
${candidateProfile.name.toUpperCase()}
Senior Technology Executive | ${candidateProfile.currentRole}

${resumeContent}

────────────────────────────────────────────────────────────────

Generated by AI Job Application Platform
Professional Resume Template - Executive Level
`.trim()
}

function formatCoverLetter(coverLetterContent: string, candidateProfile: any, company: string): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
${candidateProfile.name}
${candidateProfile.currentRole}
[Your Contact Information]

${today}

Hiring Manager
${company}
[Company Address]

${coverLetterContent}

Sincerely,

${candidateProfile.name}

────────────────────────────────────────────────────────────────
Generated by AI Job Application Platform
Professional Cover Letter Template
`.trim()
}

function generateEnhancedFallback(
  jobTitle: string,
  company: string,
  jobDescription: string,
  candidateProfile: any
): any {
  return {
    jobAnalysis: {
      relevanceScore: 82,
      matchStrengths: [
        `25+ years technology leadership directly applicable to ${jobTitle}`,
        `Proven scaling experience relevant to ${company}'s growth stage`,
        "Track record of $3.2B+ revenue impact demonstrates business value"
      ],
      potentialConcerns: [
        "Need to align specific experience with company's current challenges",
        "Ensure cultural fit assessment during interview process"
      ],
      positioningStrategy: `Position ${candidateProfile.name} as a transformation leader who can scale ${company}'s technology organization while driving significant business growth.`
    },

    companyResearch: {
      overview: `${company} is a technology company operating in the modern digital landscape. Further research needed for specific business model and market position analysis.`,
      recentNews: [
        "Monitor company website and press releases for recent announcements",
        "Check industry publications for mentions of strategic initiatives",
        "Research recent leadership changes or funding rounds"
      ],
      cultureAndValues: `Research ${company}'s culture through employee LinkedIn posts, company blog, and glassdoor reviews. Focus on technology innovation and team collaboration values.`,
      glassdoorEstimate: {
        rating: "4.0/5.0 (estimated)",
        pros: ["Strong technology focus", "Growth opportunities", "Competitive compensation"],
        cons: ["Fast-paced environment", "High performance expectations"],
        salaryRange: "Research current market rates for similar roles"
      },
      hiringManager: {
        potentialTitles: ["VP Engineering", "CTO", "Head of Technology", "Engineering Director"],
        researchTips: `Search LinkedIn for current ${company} employees in leadership roles. Look for recent posts about hiring or team growth.`,
        connectionStrategy: "Connect with engineering leaders, mention shared interests in technology scaling, reference specific company initiatives"
      },
      competitiveLandscape: `Research ${company}'s main competitors and market position. Understand unique value proposition and recent competitive advantages.`
    },

    resume: {
      formattedResume: formatExecutiveResume(
        generateFallbackResume(candidateProfile, jobTitle, company),
        candidateProfile
      ),
      professionalSummary: `Senior technology executive with ${candidateProfile.experience} scaling engineering organizations and delivering $3.2B+ revenue impact. Proven leader in AI/ML platforms, data engineering, and digital transformation with expertise directly applicable to ${jobTitle} requirements.`,
      keyAchievements: [
        `Led technology scaling initiatives directly relevant to ${jobTitle} requirements`,
        "Grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years leading 100+ person global team",
        "Led Dropbox from pre-IPO to successful IPO, doubling revenue from $850M to $1.8B",
        "Currently building AI-first companies with cutting-edge technology platforms"
      ],
      technicalSkills: ["AI/ML Platforms", "Data Engineering", "Cloud Architecture", "Leadership", "Digital Transformation"],
      workExperience: [
        `${candidateProfile.currentRole} (2024-Present)\n• Leading development of AI-powered applications with direct relevance to ${jobTitle}\n• Building next-generation technology platforms with advanced capabilities\n• Creating innovative solutions leveraging cutting-edge technology`
      ]
    },

    coverLetter: {
      fullText: formatCoverLetter(
        generateFallbackCoverLetter(candidateProfile, jobTitle, company),
        candidateProfile,
        company
      ),
      keyPoints: [
        `${candidateProfile.experience} technology leadership with $3.2B+ revenue impact`,
        `Proven track record scaling platforms directly applicable to ${company}`,
        "Current expertise in AI/ML and next-generation technology platforms"
      ],
      customization: `This letter is specifically tailored to ${company} and the ${jobTitle} role, emphasizing relevant scaling experience and technology leadership.`
    },

    interviewPrep: {
      starStories: [
        {
          situation: `${company} type technology platform needed rapid scaling to meet market demand`,
          task: `Transform technology architecture while building high-performing team for ${jobTitle} type role`,
          action: "Led comprehensive platform transformation with focus on scalability and team development",
          result: "Achieved significant growth in platform capabilities and team effectiveness",
          relevance: `Demonstrates ability to handle challenges similar to what ${company} likely faces`
        }
      ],
      technicalDiscussion: ["Technology platform architecture", "Team scaling strategies", "AI/ML platform development"],
      questionsToAsk: [
        `What are the biggest technical challenges facing ${company} currently?`,
        `How does this ${jobTitle} role contribute to ${company}'s technology strategy?`,
        "What would success look like in the first 90 days?",
        `How does ${company}'s engineering culture support innovation?`,
        "What opportunities exist for technical leadership and mentorship?"
      ],
      salaryNegotiation: {
        marketData: `Senior technology leadership roles at ${company} level companies typically range from $400K-$800K+ total compensation`,
        valueProposition: "Proven track record of delivering $3.2B+ revenue impact and scaling technology organizations",
        negotiationApproach: "Focus on total business impact and transformation capabilities rather than just base salary"
      }
    },

    applicationStrategy: {
      preferredChannel: `Direct application to ${company} combined with targeted LinkedIn outreach to hiring manager and team leads`,
      linkedinStrategy: `Research current ${company} team members, connect with 2-3 relevant leaders, mention specific interest in company's technology direction`,
      followUpPlan: "Follow up one week post-application, then bi-weekly with relevant industry insights",
      additionalResearch: `Study recent ${company} announcements, technology blog posts, and competitive positioning`,
      timeline: [
        "Day 1: Submit application and connect with hiring manager on LinkedIn",
        "Day 3: Follow up with personalized message referencing company initiatives",
        "Week 1: Share relevant industry insight or article",
        "Week 2: Check in with additional value-add content"
      ]
    },

    jobDetails: {
      title: jobTitle,
      company: company,
      url: "",
      source: "AI Generated Package"
    },
    generatedAt: new Date().toISOString()
  }
}

function generateFallbackResume(candidateProfile: any, jobTitle: string, company: string): string {
  return `
PROFESSIONAL SUMMARY
Senior technology executive with ${candidateProfile.experience} scaling engineering organizations and delivering $3.2B+ revenue impact. Proven leader in AI/ML platforms, data engineering, and digital transformation with expertise directly applicable to ${jobTitle} at ${company}.

CORE EXPERTISE
${candidateProfile.expertise.join(' • ')}

KEY ACHIEVEMENTS
${candidateProfile.achievements.map((achievement: string) => `• ${achievement}`).join('\n')}

PROFESSIONAL EXPERIENCE

EQUITI VENTURES - Founder & AI Product Leader (2024 - Present)
• Leading development of AI-powered applications using LLMs and computer vision technologies
• Building next-generation AI security platforms with advanced ML capabilities
• Creating AI-native applications leveraging cutting-edge artificial intelligence

CISCO SYSTEMS - Senior Director, CX Platform Engineering (2020 - 2024)
• Grew CX Cloud from MVP to $500M+ ARR serving 4500+ enterprise customers globally
• Led 100+ person organization across data engineering, analytics, and cloud teams
• Achieved 25% increase in annual services revenue and 50% reduction in renewals cycle

DROPBOX - Global Head of Data & BI (2017 - 2020)
• Led company through pre-IPO to successful IPO transition, doubling revenue $850M→$1.8B
• Built enterprise analytics platform on AWS/Snowflake serving 600M+ users globally
• Managed 35+ person global team across data engineering, analytics, and business intelligence

EDUCATION & CERTIFICATIONS
MBA Finance | Bachelor Computer Applications
Oracle Certified Professional | Teradata Certified
Multiple US Provisional Patents - Data Platform Innovations
`.trim()
}

function generateFallbackCoverLetter(candidateProfile: any, jobTitle: string, company: string): string {
  return `
Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With ${candidateProfile.experience} of technology leadership experience and a proven track record of scaling engineering organizations while delivering $3.2B+ in revenue impact, I am excited about the opportunity to contribute to ${company}'s continued growth and innovation.

Throughout my career, I have consistently transformed technology organizations and driven significant business outcomes. At Cisco, I grew the CX Cloud platform from MVP to over $500M ARR in just four years while leading a global team of 100+ engineers. Previously, at Dropbox, I led the company through its pre-IPO to IPO transition, helping double revenue from $850M to $1.8B while serving 600M+ users globally. Currently, as Founder of Equiti Ventures, I'm building AI-first companies that leverage cutting-edge technology.

My expertise in data platforms, AI/ML architecture, and cloud-native solutions, combined with my experience scaling teams and driving digital transformation initiatives, positions me well to excel in this ${jobTitle} role. I am particularly drawn to ${company}'s mission and would welcome the opportunity to discuss how my background in building scalable technology platforms and leading high-performing teams can contribute to your organization's strategic objectives.

Thank you for your consideration. I look forward to hearing from you.
`.trim()
}