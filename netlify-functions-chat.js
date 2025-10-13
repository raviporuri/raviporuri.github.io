// Save this as netlify/functions/chat.js in your GitHub repository

const profileData = require('./data/profile_master.json');
const experienceData = require('./data/experience/all_experience.json');
const skillsData = require('./data/skills/technical_skills.json');
const achievementsData = require('./data/achievements/metrics_achievements.json');

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const { message } = JSON.parse(event.body);
  
  // Build comprehensive context from all data files
  const COMPREHENSIVE_CONTEXT = `
    RAVI PORURI - COMPREHENSIVE PROFESSIONAL PROFILE
    
    ${JSON.stringify(profileData.personal, null, 2)}
    
    PROFESSIONAL SUMMARY:
    ${profileData.professional_summary}
    
    CAREER HIGHLIGHTS:
    - ${profileData.career_highlights.years_experience} years of experience
    - Led teams up to ${profileData.career_highlights.max_team_size} engineers
    - Managed ${profileData.career_highlights.max_revenue_managed} in revenue
    - Served ${profileData.career_highlights.max_users_served} users
    - Processed ${profileData.career_highlights.max_data_scale}
    
    COMPLETE WORK EXPERIENCE:
    ${experienceData.map(exp => `
    ${exp.company} | ${exp.title} | ${exp.period}
    ${exp.description}
    ${exp.achievements ? '- ' + exp.achievements.join('\n    - ') : ''}
    ${exp.revenue ? `Revenue Impact: ${exp.revenue}` : ''}
    ${exp.team_size ? `Team Size: ${exp.team_size}` : ''}
    `).join('\n')}
    
    TECHNICAL SKILLS:
    ${Object.values(skillsData).map(category => 
      `${category.category}: ${category.skills.join(', ')}`
    ).join('\n')}
    
    KEY ACHIEVEMENTS:
    
    Revenue Impact:
    ${achievementsData.revenue_impact.map(item => 
      `- ${item.company}: ${item.achievement} (${item.period})`
    ).join('\n')}
    
    Scale Achievements:
    ${achievementsData.scale_achievements.map(item => 
      `- ${item.metric}: ${item.value} (${item.context})`
    ).join('\n')}
    
    Technical Milestones:
    ${achievementsData.technical_milestones.map(item => `- ${item}`).join('\n')}
    
    Leadership Metrics:
    ${achievementsData.leadership_metrics.map(item => 
      `- ${item.metric}: ${item.value} (${item.context})`
    ).join('\n')}
    
    Patents & Recognition:
    ${achievementsData.patents_recognition.map(item => 
      `- ${item.type}: ${item.title} (${item.status})`
    ).join('\n')}
    
    Speaking & Advisory Roles:
    ${achievementsData.speaking_advisory.map(item => 
      `- ${item.type}: ${item.event || item.organization} ${item.year ? '(' + item.year + ')' : ''}`
    ).join('\n')}
    
    EDUCATION:
    ${profileData.education.map(edu => 
      `- ${edu.degree} from ${edu.institution}${edu.year ? ' (' + edu.year + ')' : ''}`
    ).join('\n')}
    
    CERTIFICATIONS:
    ${profileData.certifications.join(', ')}
    
    IMPORTANT NOTES FOR RESPONSES:
    1. Only provide information that is explicitly stated in this context
    2. Be specific with dates, numbers, and metrics when available
    3. For questions about specific companies, provide the exact duration worked there
    4. Never make up or assume information not provided above
    5. If asked about something not in this context, politely say you don't have that information
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for Ravi Poruri's professional portfolio website. 
            You have access to his complete professional history from multiple resume versions.
            Answer questions accurately and specifically based ONLY on this verified information:

            ${COMPREHENSIVE_CONTEXT}
            
            Guidelines:
            - Provide specific, accurate answers with exact dates and metrics
            - Example: If asked "How long did Ravi work at Dropbox?", answer "3 years (2017-2020)"
            - Never provide information not explicitly stated in the context
            - For contact requests, mention email: raviporuri@gmail.com or LinkedIn
            - Be professional but conversational`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: data.choices[0].message.content })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get response',
        details: error.message 
      })
    };
  }
};