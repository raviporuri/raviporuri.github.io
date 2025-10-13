const { Configuration, OpenAIApi } = require('openai');

const profileData = require('../data/profile_master.json');
const experienceData = require('../data/experience/all_experience.json');
const skillsData = require('../data/skills/technical_skills.json');
const achievementsData = require('../data/achievements/metrics_achievements.json');

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
    const { type, params } = JSON.parse(event.body);

    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    }));

    let response;

    switch (type) {
      case 'blog-post':
        response = await generateBlogPost(openai, params);
        break;
      case 'case-study':
        response = await generateCaseStudy(openai, params);
        break;
      case 'personalized-landing':
        response = await generatePersonalizedLanding(openai, params);
        break;
      case 'skills-assessment':
        response = await generateSkillsAssessment(openai, params);
        break;
      case 'resume-template':
        response = await generateResumeTemplate(openai, params);
        break;
      case 'career-prediction':
        response = await generateCareerPrediction(openai, params);
        break;
      case 'networking-pitch':
        response = await generateNetworkingPitch(openai, params);
        break;
      default:
        throw new Error('Invalid content type');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response, timestamp: new Date().toISOString() })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate content', details: error.message })
    };
  }
};

async function generateBlogPost(openai, params) {
  const { topic, audience, length } = params;

  const prompt = `
    Based on Ravi Poruri's extensive experience in ${JSON.stringify(experienceData)}
    and technical skills ${JSON.stringify(skillsData)}, write a ${length}-word blog post
    about "${topic}" targeted at "${audience}".

    Include specific examples from his experience at companies like Cisco, Dropbox, Yahoo, and Chegg.
    Reference his achievements: ${JSON.stringify(achievementsData.technical_milestones.slice(0, 3))}

    Structure: Title, Introduction, 3-4 main sections with real examples, Conclusion with actionable insights.
    Tone: Professional yet accessible, demonstrating deep technical expertise.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: Math.min(length * 2, 4000),
    temperature: 0.7
  });

  return response.data.choices[0].message.content;
}

async function generateCaseStudy(openai, params) {
  const { company, focus } = params;

  const relevantExperience = experienceData.find(exp =>
    exp.company.toLowerCase().includes(company.toLowerCase())
  );

  if (!relevantExperience) {
    throw new Error(`No experience found for company: ${company}`);
  }

  const prompt = `
    Create a detailed case study about Ravi Poruri's work at ${company}, focusing on ${focus}.

    Company Context: ${relevantExperience.description}
    Achievements: ${relevantExperience.achievements?.join(', ') || 'N/A'}
    Revenue Impact: ${relevantExperience.revenue || 'N/A'}
    Team Size: ${relevantExperience.team_size || 'N/A'}

    Additional context from achievements: ${JSON.stringify(achievementsData.revenue_impact.find(r =>
      r.company.toLowerCase().includes(company.toLowerCase())
    ))}

    Structure the case study as:
    1. Challenge & Context
    2. Strategic Approach
    3. Implementation Details
    4. Results & Impact
    5. Key Learnings
    6. Scalability Insights

    Include specific metrics, technologies used, and leadership strategies.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.6
  });

  return response.data.choices[0].message.content;
}

async function generatePersonalizedLanding(openai, params) {
  const { industry, role, company_size, challenges } = params;

  const prompt = `
    Create personalized landing page content for a ${role} at a ${company_size} company in ${industry}.
    They're facing challenges: ${challenges.join(', ')}.

    Based on Ravi's background:
    - ${profileData.professional_summary}
    - Career highlights: ${JSON.stringify(profileData.career_highlights)}
    - Relevant achievements: ${JSON.stringify(achievementsData.scale_achievements)}

    Create sections:
    1. Personalized headline addressing their industry
    2. Relevant experience highlights
    3. Specific value proposition for their challenges
    4. Success stories from similar situations
    5. Call-to-action for consultation

    Tone: Direct, results-focused, industry-specific language.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2500,
    temperature: 0.8
  });

  return response.data.choices[0].message.content;
}

async function generateSkillsAssessment(openai, params) {
  const { category, level, question_count } = params;

  const relevantSkills = skillsData[category];
  if (!relevantSkills) {
    throw new Error(`Invalid skill category: ${category}`);
  }

  const prompt = `
    Create a ${question_count}-question skills assessment for ${category} at ${level} level.

    Based on Ravi's expertise: ${JSON.stringify(relevantSkills)}
    And his technical milestones: ${JSON.stringify(achievementsData.technical_milestones)}

    For each question, provide:
    1. Question text
    2. 4 multiple choice options (A, B, C, D)
    3. Correct answer
    4. Detailed explanation referencing real-world applications
    5. Ravi's relevant experience example

    Questions should test both theoretical knowledge and practical application.
    Include scenarios from enterprise-scale implementations.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
    temperature: 0.5
  });

  return response.data.choices[0].message.content;
}

async function generateResumeTemplate(openai, params) {
  const { target_role, industry, experience_level } = params;

  const prompt = `
    Create a resume template for a ${target_role} in ${industry} with ${experience_level} experience level.

    Base the template on Ravi's successful resume patterns:
    - Structure from: ${JSON.stringify(profileData)}
    - Proven experience format: ${JSON.stringify(experienceData[0])}
    - Achievement quantification: ${JSON.stringify(achievementsData.revenue_impact[0])}

    Provide:
    1. Optimized resume structure
    2. Industry-specific keyword suggestions
    3. Achievement statement templates with [METRIC] placeholders
    4. Skills section organization
    5. ATS-friendly formatting tips
    6. Customization notes for different companies

    Include specific advice for transitioning to ${target_role} from related roles.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.6
  });

  return response.data.choices[0].message.content;
}

async function generateCareerPrediction(openai, params) {
  const { current_role, years_experience, skills, goals } = params;

  const prompt = `
    Analyze career trajectory and provide predictions based on Ravi's career path:

    Ravi's progression: ${experienceData.map(exp => `${exp.company} (${exp.period}): ${exp.title}`).join(' -> ')}

    User's current state:
    - Role: ${current_role}
    - Experience: ${years_experience} years
    - Skills: ${skills.join(', ')}
    - Goals: ${goals.join(', ')}

    Provide analysis:
    1. Career progression probability (next 2-5 years)
    2. Skill gap analysis with specific recommendations
    3. Industry trend alignment
    4. Compensation trajectory predictions
    5. Leadership development pathway
    6. Network expansion strategies
    7. Timeline for goals achievement

    Reference similar patterns from Ravi's experience and current market data.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3500,
    temperature: 0.7
  });

  return response.data.choices[0].message.content;
}

async function generateNetworkingPitch(openai, params) {
  const { target_person, context, goal, platform } = params;

  const prompt = `
    Create a personalized networking pitch for connecting with "${target_person}"
    in context "${context}" with goal "${goal}" on platform "${platform}".

    Leverage Ravi's background:
    - Current role: ${profileData.current_roles[0].title} at ${profileData.current_roles[0].company}
    - Key achievements: ${JSON.stringify(achievementsData.leadership_metrics)}
    - Speaking experience: ${JSON.stringify(achievementsData.speaking_advisory)}
    - Technical expertise: ${Object.keys(skillsData).join(', ')}

    Create different pitch variations:
    1. Initial connection message
    2. Follow-up message
    3. Value proposition statement
    4. Meeting request template
    5. Thank you note template

    Tailor language and approach for ${platform} best practices.
    Include specific mutual value opportunities.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2500,
    temperature: 0.8
  });

  return response.data.choices[0].message.content;
}