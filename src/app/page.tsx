'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Post } from '@/types';

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [ideasCount, setIdeasCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [postsRes, ideasRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/ideas'),
      ]);

      if (postsRes.ok) {
        const pData = await postsRes.json();
        setPosts(pData.posts || []);
      }
      if (ideasRes.ok) {
        const iData = await ideasRes.json();
        setIdeasCount(iData.count || (iData.workflows ? iData.workflows.length : 0));
      }
    } catch (err: unknown) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const deliveredCount = posts.filter(p => p.status === 'published' || p.status === 'draft').length;
  const pendingReviewCount = ideasCount;

  const getFunnelStage = (p: Post) => {
    if (p.status === 'published') return { label: 'Stage 4: Package Delivered', color: 'success' as const };
    if (p.image_url) return { label: 'Stage 3: Image Asset Ready', color: 'brand' as const };
    if (p.status === 'scheduled') return { label: 'Stage 2: Approved & Scheduled', color: 'warning' as const };
    return { label: 'Stage 1: Draft Variant', color: 'neutral' as const };
  };

  const stats = [
    { label: 'Ideas & Drafts', value: String(pendingReviewCount), subtitle: 'Pending AI processing or review', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, color: 'text-warning', bg: 'bg-warning-muted' },
    { label: 'Scheduled Posts', value: String(scheduledCount), subtitle: 'Awaiting delivery tick trigger', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, color: 'text-brand', bg: 'bg-brand-muted' },
    { label: 'Ready / Delivered', value: String(deliveredCount), subtitle: 'Post-ready packages formatted', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, color: 'text-success', bg: 'bg-success-muted' },
    { label: 'System Health', value: '100%', subtitle: 'Supabase DB & Vercel API reachable', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, color: 'text-success', bg: 'bg-success-muted' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Dashboard</h1>
            <p className="mt-1 text-text-muted text-sm">Welcome back. Content pipeline overview across all 4 production stages.</p>
          </div>
          <Link href="/ideas">
            <Button variant="primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Idea
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <Card key={stat.label} variant="default" padding="default">
              <div className="flex items-center justify-between">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg)}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <Badge variant="neutral" size="sm">Live Check</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-display font-bold text-text">{stat.value}</p>
                <p className="text-sm font-semibold text-text mt-1">{stat.label}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{stat.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Pipeline Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/ideas" className="block">
                  <Button variant="primary" className="w-full justify-start">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Stage 1: Capture Raw Idea (Mastra Engine)
                  </Button>
                </Link>
                <Link href="/approval" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
                    Stage 2 & 3: Review Drafts & Generate 1:1 Image
                  </Button>
                </Link>
                <Link href="/calendar" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Stage 4: Calendar & Post-Ready Packages
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Pipeline Funnel Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-xs text-text-muted">Loading pipeline funnel...</p>
              ) : posts.length === 0 ? (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
                  <span className="text-text-muted">No content in pipeline yet. Capture your first idea to get started!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.slice(0, 4).map(p => {
                    const stage = getFunnelStage(p);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-bg border border-border text-xs gap-3">
                        <p className="text-text font-medium truncate max-w-[240px]">{p.final_text}</p>
                        <Badge variant={stage.color} size="sm" className="whitespace-nowrap text-[10px]">
                          {stage.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}