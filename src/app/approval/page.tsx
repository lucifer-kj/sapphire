'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { WorkflowRun, DraftVariant } from '@/types';
import { approveVariant, regenerateDrafts } from '@/lib/api';

const ANGLE_DESCRIPTIONS: Record<number, { title: string; desc: string }> = {
  0: { title: 'CONTROVERSIAL', desc: 'Opens with a bold claim to spark debate.' },
  1: { title: 'STORY', desc: 'Leads with a personal anecdote.' },
  2: { title: 'FRAMEWORK', desc: 'Structured as a clear, numbered takeaway.' },
};

export default function ApprovalPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStepFour, setActiveStepFour] = useState<boolean>(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [regenCounts, setRegenCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const response = await fetch('/api/ideas');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (err: unknown) {
      console.error('Failed to fetch workflows:', err);
    }
  }

  async function handleApprove(workflow: WorkflowRun) {
    const variants = workflow.scoredVariants || [];
    const selectedVariant = variants[selectedVariantIndex] || variants[0];
    if (!selectedVariant) {
      toast({ type: 'error', title: 'No variant selected', description: 'Please select a draft variant.' });
      return;
    }

    setLoading(true);
    setActiveStepFour(true);
    setError(null);
    try {
      const res = await approveVariant({
        idea_id: workflow.ideaId,
        selected_variant_id: selectedVariant.id,
        text: selectedVariant.text,
      });

      if (!res.success) throw new Error('Approval failed');
      toast({
        type: 'success',
        title: 'Step 4 Complete: Asset Prepared!',
        description: 'Gemini Imagen generated 1:1 image asset & scheduled post-ready package.',
      });
      fetchWorkflows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval error';
      setError(msg);
      toast({ type: 'error', title: 'Approval Error', description: msg });
    } finally {
      setLoading(false);
      setActiveStepFour(false);
    }
  }

  async function handleRegenerate(workflow: WorkflowRun) {
    const ideaId = workflow.ideaId || workflow.runId;
    const currentCount = regenCounts[ideaId] || 0;
    if (currentCount >= 3) {
      toast({
        type: 'warning',
        title: 'Regeneration Limit Reached',
        description: 'Regeneration limit reached for this idea (3/3 used).',
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await regenerateDrafts({ idea_id: ideaId });
      if (!res.success) throw new Error('Regeneration failed');
      
      setRegenCounts(prev => ({ ...prev, [ideaId]: (prev[ideaId] || 0) + 1 }));
      toast({
        type: 'success',
        title: 'Regeneration Complete',
        description: 'New strategic draft variants generated via LLM fallback chain.',
      });
      fetchWorkflows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Regeneration error';
      setError(msg);
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  }

  const suspendedWorkflows = workflows.filter((w: WorkflowRun) => w.state === 'suspended');

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Approval Gate</h1>
            <p className="mt-1 text-text-muted text-sm">Review scored draft variants, select your preferred strategic angle, and trigger 1:1 image generation.</p>
          </div>
          <Badge variant="warning" size="default">{suspendedWorkflows.length} Pending Review</Badge>
        </div>

        {activeStepFour && (
          <div className="mb-6 rounded-xl border border-brand/40 bg-brand-muted/20 p-4 animate-pulse-slow flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-brand animate-ping" />
            <div>
              <p className="text-xs font-semibold text-brand uppercase tracking-wider">Step 4/4: Generating Image Asset</p>
              <p className="text-xs text-text-muted mt-0.5">Gemini Imagen is constructing a structured 1:1 visual asset & uploading to Supabase Storage...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error-muted px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {suspendedWorkflows.length === 0 ? (
          <Card variant="default" padding="default">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-text">No pending approvals</h2>
              <p className="mt-1 text-sm text-text-muted max-w-sm">
                Ideas will appear here after draft generation. Capture an idea on the <strong className="text-text">Ideas</strong> page to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {suspendedWorkflows.map((workflow) => {
              const ideaId = workflow.ideaId || workflow.runId;
              const usedRegens = regenCounts[ideaId] || 0;
              const remainingRegens = Math.max(0, 3 - usedRegens);

              return (
                <Card key={workflow.runId} variant="default" padding="default">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-text-muted mb-1">Idea Run #{ideaId.substring(0, 8)}</p>
                      <CardTitle className="text-lg">
                        {workflow.ideaTitle || `Idea Topic`}
                      </CardTitle>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </CardHeader>

                  <CardContent>
                    {workflow.scoredVariants && workflow.scoredVariants.length > 0 && (
                      <div className="space-y-4">
                        <Separator />
                        <h3 className="text-sm font-semibold text-text mb-3">Select Draft Angle Variant:</h3>
                        {workflow.scoredVariants.map((variant: DraftVariant, index: number) => {
                          const isSelected = selectedVariantIndex === index;
                          const angleInfo = ANGLE_DESCRIPTIONS[index] || { title: `ANGLE ${index + 1}`, desc: 'Custom strategic approach' };

                          const hookScore = (variant.score_breakdown?.hook_strength ?? 0) * 100;
                          const ctaScore = (variant.score_breakdown?.cta_presence ?? 0) * 100;
                          const hookRationale = variant.score_breakdown?.hook_rationale || (hookScore > 60 ? 'Strong opening line' : 'Standard opening line');
                          const ctaRationale = variant.score_breakdown?.cta_rationale || (ctaScore > 60 ? 'Direct closing CTA question' : 'Standard CTA prompt');

                          return (
                            <div
                              key={index}
                              className={cn(
                                'rounded-xl border p-4 transition-all cursor-pointer',
                                isSelected ? 'border-brand bg-brand-muted/40 shadow-brand' : 'border-border bg-bg-elevated hover:border-border-muted'
                              )}
                              onClick={() => setSelectedVariantIndex(index)}
                            >
                              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold font-mono text-brand uppercase tracking-wider">{angleInfo.title}</span>
                                    <Badge variant="brand" size="sm">{((variant.score || 0) * 100).toFixed(0)}% Score</Badge>
                                    {isSelected && <Badge variant="success" size="sm">Selected</Badge>}
                                  </div>
                                  <p className="text-xs text-text-muted mt-0.5 italic">{angleInfo.desc}</p>
                                </div>
                              </div>

                              <p className="text-sm text-text my-3 leading-relaxed whitespace-pre-wrap font-sans">{variant.text}</p>

                              <div className="mt-3 pt-3 border-t border-border/60 space-y-1 text-xs text-text-muted">
                                <div className="flex items-center justify-between">
                                  <span>Hook Strength: <strong className="text-text">{hookScore.toFixed(0)}%</strong> — <span className="text-text-subtle">{hookRationale}</span></span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>CTA Presence: <strong className="text-text">{ctaScore.toFixed(0)}%</strong> — <span className="text-text-subtle">{ctaRationale}</span></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(workflow)}
                        disabled={loading}
                        className="font-semibold"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        Approve & Generate Image Asset (Step 4)
                      </Button>

                      {remainingRegens > 0 ? (
                        <Button
                          variant="secondary"
                          onClick={() => handleRegenerate(workflow)}
                          disabled={loading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                          Regenerate ({remainingRegens} left)
                        </Button>
                      ) : (
                        <span className="text-xs text-warning bg-warning-muted/20 px-3 py-2 rounded-lg border border-warning/30">
                          Regeneration limit reached for this idea (3/3 used)
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}