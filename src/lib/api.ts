import { Post, WorkflowRun, DraftVariant } from '@/types';

const API_BASE = '';

async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  let data: Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  if (!response.ok) {
    const errorMessage = typeof data.error === 'string' ? data.error : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export function getIdeas() {
  return apiRequest<{ workflows: WorkflowRun[]; count: number }>('/api/ideas');
}

export function createIdea(idea: string, userId?: string) {
  return apiRequest<WorkflowRun>('/api/ideas', {
    method: 'POST',
    body: JSON.stringify({ idea, userId }),
  });
}

export function generateContent(params: {
  rawContent: string;
  ideaId?: string;
  imageUrl?: string;
  platform?: string;
  workspaceId?: string;
}) {
  return apiRequest<{
    success: boolean;
    jobId: string;
    ideaId: string;
    status: string;
  }>('/api/content/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function approveVariant(params: {
  idea_id?: string;
  selected_variant_id?: string;
  text: string;
  workspace_id?: string;
  scheduled_for?: string;
}) {
  return apiRequest<{
    success: boolean;
    postId: string;
    post: Post;
    imagePrompt?: string;
  }>('/api/content/resume', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function regenerateDrafts(params: {
  idea_id: string;
  workspace_id?: string;
}) {
  return apiRequest<{
    success: boolean;
    variants: DraftVariant[];
  }>('/api/content/regenerate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function getPost(id: string) {
  return apiRequest<Post>(`/api/posts/${id}`);
}

export function updatePost(id: string, updates: Partial<Post>) {
  return apiRequest<Post>(`/api/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function triggerDeliveryTick(postId?: string) {
  return apiRequest<{
    success: boolean;
    delivered_count: number;
    delivered_posts: Array<{
      id: string;
      status: string;
      formatted_caption: string;
      image_url?: string;
      delivered_at: string;
    }>;
  }>('/api/content/delivery-tick', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId }),
  });
}

