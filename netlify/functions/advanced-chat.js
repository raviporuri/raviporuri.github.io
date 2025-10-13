const { Configuration, OpenAIApi } = require('openai');
const comprehensiveProfile = require('../data/comprehensive_profile.json');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { message, type, context, file_data } = JSON.parse(event.body);

    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    }));

    let response;

    switch (type) {
      case 'text':
        response = await handleTextMessage(openai, message, context);
        break;
      case 'voice':
        response = await handleVoiceMessage(openai, message, context);
        break;
      case 'document':
        response = await handleDocumentAnalysis(openai, message, file_data, context);
        break;
      case 'career-advice':
        response = await handleCareerAdvice(openai, message, context);
        break;
      case 'technical-deep-dive':
        response = await handleTechnicalDeepDive(openai, message, context);
        break;
      case 'leadership-insights':
        response = await handleLeadershipInsights(openai, message, context);
        break;
      default:
        response = await handleTextMessage(openai, message, context);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response.text,
        suggestions: response.suggestions || [],
        follow_ups: response.follow_ups || [],
        resources: response.resources || [],
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Advanced Chat Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Advanced chat failed',
        details: error.message
      })
    };
  }
};

async function handleTextMessage(openai, message, context) {
  const systemPrompt = buildComprehensiveSystemPrompt(context);

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: 800,
    temperature: 0.7
  });

  const aiResponse = response.data.choices[0].message.content;

  return {
    text: aiResponse,
    suggestions: generateSmartSuggestions(message, aiResponse),
    follow_ups: generateFollowUps(message),
    resources: generateRelevantResources(message)
  };
}

async function handleVoiceMessage(openai, audioData, context) {
  try {
    // First, transcribe the audio using Whisper
    const transcription = await openai.createTranscription(
      audioData, // This would be the audio file buffer
      'whisper-1'
    );

    const transcribedText = transcription.data.text;

    // Process the transcribed text normally
    const textResponse = await handleTextMessage(openai, transcribedText, context);

    // Generate speech response using TTS
    const speechResponse = await openai.createSpeech({
      model: 'tts-1',
      voice: 'alloy',
      input: textResponse.text
    });

    return {
      text: textResponse.text,
      transcription: transcribedText,
      audio: speechResponse.data, // Base64 encoded audio
      suggestions: textResponse.suggestions,
      follow_ups: textResponse.follow_ups,
      resources: textResponse.resources
    };
  } catch (error) {
    throw new Error(`Voice processing failed: ${error.message}`);
  }
}

async function handleDocumentAnalysis(openai, message, fileData, context) {
  const { filename, content, type } = fileData;

  let analysisPrompt;
  if (type === 'resume') {
    analysisPrompt = `
      Analyze this resume/CV and compare it with Ravi Poruri's career progression:

      Document: ${content}

      Provide insights on:
      1. Career progression patterns
      2. Skills alignment with current market
      3. Suggestions for improvement
      4. Comparison with Ravi's trajectory
      5. Specific recommendations for advancement

      User question: ${message}
    `;
  } else if (type === 'job_description') {
    analysisPrompt = `
      Analyze this job description against Ravi Poruri's background:

      Job Description: ${content}

      Based on Ravi's comprehensive experience: ${JSON.stringify(comprehensiveProfile.career_progression.slice(0, 5))}

      Provide analysis on:
      1. Fit score (1-100)
      2. Matching skills and experience
      3. Gaps to address
      4. Application strategy recommendations
      5. Salary negotiation insights

      User question: ${message}
    `;
  } else {
    analysisPrompt = `
      Analyze this document in the context of Ravi Poruri's expertise:

      Document: ${content}

      Provide professional insights based on his 20+ years of experience in technology leadership.

      User question: ${message}
    `;
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: buildComprehensiveSystemPrompt(context) },
      { role: 'user', content: analysisPrompt }
    ],
    max_tokens: 1200,
    temperature: 0.6
  });

  return {
    text: response.data.choices[0].message.content,
    document_insights: {
      filename,
      type,
      analysis_type: 'comprehensive'
    },
    suggestions: generateDocumentSuggestions(type),
    follow_ups: [
      'Would you like me to create a personalized action plan?',
      'Should I generate a comparison with similar profiles?',
      'Can I suggest specific resources for skill development?'
    ]
  };
}

