'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';

import { Post } from '@/types';

const statusMap: Record<string, { label: string; variant: 'neutral' | 'warning' | 'success' | 'error' }> = {
  draft: { label: 'Draft', variant: 'neutral' },
  scheduled: { label: 'Scheduled', variant: 'warning' },
  publishing: { label: 'Publishing', variant: 'warning' },
  published: { label: 'Published', variant: 'success' },
  failed: { label: 'Failed', variant: 'error' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.id]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/retry`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to retry');
      toast({ type: 'success', title: 'Retrying', description: 'Post retry initiated.' });
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry publication';
      toast({ type: 'error', title: 'Error', description: errorMessage });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card variant="default" padding="default">
            <CardContent className="py-12 text-center text-text-muted text-sm">Loading post...</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card variant="default" padding="default">
            <CardContent className="py-12 text-center text-error text-sm">Error: {error}</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card variant="default" padding="default">
            <CardContent className="py-12 text-center text-text-muted text-sm">Post not found</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const status = statusMap[post.status] || { label: post.status, variant: 'neutral' };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Post Detail</h1>
            <p className="mt-1 font-mono text-xs text-text-muted">{post.id}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="space-y-6">
          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{post.final_text}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Created</span>
                    <span className="text-text">{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-text-muted">Scheduled For</span>
                    <span className="text-text">{post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-text-muted">Published At</span>
                    <span className="text-text">{post.published_at ? new Date(post.published_at).toLocaleString() : 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-text-muted flex-shrink-0">LinkedIn URN</span>
                    <span className="text-text text-xs text-right break-all">{post.linkedin_post_urn || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Likes</span>
                    <span className="text-text font-medium">{post.likes || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-text-muted">Comments</span>
                    <span className="text-text font-medium">{post.comments || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-text-muted">Reposts</span>
                    <span className="text-text font-medium">{post.reposts || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {post.status === 'failed' && (
            <Card variant="default" padding="default" className="border-error/30">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-error">Failed Post</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted mb-4">{post.last_error || 'Unknown error'}</p>
                <Button variant="primary" onClick={handleRetry} disabled={retrying}>
                  {retrying ? 'Retrying...' : 'Retry Publication'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}