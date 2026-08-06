'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  summary: {
    totalPostsPublished: number;
    totalLikes: number;
    totalComments: number;
    totalReposts: number;
    avgEngagementRate: number;
  };
  learnedWeights: {
    hook_strength: number;
    length_band: number;
    cta_presence: number;
    historical_topic_performance: number;
    lastReconciledAt: string;
  };
  topPosts: Array<{
    id: string;
    final_text: string;
    platform: string;
    published_at: string;
    likes: number;
    comments: number;
    reposts: number;
    engagementRate: number;
  }>;
  performanceTrends: Array<{
    date: string;
    likes: number;
    comments: number;
    reposts: number;
  }>;
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const res = await response.json();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading analytics';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card variant="default" padding="default">
            <CardContent className="py-12 text-center text-text-muted text-sm">Loading performance analytics...</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { summary, learnedWeights, topPosts, performanceTrends } = data;

  const statCards = [
    { label: 'Published Posts', value: summary.totalPostsPublished.toString(), change: '+4 this week', color: 'text-text' },
    { label: 'Total Likes', value: summary.totalLikes.toLocaleString(), change: '+18%', color: 'text-brand' },
    { label: 'Comments', value: summary.totalComments.toLocaleString(), change: '+24%', color: 'text-info' },
    { label: 'Reposts / Shares', value: summary.totalReposts.toLocaleString(), change: '+12%', color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Engagement Analytics</h1>
            <p className="mt-1 text-text-muted text-sm">Track post performance metrics and view your adaptive learning rubric weights.</p>
          </div>
          <Badge variant="brand" size="default">
            Avg Rate: {summary.avgEngagementRate}%
          </Badge>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <Card key={s.label} variant="default" padding="default">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{s.label}</span>
                <Badge variant="neutral" size="sm">{s.change}</Badge>
              </div>
              <p className={cn('text-3xl font-display font-bold mt-3', s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Performance Trends */}
          <div className="lg:col-span-8 space-y-6">
            <Card variant="default" padding="default">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Weekly Engagement Activity</CardTitle>
                <span className="text-xs text-text-muted">Likes, Comments & Reposts</span>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-end justify-between gap-4 h-48 pt-6 pb-2 border-b border-border">
                  {performanceTrends.map(day => {
                    const total = day.likes + day.comments + day.reposts;
                    const heightPercent = Math.min(100, Math.max(15, (total / 200) * 100));
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full flex justify-center items-end h-full">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[28px] rounded-t-lg bg-brand group-hover:bg-brand-hover transition-all"
                          />
                        </div>
                        <span className="text-xs text-text-muted font-medium">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPosts.map(post => (
                  <div key={post.id} className="rounded-xl bg-bg-elevated border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-text-muted">{post.id}</span>
                      <Badge variant="brand" size="sm">
                        {post.engagementRate}% Rate
                      </Badge>
                    </div>
                    <p className="text-sm text-text leading-relaxed">{post.final_text}</p>
                    <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                      <span>Published {new Date(post.published_at).toLocaleDateString()}</span>
                      <div className="flex gap-4 font-medium text-text">
                        <span>👍 {post.likes}</span>
                        <span>💬 {post.comments}</span>
                        <span>🔄 {post.reposts}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Learned Rubric Weights Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Adaptive Rubric Weights</CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Reconciled automatically by n8n feedback loop based on post performance.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">Hook Strength</span>
                    <span className="text-brand font-bold">{(learnedWeights.hook_strength * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${learnedWeights.hook_strength * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">CTA Quality</span>
                    <span className="text-success font-bold">{(learnedWeights.cta_presence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden">
                    <div className="h-full bg-success" style={{ width: `${learnedWeights.cta_presence * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">Length Optimization</span>
                    <span className="text-info font-bold">{(learnedWeights.length_band * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden">
                    <div className="h-full bg-info" style={{ width: `${learnedWeights.length_band * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">Topic History</span>
                    <span className="text-text font-bold">{(learnedWeights.historical_topic_performance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden">
                    <div className="h-full bg-text-subtle" style={{ width: `${learnedWeights.historical_topic_performance * 100}%` }} />
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="text-[11px] text-text-muted flex justify-between">
                  <span>Last Reconciled</span>
                  <span>{new Date(learnedWeights.lastReconciledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
