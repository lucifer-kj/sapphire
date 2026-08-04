const { publishToLinkedIn } = require('../../../../../mastra/agents/publisherTool');

async function POST(request) {
  try {
    const body = await request.json();
    const { postId, finalText } = body;

    if (!postId) {
      return new Response(JSON.stringify({ error: 'postId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!finalText || !finalText.trim()) {
      return new Response(JSON.stringify({ error: 'Post content cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN || '';

    const result = await publishToLinkedIn(postId, finalText, accessToken);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error, code: result.code }), {
        status: result.code === 'NO_TOKEN' ? 401 : 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

module.exports = { POST };