async function handleCareerAdvice(openai, message, context) {
  const careerPrompt = `
    As Ravi Poruri's AI advisor, provide comprehensive career guidance based on his journey:

    Career Progression: ${JSON.stringify(comprehensiveProfile.career_trajectory_insights)}
    Key Achievements: ${JSON.stringify(comprehensiveProfile.quantified_achievements)}

    User's career question: ${message}

    Provide actionable advice including:
    1. Strategic recommendations
    2. Timeline considerations
    3. Skill development priorities
    4. Network building strategies
    5. Concrete next steps

    Reference specific examples from Ravi's experience where relevant.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: buildComprehensiveSystemPrompt(context) },
      { role: 'user', content: careerPrompt }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });

  return {
    text: response.data.choices[0].message.content,
    suggestions: [
      'Tell me about transitioning to executive roles',
      'How can I build a high-performing team?',
      'What are the key skills for technology leadership?',
      'How do I drive digital transformation?'
    ],
    follow_ups: [
      'Would you like a personalized development plan?',
      'Should I analyze your current career stage?',
      'Can I suggest relevant networking opportunities?'
    ],
    resources: [
      'Leadership development frameworks',
      'Executive coaching recommendations',
      'Industry networking events',
      'Relevant certification programs'
    ]
  };
}

async function handleTechnicalDeepDive(openai, message, context) {
  const technicalPrompt = `
    Provide a technical deep-dive response based on Ravi Poruri's extensive experience:

    Technical Expertise: ${JSON.stringify(comprehensiveProfile.core_competencies.technical)}
    Scale Achievements: ${JSON.stringify(comprehensiveProfile.quantified_achievements.scale_achievements)}

    Technical question: ${message}

    Provide detailed insights including:
    1. Technical architecture considerations
    2. Scalability patterns and solutions
    3. Implementation strategies
    4. Common pitfalls and how to avoid them
    5. Technology stack recommendations
    6. Performance optimization techniques

    Draw from specific examples of building platforms that served 600M+ users and processed 400B+ events.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: buildComprehensiveSystemPrompt(context) },
      { role: 'user', content: technicalPrompt }
    ],
    max_tokens: 1200,
    temperature: 0.6
  });

  return {
    text: response.data.choices[0].message.content,
    suggestions: [
      'How do you scale data platforms to petabyte scale?',
      'What are the key considerations for cloud migration?',
      'How do you implement real-time analytics at scale?',
      'What are the best practices for data governance?'
    ],
    follow_ups: [
      'Would you like architecture diagrams for this solution?',
      'Should I explain the implementation timeline?',
      'Can I suggest specific technology vendors?'
    ],
    resources: [
      'Technical architecture blueprints',
      'Scalability case studies',
      'Technology comparison guides',
      'Implementation best practices'
    ]
  };
}

