// Vercel Edge Function สำหรับ FlashFix AI
// วางไฟล์นี้ที่ api/ai.js ใน Vercel project

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // เปลี่ยนเป็น domain ของคุณใน production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    const { system, user } = await req.json();

    // Validate input
    if (!system || !user) {
      return new Response(JSON.stringify({ error: 'Missing system or user parameter' }), {
        status: 400,
        headers,
      });
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API error:', error);
      return new Response(
        JSON.stringify({ error: error.error?.message || 'AI service error' }),
        { status: response.status, headers }
      );
    }

    const data = await response.json();
    
    // Return formatted response
    return new Response(
      JSON.stringify({ content: data.content[0].text }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers }
    );
  }
}
