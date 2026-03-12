// Rate limiting: simple in-memory store (resets on function cold start)
const requestCounts = new Map();
const RATE_LIMIT = 5; // requests per IP per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];

  // Filter out old requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  // Add new request
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiAPI(base64Image, retries = 3) {
  const apiKey = process.env.GOOGLE_API_KEY;

  const systemPrompt = `You are "The Synesthesia Lens," an AI with synesthesia who hears music when you see images.

Analyze this image and return ONLY a valid JSON object (no markdown, no explanations):

{
  "mood": "2-3 sentence poetic description of the emotional atmosphere",
  "hexColor": "#RRGGBB",
  "soundscape": "1-2 sentence description of what this scene would sound like",
  "vibes": ["vibe1", "vibe2", "vibe3"],
  "soundQuery": "3-5 keyword search phrase for an ambient background sound"
}

Rules:
- hexColor should be the EMOTIONAL dominant color, not pixel average
- soundQuery should be optimized for a sound effects database (e.g., "ambient forest rain", "industrial factory drone", "ethereal space texture", "busy city cafe chatter")
- Always include the word "ambient" or "loop" or "texture" in the soundQuery to ensure it's a background sound.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
    }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If overloaded and we have retries left, wait and retry
      if (data.error?.message?.includes('overloaded') && retries > 0) {
        console.log(`API overloaded, retrying in 2 seconds... (${retries} retries left)`);
        await sleep(2000);
        return callGeminiAPI(base64Image, retries - 1);
      }
      throw new Error(`API Error: ${data.error?.message || response.statusText}`);
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from AI');
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(jsonText);

    return result;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Rate limiting based on IP
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  if (!checkRateLimit(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Rate limit exceeded. You can analyze 5 images per hour. This is a portfolio demo with cost limits.'
      })
    };
  }

  try {
    const { base64Image } = JSON.parse(event.body);

    if (!base64Image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing base64Image in request' })
      };
    }

    // Remove data URL prefix if present
    const cleanBase64 = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const result = await callGeminiAPI(cleanBase64);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
}
