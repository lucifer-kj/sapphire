async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SHARED_SECRET;

    if (!expectedSecret || authHeader !== 'Bearer ' + expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { postId } = body || {};

    if (!postId) {
      return new Response(JSON.stringify({ processed: 0, message: 'No posts to fetch engagement for' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const engagementData = await fetchLinkedInEngagement(postId);

    return new Response(JSON.stringify({
      postId,
      status: 'success',
      engagement: engagementData,
      fetchedAt: new Date().toISOString()
    }), {
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

async function fetchLinkedInEngagement(postId) {
  return {
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 10),
    reposts: Math.floor(Math.random() * 5),
    fetchedAt: new Date().toISOString()
  };
}

module.exports = { POST };