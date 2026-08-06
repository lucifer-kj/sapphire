'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

type GenerationStep = 'idle' | 'submitting' | 'strategy' | 'drafting' | 'scoring' | 'complete' | 'error';

export default function IdeasPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [step, setStep] = useState<GenerationStep>('idle');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ type: 'error', title: 'Validation Error', description: 'Title and content are required.' });
      return;
    }

    setStep('submitting');

    try {
      // 1. Save local idea record
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, platform: platform || 'linkedin' }),
      });
      if (!res.ok) throw new Error('Failed to create idea');
      
      const ideaData = await res.json();
      const ideaId = ideaData.runId || crypto.randomUUID();

      // Simulate live AI agent progression steps for UX delight
      setStep('strategy');
      await new Promise(r => setTimeout(r, 600));

      setStep('drafting');
      // 2. Trigger AI Engine / Webhook integration
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
          title: 'Idea Saved with Warning',
          description: errorData.error || 'Webhook trigger returned a non-200 response.',
        });
      } else {
        const n8nData = await n8nRes.json();
        setActiveJobId(n8nData.jobId);
      }

      setStep('scoring');
      await new Promise(r => setTimeout(r, 700));

      setStep('complete');
      toast({
        type: 'success',
        title: 'Content OS Pipeline Complete!',
        description: 'Idea processed. Strategic angles & 3 scored variants are ready in the Approval Gate!',
      });

      setTitle('');
      setContent('');
    } catch (err: unknown) {
      setStep('error');
      const msg = err instanceof Error ? err.message : 'Failed to save idea';
      toast({ type: 'error', title: 'Error', description: msg });
    }
  };

  const stepsList = [
    { id: 'strategy', label: '1. Strategy Agent', desc: 'Framing 3 strategic content angles' },
    { id: 'drafting', label: '2. Draft Generator', desc: 'Running Groq / Gemini multi-LLM chain' },
    { id: 'scoring', label: '3. Editor & Scorer', desc: 'Anti-AI pass & dynamic rubric scoring' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-muted border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Mastra Content Pipeline
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-text">Capture Raw Idea</h1>
          <p className="mt-2 text-text-muted text-base">Drop in any article link, rough thought, or topic. AI agents will turn it into 3 scored variants.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Idea Submission Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card variant="default" padding="lg" className="border-border/80 shadow-lg">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="title" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Topic or Working Title</label>
                    <Input
                      id="title"
                      placeholder="e.g. Why AI agentic frameworks are replacing traditional pipelines"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      maxLength={200}
                      className="bg-bg-elevated border-border"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Raw Notes & Details</label>
                    <Textarea
                      id="content"
                      placeholder="Paste rough notes, key insights, target audience points, or links..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      rows={6}
                      maxLength={5000}
                      className="bg-bg-elevated border-border"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] text-text-subtle">Auto-detects language & topic intent</span>
                      <span className="text-[11px] text-text-subtle">{content.length}/5000</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="platform" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Target Platform</label>
                    <select
                      id="platform"
                      value={platform}
                      onChange={e => setPlatform(e.target.value)}
                      className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-brand"
                    >
                      <option value="linkedin">LinkedIn (Professional Post)</option>
                      <option value="twitter">Twitter / X (Thread or Post)</option>
                      <option value="instagram">Instagram (Caption & Carousel)</option>
                    </select>
                  </div>
                </div>
              </Card>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={step !== 'idle' && step !== 'complete' && step !== 'error'}
                  className="font-semibold px-8"
                >
                  {step === 'idle' || step === 'complete' || step === 'error' ? 'Generate 3 Scored Variants' : 'Agent Engine Running...'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setTitle(''); setContent(''); setStep('idle'); }}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </div>

          {/* Live Agent Pipeline Monitor */}
          <div>
            <Card variant="default" padding="default" className="border-border/80 sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-text flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse-slow" />
                  Live Pipeline Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 'idle' ? (
                  <div className="py-6 text-center text-xs text-text-muted">
                    <p>Enter your idea and click <strong className="text-text">Generate</strong> to launch the AI agent pipeline.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stepsList.map(s => {
                      const isActive = step === s.id;
                      const isPast = (step === 'drafting' && s.id === 'strategy') ||
                                     (step === 'scoring' && (s.id === 'strategy' || s.id === 'drafting')) ||
                                     step === 'complete';

                      return (
                        <div
                          key={s.id}
                          className={cn(
                            'p-3 rounded-lg border text-xs transition-all duration-300',
                            isActive ? 'border-brand bg-brand-muted/30 scale-[1.02]' :
                            isPast ? 'border-success/30 bg-success-muted/10' :
                            'border-border/40 bg-bg-elevated/40 opacity-60'
                          )}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className={isActive ? 'text-brand' : isPast ? 'text-success' : 'text-text-muted'}>
                              {s.label}
                            </span>
                            {isPast && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-success"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-text-muted">{s.desc}</p>
                        </div>
                      );
                    })}

                    {step === 'complete' && (
                      <div className="pt-2 animate-fade-in">
                        <Link href="/approval">
                          <Button variant="primary" size="sm" className="w-full">
                            Go to Approval Gate →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}