async function handleLeadershipInsights(openai, message, context) {
  const leadershipPrompt = `
    Share leadership insights based on Ravi's experience managing global teams of 100+ people:

    Leadership Track Record: ${JSON.stringify(comprehensiveProfile.core_competencies.leadership)}
    Team Building Success: <5% voluntary turnover, >80% eSat scores consistently

    Leadership question: ${message}

    Provide guidance on:
    1. Team building and scaling strategies
    2. Cross-functional leadership approaches
    3. Change management techniques
    4. Performance management best practices
    5. Culture transformation methods
    6. Global team coordination

    Include specific examples from building teams from scratch and achieving high retention.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: buildComprehensiveSystemPrompt(context) },
      { role: 'user', content: leadershipPrompt }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });

  return {
    text: response.data.choices[0].message.content,
    suggestions: [
      'How do you build high-performing global teams?',
      'What are the keys to successful digital transformation?',
      'How do you maintain low turnover in tech teams?',
      'What are effective strategies for scaling organizations?'
    ],
    follow_ups: [
      'Would you like a leadership assessment framework?',
      'Should I create a team building playbook?',
      'Can I suggest leadership development resources?'
    ],
    resources: [
      'Leadership frameworks and methodologies',
      'Team assessment tools',
      'Management training programs',
      'Executive coaching recommendations'
    ]
  };
}

function buildComprehensiveSystemPrompt(context) {
  return `
    You are Ravi Poruri's advanced AI assistant with deep knowledge of his comprehensive professional background.

    COMPREHENSIVE PROFILE CONTEXT:
    ${JSON.stringify(comprehensiveProfile, null, 2)}

    CONVERSATION CONTEXT: ${context || 'General professional discussion'}

    CAPABILITIES:
    - Provide detailed insights based on 20+ years of technology leadership experience
    - Reference specific achievements, metrics, and career transitions
    - Offer practical advice based on real-world experience scaling organizations
    - Connect user questions to relevant examples from Ravi's career
    - Provide actionable recommendations with concrete next steps

    RESPONSE GUIDELINES:
    1. Be specific and reference actual achievements and metrics when relevant
    2. Provide actionable insights, not just theoretical advice
    3. Connect answers to real examples from Ravi's experience
    4. Maintain professional tone while being approachable
    5. Offer follow-up questions and suggestions for deeper exploration
    6. When discussing technical topics, reference actual scale and complexity handled
    7. For career advice, reference specific transitions and growth patterns
    8. Include relevant timeframes and context for achievements

    IMPORTANT: Always be accurate about the information provided and don't fabricate details not present in the profile.
  `;
}

function generateSmartSuggestions(userMessage, aiResponse) {
  const messageLower = userMessage.toLowerCase();

  if (messageLower.includes('career') || messageLower.includes('transition')) {
    return [
      'How did you transition from IC to leadership?',
      'What skills are most important for executive roles?',
      'Tell me about your experience with IPOs and high-growth companies',
      'What advice do you have for building teams from scratch?'
    ];
  } else if (messageLower.includes('technical') || messageLower.includes('architecture')) {
    return [
      'How do you approach large-scale system architecture?',
      'What are the key challenges in scaling data platforms?',
      'Tell me about your experience with cloud migrations',
      'How do you implement data governance at scale?'
    ];
  } else if (messageLower.includes('leadership') || messageLower.includes('team')) {
    return [
      'How do you maintain low turnover rates?',
      'What strategies work for global team management?',
      'How do you drive cultural transformation?',
      'What are your approaches to cross-functional leadership?'
    ];
  } else {
    return [
      'Tell me about your most challenging project',
      'How do you approach digital transformation?',
      'What lessons did you learn from building unicorn companies?',
      'What trends do you see in AI and data platforms?'
    ];
  }
}

function generateFollowUps(message) {
  return [
    'Would you like me to elaborate on any specific aspect?',
    'Can I provide more details about implementation strategies?',
    'Should I suggest related resources or reading materials?',
    'Would you like to explore this topic from a different angle?'
  ];
}

function generateRelevantResources(message) {
  const messageLower = message.toLowerCase();

  const resourceMap = {
    'career': [
      'Executive leadership development programs',
      'Technology leadership frameworks',
      'Career transition guides for tech professionals'
    ],
    'technical': [
      'System architecture best practices',
      'Data platform implementation guides',
      'Cloud migration strategies and case studies'
    ],
    'leadership': [
      'Team building methodologies',
      'Cross-functional leadership techniques',
      'Performance management frameworks'
    ],
    'data': [
      'Data governance implementation guides',
      'Analytics platform selection criteria',
      'Big data architecture patterns'
    ]
  };

  for (const [key, resources] of Object.entries(resourceMap)) {
    if (messageLower.includes(key)) {
      return resources;
    }
  }

  return [
    'Technology leadership case studies',
    'Professional development resources',
    'Industry best practices guides'
  ];
}

function generateDocumentSuggestions(documentType) {
  switch (documentType) {
    case 'resume':
      return [
        'How can I improve my resume format?',
        'What achievements should I highlight?',
        'How do I tailor this for executive roles?',
        'What keywords should I include for ATS?'
      ];
    case 'job_description':
      return [
        'What questions should I ask in the interview?',
        'How should I negotiate salary for this role?',
        'What preparation is needed for this position?',
        'How do I demonstrate value in this role?'
      ];
    default:
      return [
        'Can you provide more context on this topic?',
        'What are the key takeaways from this document?',
        'How does this relate to current market trends?',
        'What actions should I take based on this information?'
      ];
  }
}