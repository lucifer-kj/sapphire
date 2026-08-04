'use client';

import { useState, useEffect } from 'react';

export default function PostDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.id]);

  if (loading) {
    return <div className="text-zinc-500">Loading post...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  if (!post) {
    return <div className="text-zinc-500">Post not found</div>;
  }

  const statusColors = {
    draft: 'badge-gray',
    scheduled: 'badge-amber',
    publishing: 'badge-amber',
    published: 'badge-green',
    failed: 'badge-red',
    cancelled: 'badge-cancelled',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-100">Post Detail</h2>
        <span className={`badge ${statusColors[post.status] || 'badge-gray'}`}>
          {post.status}
        </span>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Post Content</h3>
        <p className="text-zinc-300 draft-text whitespace-pre-wrap">{post.final_text}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Status History</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Created</span>
              <span className="text-zinc-300">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Scheduled For</span>
              <span className="text-zinc-300">
                {post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Published At</span>
              <span className="text-zinc-300">
                {post.published_at ? new Date(post.published_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">LinkedIn URN</span>
              <span className="text-zinc-300 text-xs">{post.linkedin_post_urn || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Engagement</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Likes</span>
              <span className="text-zinc-300">{post.likes || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Comments</span>
              <span className="text-zinc-300">{post.comments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Reposts</span>
              <span className="text-zinc-300">{post.reposts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {post.status === 'failed' && (
        <div className="card border-red-900/50">
          <h4 className="text-sm font-medium text-red-400 mb-2">Failed Post</h4>
          <p className="text-sm text-zinc-400 mb-3">{post.last_error || 'Unknown error'}</p>
          <button className="btn-primary text-sm">Retry</button>
        </div>
      )}
    </div>
  );
}