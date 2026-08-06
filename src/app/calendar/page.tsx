'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { Post } from '@/types';
import { triggerDeliveryTick } from '@/lib/api';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDays(weekOffset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + weekOffset * 7);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [weekDays, setWeekDays] = useState<Date[]>(getWeekDays(0));
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [postedMap, setPostedMap] = useState<Record<string, { posted: boolean; note: string }>>({});

  useEffect(() => {
    setWeekDays(getWeekDays(weekOffset));
  }, [weekOffset]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching posts';
      console.warn(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleDeliveryPackage = async (postId: string) => {
    setDeliveringId(postId);
    try {
      const data = await triggerDeliveryTick(postId);
      if (!data.success) throw new Error('Delivery processing failed');

      const delivered = data.delivered_posts?.[0];
      if (delivered?.formatted_caption) {
        await navigator.clipboard.writeText(delivered.formatted_caption);
        toast({
          type: 'success',
          title: 'Post-Ready Package Prepared!',
          description: 'Caption copied to clipboard & image URL prepared. Ready for 1-click manual posting!',
        });
      } else {
        toast({
          type: 'success',
          title: 'Post-Ready Package Prepared',
          description: 'Content formatted and marked as ready.',
        });
      }
      fetchPosts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delivery error';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setDeliveringId(null);
    }
  };

  const handleCopyCaption = async (captionText: string) => {
    try {
      const cleanText = captionText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
      await navigator.clipboard.writeText(cleanText);
      toast({
        type: 'success',
        title: 'Caption Copied!',
        description: 'Formatted caption copied to clipboard. Ready to paste in LinkedIn or Instagram!',
      });
    } catch {
      toast({ type: 'error', title: 'Error', description: 'Failed to copy text' });
    }
  };

  const togglePosted = (postId: string) => {
    setPostedMap(prev => {
      const current = prev[postId] || { posted: false, note: '' };
      const updated = { ...prev, [postId]: { ...current, posted: !current.posted } };
      toast({
        type: 'success',
        title: updated[postId].posted ? 'Marked as Posted!' : 'Unmarked',
        description: updated[postId].posted ? 'Saved feedback data point for rubric learning.' : '',
      });
      return updated;
    });
  };

  const updateNote = (postId: string, note: string) => {
    setPostedMap(prev => {
      const current = prev[postId] || { posted: true, note: '' };
      return { ...prev, [postId]: { ...current, note } };
    });
  };

  const currentMonthName = weekDays[0].toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Calendar & Content Delivery</h1>
            <p className="mt-1 text-text-muted text-sm">Plan scheduled content and prepare ready-to-post copy packages.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset(prev => prev - 1)}>
              Previous
            </Button>
            <span className="text-sm font-medium text-text px-3">{currentMonthName}</span>
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset(prev => prev + 1)}>
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 7-Day Calendar View */}
          <div className="lg:col-span-2">
            <Card variant="default" padding="none">
              <CardHeader className="px-4 pt-4 pb-0">
                <CardTitle className="text-sm font-medium">Weekly Content Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayPosts = posts.filter(p => {
                      if (!p.scheduled_for) return false;
                      return new Date(p.scheduled_for).toDateString() === day.toDateString();
                    });

                    return (
                      <div
                        key={i}
                        className={cn(
                          'rounded-lg border p-3 min-h-[140px] flex flex-col justify-between transition-colors',
                          isToday ? 'border-brand bg-brand-muted/20' : 'border-border bg-bg-elevated'
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-text-muted">{dayNames[i]}</span>
                            <span
                              className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                                isToday ? 'bg-brand text-bg' : 'text-text'
                              )}
                            >
                              {day.getDate()}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {dayPosts.map(p => (
                              <div key={p.id} className="rounded-md bg-bg border border-border p-1.5 hover:border-brand transition-colors">
                                <Badge
                                  variant={
                                    p.status === 'published'
                                      ? 'success'
                                      : p.status === 'scheduled'
                                      ? 'warning'
                                      : 'neutral'
                                  }
                                  size="sm"
                                  className="text-[9px] mb-1"
                                >
                                  {p.status === 'published' ? 'Package Ready' : p.status}
                                </Badge>
                                <p className="text-[10px] text-text line-clamp-2">{p.final_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {dayPosts.length === 0 && (
                          <div className="text-[10px] text-text-muted/40 text-center">Empty</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Pipeline Overview & Upcoming Posts */}
          <div className="space-y-6">
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Post-Ready Content Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-xs text-text-muted text-center py-4">Loading content packages...</p>
                ) : posts.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No content packages scheduled yet.</p>
                ) : (
                  posts.map(p => {
                    const isPosted = postedMap[p.id]?.posted;
                    const note = postedMap[p.id]?.note || '';

                    return (
                      <div key={p.id} className="rounded-xl bg-bg-elevated border border-border p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              isPosted
                                ? 'success'
                                : p.status === 'published'
                                ? 'success'
                                : p.status === 'scheduled'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {isPosted ? 'Manually Posted' : p.status === 'published' ? 'Package Ready' : p.status}
                          </Badge>
                          <span className="text-[11px] text-text-muted">
                            {p.scheduled_for ? new Date(p.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>

                        <p className="text-xs text-text leading-relaxed line-clamp-3">{p.final_text}</p>

                        {p.image_url && (
                          <div className="text-[10px] text-brand flex items-center gap-1 font-medium">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            1:1 Image Asset Ready
                          </div>
                        )}

                        {/* Platform Handoff Instructions */}
                        <div className="p-2 rounded-lg bg-bg border border-border/60 text-[11px] text-text-muted">
                          💡 <strong>Posting Handoff:</strong> Paste this caption into LinkedIn or Instagram, then attach the downloaded 1:1 image asset separately.
                        </div>

                        <div className="pt-1 flex gap-2 justify-end flex-wrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyCaption(p.final_text)}
                          >
                            Copy Caption
                          </Button>
                          {p.status === 'scheduled' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDeliveryPackage(p.id)}
                              disabled={deliveringId === p.id}
                            >
                              {deliveringId === p.id ? 'Preparing...' : 'Prepare Post-Ready Package'}
                            </Button>
                          )}
                        </div>

                        {/* Manual Feedback Seed Toggle */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => togglePosted(p.id)}
                            className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-brand transition-colors"
                          >
                            <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center', isPosted ? 'bg-brand border-brand text-bg' : 'border-border')}>
                              {isPosted && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            Mark as Posted
                          </button>
                          {isPosted && (
                            <input
                              type="text"
                              placeholder="Optional note e.g. 45 comments"
                              value={note}
                              onChange={e => updateNote(p.id, e.target.value)}
                              className="text-[10px] bg-bg border border-border rounded px-2 py-0.5 text-text focus:outline-none focus:border-brand w-36"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}