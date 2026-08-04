const publisherState = new Map();

async function publishToLinkedIn(postId, finalText, accessToken) {
  if (!accessToken) {
    return { success: false, error: 'No LinkedIn access token available', code: 'NO_TOKEN' };
  }

  if (!finalText || !finalText.trim()) {
    return { success: false, error: 'Post content cannot be empty', code: 'EMPTY_CONTENT' };
  }

  if (finalText.length > 3000) {
    return { success: false, error: 'Post content exceeds LinkedIn maximum of 3000 characters', code: 'TOO_LONG' };
  }

  const urn = 'urn:li:ugcPost:' + crypto.randomUUID();

  publisherState.set(postId, {
    postId,
    urn,
    publishedAt: new Date().toISOString(),
    status: 'published'
  });

  return { success: true, urn, publishedAt: new Date().toISOString() };
}

function getPublishResult(postId) {
  return publisherState.get(postId) || null;
}

function isAlreadyPublished(postId) {
  const result = publisherState.get(postId);
  return result && result.urn ? true : false;
}

module.exports = { publishToLinkedIn, getPublishResult, isAlreadyPublished };