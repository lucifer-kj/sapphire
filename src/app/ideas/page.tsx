'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export default function IdeasPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ type: 'error', title: 'Validation Error', description: 'Title and content are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Save local idea record
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, platform: platform || undefined }),
      });
      if (!res.ok) throw new Error('Failed to create idea');
      
      const ideaData = await res.json();
      const ideaId = ideaData.runId || crypto.randomUUID();

      // 2. Trigger n8n webhook integration
      const n8nRes = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          rawContent: `${title}: ${content}`,
          platform: platform || 'linkedin',
        }),
      });

      if (!n8nRes.ok) {
        const errorData = await n8nRes.json();
        toast({
          type: 'warning',
          title: 'Idea Saved (n8n Webhook Warning)',
          description: errorData.error || 'Failed to dispatch to n8n webhook.',
        });
      } else {
        const n8nData = await n8nRes.json();
        toast({
          type: 'success',
          title: 'Idea Saved & n8n Webhook Triggered!',
          description: `Dispatched to n8n webhook (Job ID: ${n8nData.jobId.substring(0, 8)}...)`,
        });
      }

      setTitle('');
      setContent('');
      setPlatform('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save idea';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text">Capture Idea</h1>
          <p className="mt-1 text-text-muted text-sm">Quickly capture and organize content ideas for your pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="default" padding="default">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-text mb-2">Title</label>
                <Input
                  id="title"
                  placeholder="Give your idea a clear, descriptive title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-text mb-2">Content</label>
                <Textarea
                  id="content"
                  placeholder="Describe your idea in detail..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  maxLength={5000}
                />
                <p className="mt-1 text-xs text-text-muted">{content.length}/5000</p>
              </div>
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-text mb-2">Platform (optional)</label>
                <Input
                  id="platform"
                  placeholder="e.g., LinkedIn, Twitter, Blog"
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Idea'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setTitle(''); setContent(''); setPlatform(''); }}>
              Clear
            </Button>
          </div>
        </form>

        <Separator className="my-8" />

        <div>
          <h2 className="font-display text-xl font-semibold text-text mb-4">Recent Ideas</h2>
          <Card variant="default" padding="default">
            <CardContent>
              <p className="text-text-muted text-sm">No ideas yet. Capture your first idea above.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}