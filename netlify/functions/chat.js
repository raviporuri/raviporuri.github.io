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

    const PROFILE_CONTEXT = `
      Ravi Poruri is a technology leader and AI innovator with over 20 years of experience.
      
      Current Role: Founder at Equiti Ventures (2024-Present), developing AI-powered applications
      Also serves as RippleWorks Expert Advisor (2023-Present)
      
      Previous Experience:
      - Senior Director at Cisco Systems (2020-2024) - 4 years
      - Global Head of Data & BI at Dropbox (2017-2020) - 3 years  
      - Director at Chegg (2015-2017) - 2 years
      - Senior Manager at Yahoo (2007-2015) - 8 years
      
      Expertise: AI/ML, Generative AI, Enterprise Architecture, Data Platforms, Cloud Technologies (AWS), Digital Transformation, Team Leadership
      
      Achievements:
      - Filed multiple patents in AI applications
      - Led teams of 100+ engineers
      - Managed multi-million dollar products and budgets
      - Speaker at industry conferences
      - Built platforms serving hundreds of millions of users
      
      Social Impact: RippleWorks Expert providing strategic guidance to social ventures globally
      
      Location: San Francisco Bay Area
      
      Education: Advanced degrees in Computer Science and Business
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for Ravi Poruri's professional portfolio website. Answer questions about Ravi's professional background based on this information: ${PROFILE_CONTEXT}
              
              Important: Be specific and accurate. For example, if asked how many years at Dropbox, say "3 years (2017-2020)" not just give general information.`
            },
            { role: 'user', content: message }
          ],
          max_tokens: 200
        })
      });

      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: data.choices[0].message.content })  // Changed from 'reply' to 'response'
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to get response' })
      };
    }
  };
