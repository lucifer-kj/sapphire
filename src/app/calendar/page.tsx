'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDays() {
  const now = new Date();
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
  const [weekDays] = useState(getWeekDays());
  const [currentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  const pipelineItems = [
    { label: 'Ideas awaiting draft generation', status: 'Pending', variant: 'warning' },
    { label: 'Posts waiting to be published', status: 'Scheduled', variant: 'neutral' },
    { label: 'Successfully published posts', status: 'Published', variant: 'success' },
    { label: 'Posts that failed to publish', status: 'Failed', variant: 'error' },
    { label: 'Manually cancelled posts', status: 'Cancelled', variant: 'neutral' },
  ] as const;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Calendar & Pipeline</h1>
            <p className="mt-1 text-text-muted text-sm">Plan and track your content publishing schedule.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">Previous</Button>
            <span className="text-sm font-medium text-text px-3">{currentMonth}</span>
            <Button variant="secondary" size="sm">Next</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="default" padding="none">
              <CardHeader className="px-4 pt-4 pb-0">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => {
                    const today = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={i}
                        className={cn(
                          'rounded-lg border p-3 min-h-[120px] transition-colors',
                          today ? 'border-brand bg-brand-muted/20' : 'border-border bg-bg-elevated'
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-text-muted">{dayNames[i]}</span>
                          <span
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                              today ? 'bg-brand text-bg' : 'text-text'
                            )}
                          >
                            {day.getDate()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {today ? (
                            <div className="rounded-md bg-brand-muted/40 px-2 py-1.5 text-[11px] text-brand">
                              Plan your next post
                            </div>
                          ) : (
                            <div className="text-[11px] text-text-muted/50">No posts scheduled</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineItems.map(item => (
                    <div key={item.status} className="flex items-center gap-3 text-sm">
                      <Badge variant={item.variant as any} size="sm" className="w-24 justify-center">
                        {item.status}
                      </Badge>
                      <span className="text-text-muted">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Upcoming Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-sm text-text-muted">No posts scheduled yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}