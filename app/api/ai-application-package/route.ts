import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('AI Application Package API called at:', new Date().toISOString())

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

    console.log('Request data:', {
      jobTitle,
      company,
      hasJobDescription: !!jobDescription,
      hasCandidateProfile: !!candidateProfile
    })

    if (!jobTitle || !company || !jobDescription || !candidateProfile) {
      console.log('Missing required fields:', { jobTitle: !!jobTitle, company: !!company, jobDescription: !!jobDescription, candidateProfile: !!candidateProfile })
      return NextResponse.json({
        error: 'Job details and candidate profile are required'
      }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('ANTHROPIC_API_KEY missing')
      return NextResponse.json({
        error: 'API configuration missing'
      }, { status: 500 })
    }

    console.log('ANTHROPIC_API_KEY found, length:', process.env.ANTHROPIC_API_KEY?.length)

    // Dynamic AI prompt generation based on job specifics
    const dynamicPrompt = generateDynamicPrompt(
      jobTitle,
      company,
      jobDescription,
      location,
      salary,
      candidateProfile
    )

    console.log('Creating Anthropic message...')
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: dynamicPrompt
      }]
    })
    console.log('Anthropic response received, processing...')

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('AI response text length:', responseText.length)
    console.log('AI response preview:', responseText.substring(0, 200))

    try {
      // Clean the response text to extract JSON
      let jsonText = responseText.trim()

      // Remove any markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      // Find JSON object boundaries
      const jsonStart = jsonText.indexOf('{')
      const jsonEnd = jsonText.lastIndexOf('}')

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1)
      }

      console.log('Cleaned JSON text preview:', jsonText.substring(0, 300))

      const applicationPackage = JSON.parse(jsonText)

      // Process the cover letter to replace placeholders
      if (applicationPackage.coverLetter?.fullText) {
        applicationPackage.coverLetter.fullText = applicationPackage.coverLetter.fullText
          .replace(/\[POSITION\]/g, jobTitle)
          .replace(/\[COMPANY\]/g, company)
      }

      // Enhanced package with additional processing
      console.log('Parsing successful, enhancing package...')
      const enhancedPackage = await enhanceApplicationPackage(
        applicationPackage,
        { jobTitle, company, jobDescription, location, salary, candidateProfile }
      )
      console.log('Package enhanced successfully')

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
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Full AI response text:', responseText)

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
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({
      error: 'Failed to generate application package',
      details: error instanceof Error ? error.message : 'Unknown error'
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

  return `Generate a comprehensive application package for this job opportunity.

CANDIDATE: ${candidateProfile.name}, ${candidateProfile.currentRole}, ${candidateProfile.experience}
JOB: ${jobTitle} at ${company} (${location})
${salary ? `SALARY: ${salary}` : ''}

EXPERTISE: ${candidateProfile.expertise.join(', ')}
ACHIEVEMENTS: ${candidateProfile.achievements.join(' | ')}

JOB DESCRIPTION:
${jobDescription}

REQUIREMENTS:
1. Generate professional resume and cover letter specifically tailored to this role
2. Create 3-4 relevant external reading links based on unique job requirements and skills mentioned
3. Provide 6-7 behavioral interview questions appropriate for the role seniority level with suggested responses
4. Research role attributes that successful candidates should display based on job requirements
5. Provide interview tips and industry insights specific to this role and company type
6. Search for potential networking contacts at the company in similar or related roles for outreach opportunities
7. Ensure all content is personalized to both the job requirements and candidate profile

For external reading links: Identify 3-4 key technical skills or business domains mentioned in the job description and provide genuine, helpful learning resources.

For behavioral questions: Create questions that test the specific competencies required for this role level and provide strategic response guidance.

For role attributes: Analyze the job description to identify what qualities the ideal candidate should demonstrate.

For networking contacts: Search for 2-3 potential contacts at the company in similar roles (VP Engineering, Director roles, Senior engineers in same department). If you cannot identify specific contacts, skip this section and return an empty array. Include realistic names, titles, and strategic outreach approaches. Focus on people who would be peers, hiring managers, or cross-functional partners.

Return ONLY valid JSON, no other text:

{
  "jobAnalysis": {
    "relevanceScore": 88,
    "matchStrengths": ["25+ years technology leadership directly applicable to role", "Proven platform engineering experience at scale", "Strong background in developer experience and tooling"],
    "potentialConcerns": ["Need to demonstrate specific product management methodologies", "Ensure alignment with company culture during interview"],
    "positioningStrategy": "Position as a technical leader who bridges engineering and product to deliver exceptional developer experiences"
  },
  "companyResearch": {
    "overview": "Leading technology company with strong market position and focus on innovation",
    "recentNews": ["Recent strategic initiatives", "Product launches", "Market expansion"],
    "cultureAndValues": "Innovation-driven culture with emphasis on collaboration and excellence",
    "glassdoorEstimate": {
      "rating": "4.2/5.0",
      "pros": ["Strong technology focus", "Growth opportunities", "Competitive compensation"],
      "cons": ["Fast-paced environment", "High performance expectations"],
      "salaryRange": "Competitive market rates"
    },
    "hiringManager": {
      "potentialTitles": ["VP Engineering", "Director of Product", "Head of Technology"],
      "researchTips": "Research company leadership and recent announcements",
      "connectionStrategy": "Connect with engineering leaders and mention shared interests"
    },
    "competitiveLandscape": "Strong competitive position with focus on innovation and market leadership"
  },
  "resume": {
    "formattedResume": "RAVI PORURI\\nTechnical Product Leader & Platform Engineering Expert\\nEmail: [contact]\\nLinkedIn: [profile]\\n\\nPROFESSIONAL SUMMARY\\nSenior technology executive with 25+ years scaling engineering organizations and delivering exceptional developer experiences. Led $3.2B revenue initiatives at Cisco and Dropbox. Expert in platform engineering, developer tooling, and technical product management with proven track record growing platforms from MVP to $500M+ ARR.\\n\\nCORE COMPETENCIES\\nTechnical Product Management • Platform Engineering • Developer Experience • API Design • Cloud Architecture • Team Leadership • Digital Transformation • Developer Tools\\n\\nPROFESSIONAL EXPERIENCE\\n\\nEQUITI VENTURES - Founder & Technical Product Leader (2024 - Present)\\n• Building developer-focused AI platforms with emphasis on exceptional developer experience\\n• Leading product strategy for next-generation developer tools and platforms\\n• Creating intuitive APIs and SDKs for enterprise AI applications\\n\\nCISCO SYSTEMS - Senior Director, Platform Engineering (2020 - 2024)\\n• Grew CX Cloud platform from MVP to $500M+ ARR serving 4500+ enterprise customers\\n• Led developer experience initiatives improving API adoption by 300%\\n• Built comprehensive developer portal and tooling ecosystem\\n• Managed 100+ person global engineering organization focused on platform excellence\\n\\nDROPBOX - Global Head of Platform & Developer Experience (2017 - 2020)\\n• Led platform strategy during IPO growth phase serving 600M+ users\\n• Launched developer API program with 50,000+ registered developers\\n• Built enterprise-grade developer tools and documentation platforms\\n• Doubled platform adoption through improved developer experience\\n\\nTECHNICAL SKILLS\\nProduct Management: User Research, Roadmapping, Metrics, A/B Testing\\nPlatform Engineering: APIs, SDKs, Developer Tools, Documentation\\nCloud: AWS, Kubernetes, Microservices, CI/CD\\nLeadership: Team Building, Strategy, Cross-functional Collaboration\\n\\nEDUCATION & CERTIFICATIONS\\nMBA Finance | Bachelor Computer Applications\\nProduct Management Certified | Multiple US Patents in Platform Technology",
    "professionalSummary": "Senior technology executive with 25+ years scaling engineering organizations and delivering exceptional developer experiences. Expert in technical product management, platform engineering, and developer tooling with $3.2B+ revenue impact.",
    "keyAchievements": [
      "Grew platform from MVP to $500M+ ARR while leading developer experience initiatives",
      "Launched developer API programs serving 50,000+ registered developers",
      "Led IPO-scale platform strategy serving 600M+ users globally",
      "Currently building next-generation developer-focused AI platforms"
    ]
  },
  "coverLetter": {
    "fullText": "Dear Hiring Manager,\\n\\nI am writing to express my strong interest in the Technical Product Manager, Developer Experience role at [COMPANY]. With 25+ years of technology leadership experience and a proven track record of building exceptional developer experiences at scale, I am excited about the opportunity to contribute to [COMPANY]'s developer platform strategy.\\n\\nThroughout my career, I have consistently focused on creating world-class developer experiences that drive adoption and business growth. At Cisco, I grew the CX Cloud platform from MVP to over $500M ARR while leading developer experience initiatives that improved API adoption by 300%. At Dropbox, I launched and scaled developer API programs serving 50,000+ registered developers during the company's IPO growth phase. Currently, as Founder of Equiti Ventures, I'm building next-generation developer-focused AI platforms with emphasis on intuitive APIs and exceptional developer tooling.\\n\\nMy unique combination of deep technical expertise and product management experience positions me perfectly for this role. I understand both the engineering challenges of building robust platforms and the product requirements for creating delightful developer experiences. My experience includes API design, developer portal creation, comprehensive documentation strategies, and building the metrics and feedback loops necessary to continuously improve developer satisfaction.\\n\\nI am particularly drawn to [COMPANY]'s commitment to developer innovation and would welcome the opportunity to discuss how my background in platform engineering and developer experience can help accelerate your developer platform strategy.\\n\\nThank you for your consideration. I look forward to hearing from you.\\n\\nSincerely,\\nRavi Poruri"
  },
  "interviewPrep": {
    "starStories": [
      {
        "situation": "Platform needed rapid scaling to meet growing demand",
        "task": "Transform architecture while building high-performing team",
        "action": "Led comprehensive platform transformation with focus on scalability",
        "result": "Achieved 300% growth in platform capabilities and user satisfaction",
        "relevance": "Demonstrates ability to handle similar scaling challenges"
      },
      {
        "situation": "Developer adoption was declining due to poor API experience",
        "task": "Redesign developer experience to increase platform adoption",
        "action": "Implemented comprehensive developer portal and improved documentation",
        "result": "Increased developer sign-ups by 250% and API usage by 400%",
        "relevance": "Shows expertise in developer experience optimization"
      }
    ],
    "technicalDiscussion": ["Platform architecture and scalability", "Developer experience optimization", "API design best practices"],
    "questionsToAsk": [
      "What are the biggest technical challenges facing the platform currently?",
      "How does this role contribute to the company's technology strategy?",
      "What would success look like in the first 90 days?",
      "How does the engineering culture support innovation?",
      "What opportunities exist for technical leadership and mentorship?"
    ],
    "externalReadingLinks": [
      {
        "title": "Platform Engineering Best Practices",
        "url": "https://platformengineering.org/blog/platform-engineering-best-practices",
        "description": "Comprehensive guide to modern platform engineering approaches and methodologies",
        "skillArea": "Platform Engineering"
      },
      {
        "title": "Developer Experience: What Actually Matters",
        "url": "https://future.com/developer-experience-what-actually-matters/",
        "description": "Research-backed insights on what makes exceptional developer experiences",
        "skillArea": "Developer Experience"
      },
      {
        "title": "API Design Guidelines for Enterprise Scale",
        "url": "https://cloud.google.com/apis/design",
        "description": "Google's comprehensive API design guide for building scalable systems",
        "skillArea": "API Design"
      }
    ],
    "behavioralQuestions": [
      {
        "question": "Tell me about a time when you had to make a difficult technical decision that impacted the entire organization.",
        "suggestedResponse": "Focus on the Cisco CX Cloud platform decision to migrate to microservices architecture. Explain the analysis process, stakeholder communication, and results ($500M+ ARR impact).",
        "tips": "Emphasize data-driven decision making and cross-functional leadership"
      },
      {
        "question": "Describe a situation where you had to influence without authority to achieve a critical goal.",
        "suggestedResponse": "Discuss the Dropbox developer experience initiative during IPO transition. Highlight coalition building, alignment strategies, and measurable outcomes.",
        "tips": "Show diplomatic skills and ability to build consensus across teams"
      },
      {
        "question": "How do you approach scaling teams and technology simultaneously?",
        "suggestedResponse": "Reference both Cisco (100+ person team) and Dropbox (600M+ users) experiences. Focus on parallel scaling strategies and maintaining quality.",
        "tips": "Demonstrate understanding of Conway's Law and organizational design"
      },
      {
        "question": "Tell me about a time when you failed and what you learned from it.",
        "suggestedResponse": "Share a specific early-career platform decision that required course correction. Focus on learning, adaptation, and improved outcomes.",
        "tips": "Show vulnerability, growth mindset, and resilience"
      },
      {
        "question": "How do you prioritize competing technical initiatives with limited resources?",
        "suggestedResponse": "Explain framework using business impact, technical debt, and strategic alignment. Use specific examples from platform engineering experience.",
        "tips": "Demonstrate analytical thinking and business acumen"
      },
      {
        "question": "Describe your approach to mentoring and developing senior engineers.",
        "suggestedResponse": "Discuss coaching strategies used at Cisco and Dropbox. Focus on career development, technical growth, and leadership pipeline building.",
        "tips": "Show investment in people development and long-term thinking"
      }
    ],
    "salaryNegotiation": {
      "marketData": "Senior technology leadership roles typically range from $400K-$800K+ total compensation",
      "valueProposition": "Proven track record of delivering significant revenue impact and scaling technology organizations",
      "negotiationApproach": "Focus on total business impact and transformation capabilities"
    }
  },
  "applicationStrategy": {
    "preferredChannel": "Direct application combined with targeted LinkedIn outreach",
    "linkedinStrategy": "Research current team members and connect with relevant leaders",
    "followUpPlan": "Follow up one week post-application, then bi-weekly with relevant insights",
    "additionalResearch": "Study recent company announcements and technology blog posts",
    "timeline": [
      "Day 1: Submit application and connect with hiring manager on LinkedIn",
      "Day 3: Follow up with personalized message referencing company initiatives",
      "Week 1: Share relevant industry insight or article",
      "Week 2: Check in with additional value-add content"
    ],
    "roleAttributes": [
      {
        "attribute": "Technical Depth",
        "description": "Deep understanding of platform engineering, API design, and scalable architecture patterns",
        "importance": "Critical for credibility with engineering teams and technical decision-making"
      },
      {
        "attribute": "Product Thinking",
        "description": "Ability to balance technical excellence with business outcomes and user experience",
        "importance": "Essential for prioritization and stakeholder alignment in product roles"
      },
      {
        "attribute": "Leadership Presence",
        "description": "Executive communication skills and ability to influence across organizational levels",
        "importance": "Required for senior roles involving cross-functional collaboration and strategic initiatives"
      },
      {
        "attribute": "Data-Driven Mindset",
        "description": "Track record of using metrics and analytics to drive decisions and measure success",
        "importance": "Modern tech companies expect quantitative approach to product and platform optimization"
      }
    ],
    "interviewTips": [
      "Prepare specific metrics and business impact numbers for each major initiative",
      "Practice explaining technical concepts to non-technical stakeholders clearly",
      "Research the company's current platform challenges and come with thoughtful questions",
      "Demonstrate knowledge of industry trends and competitive landscape",
      "Show examples of how you've built and scaled high-performing teams",
      "Be ready to discuss both successes and failures with equal detail and learning"
    ],
    "industryInsights": [
      "Platform engineering is evolving towards self-service developer experiences with embedded security and observability",
      "Companies are increasingly focusing on developer productivity metrics and internal platform adoption rates",
      "AI-assisted development tools are becoming standard, requiring platform leaders to integrate AI capabilities",
      "Multi-cloud and hybrid strategies are driving demand for platform abstraction and standardization",
      "Developer experience is now recognized as a competitive advantage for technology companies"
    ],
    "networkingContacts": [
      {
        "name": "Sarah Chen",
        "title": "VP of Engineering",
        "department": "Engineering",
        "linkedinProfile": "https://linkedin.com/in/sarahchen-tech",
        "connectionReason": "Similar background in platform engineering and developer experience",
        "outreachStrategy": "Connect with message about shared interest in platform scaling challenges",
        "roleRelevance": "Direct reporting relationship - likely hiring manager or influential in decision"
      },
      {
        "name": "Michael Rodriguez",
        "title": "Senior Director, Product Engineering",
        "department": "Product",
        "linkedinProfile": "https://linkedin.com/in/michael-rodriguez-product",
        "connectionReason": "Cross-functional collaboration experience in product and engineering",
        "outreachStrategy": "Share insight about developer experience trends and platform optimization",
        "roleRelevance": "Cross-functional partner who would work closely with this role"
      }
    ]
  }
}`
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
  // Clean professional resume formatting without AI footers
  return resumeContent.trim()
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
  const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With ${candidateProfile.experience} of technology leadership experience and a proven track record of scaling engineering organizations while delivering $3.2B+ in revenue impact, I am excited about the opportunity to contribute to ${company}'s continued growth and innovation.

Throughout my career, I have consistently transformed technology organizations and driven significant business outcomes. At Cisco, I grew the CX Cloud platform from MVP to over $500M ARR in just four years while leading a global team of 100+ engineers. Previously, at Dropbox, I led the company through its pre-IPO to IPO transition, helping double revenue from $850M to $1.8B while serving 600M+ users globally. Currently, as Founder of Equiti Ventures, I'm building AI-first companies that leverage cutting-edge technology.

My expertise in data platforms, AI/ML architecture, and cloud-native solutions, combined with my experience scaling teams and driving digital transformation initiatives, positions me well to excel in this ${jobTitle} role. I am particularly drawn to ${company}'s mission and would welcome the opportunity to discuss how my background in building scalable technology platforms and leading high-performing teams can contribute to your organization's strategic objectives.

Thank you for your consideration. I look forward to hearing from you.

Sincerely,
${candidateProfile.name}`.trim()

  console.log('Generated cover letter for', company, ':', coverLetter.substring(0, 200) + '...')
  return coverLetter
}