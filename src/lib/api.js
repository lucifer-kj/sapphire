const API_BASE = '';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export function getIdeas() {
  return apiRequest('/api/ideas');
}

export function createIdea(idea, userId) {
  return apiRequest('/api/ideas', {
    method: 'POST',
    body: JSON.stringify({ idea, userId }),
  });
}

export function resumeWorkflow(runId, decision, editedText = null) {
  return apiRequest(`/api/workflows/${runId}/resume`, {
    method: 'POST',
    body: JSON.stringify({ decision, editedText }),
  });
}

export function getPost(id) {
  return apiRequest(`/api/posts/${id}`);
}

export function updatePost(id, updates) {
  return apiRequest(`/api/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function publishPost(id, finalText) {
  return apiRequest(`/api/posts/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify({ finalText }),
  });
}