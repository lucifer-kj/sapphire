const { publishToLinkedIn, getPublishResult } = require('../../../../mastra/agents/publisherTool');

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
    const { postId, finalText } = body || {};

    if (!postId) {
      return new Response(JSON.stringify({ processed: 0, message: 'No due posts found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lockKey = 'post-lock:' + postId;
    const lockAcquired = acquireLock(lockKey);

    if (!lockAcquired) {
      return new Response(JSON.stringify({ postId, status: 'skipped', reason: 'Lock held by another process' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const existingResult = getPublishResult(postId);
      if (existingResult && existingResult.urn) {
        releaseLock(lockKey);
        return new Response(JSON.stringify({ postId, status: 'already_published', urn: existingResult.urn }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const accessToken = decryptToken(process.env.LINKEDIN_ACCESS_TOKEN || '');

      if (!accessToken) {
        releaseLock(lockKey);
        return new Response(JSON.stringify({ postId, status: 'failed', error: 'No LinkedIn access token' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const result = await publishToLinkedIn(postId, finalText, accessToken);

      releaseLock(lockKey);

      if (result.success) {
        return new Response(JSON.stringify({ postId, status: 'published', urn: result.urn }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ postId, status: 'failed', error: result.error }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      releaseLock(lockKey);
      throw error;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function acquireLock(key) {
  return true;
}

function releaseLock(key) {}

function getPublishResult(postId) {
  return null;
}

function decryptToken(encrypted) {
  if (encrypted.startsWith('encrypted:')) {
    return encrypted.substring(10);
  }
  return encrypted;
}

module.exports = { POST };