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

export default function ApprovalPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

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
        title: 'Post Approved & Scheduled!',
        description: 'Gemini Image model generated a visual asset and scheduled the post.',
      });
      fetchWorkflows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval error';
      setError(msg);
      toast({ type: 'error', title: 'Approval Error', description: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate(workflow: WorkflowRun) {
    if (!workflow.ideaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await regenerateDrafts({ idea_id: workflow.ideaId });
      if (!res.success) throw new Error('Regeneration failed');
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
            <p className="mt-1 text-text-muted text-sm">Review, refine, and approve AI draft variants before scheduled delivery.</p>
          </div>
          <Badge variant="warning" size="default">{suspendedWorkflows.length} Pending</Badge>
        </div>

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
                Ideas will appear here after draft generation. Capture an idea in Content Studio or Ideas to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {suspendedWorkflows.map((workflow) => {
              return (
                <Card key={workflow.runId} variant="default" padding="default">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-text-muted mb-1">{workflow.runId}</p>
                      <CardTitle className="text-lg">
                        {workflow.ideaTitle || `Idea ${workflow.ideaId?.substring(0, 8)}`}
                      </CardTitle>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </CardHeader>

                  <CardContent>
                    {workflow.scoredVariants && workflow.scoredVariants.length > 0 && (
                      <div className="space-y-4">
                        <Separator />
                        <h3 className="text-sm font-medium text-text mb-3">Select Draft Variant:</h3>
                        {workflow.scoredVariants.map((variant: DraftVariant, index: number) => {
                          const isSelected = selectedVariantIndex === index;
                          return (
                            <div
                              key={index}
                              className={cn(
                                'rounded-xl border p-4 transition-colors cursor-pointer',
                                isSelected ? 'border-brand bg-brand-muted/40' : 'border-border bg-bg-elevated hover:border-border-muted'
                              )}
                              onClick={() => setSelectedVariantIndex(index)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-text">Variant {index + 1}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="brand" size="sm">{((variant.score || 0) * 100).toFixed(0)}% Score</Badge>
                                  {isSelected && <Badge variant="success" size="sm">Selected</Badge>}
                                </div>
                              </div>
                              <p className="text-sm text-text mb-3 leading-relaxed whitespace-pre-wrap">{variant.text}</p>
                              <div className="flex gap-4 text-xs text-text-muted">
                                <span>Hook: <span className="text-text">{((variant.score_breakdown?.hook_strength ?? 0) * 100).toFixed(0)}%</span></span>
                                <span>Length: <span className="text-text">{((variant.score_breakdown?.length_band ?? 0) * 100).toFixed(0)}%</span></span>
                                <span>CTA: <span className="text-text">{((variant.score_breakdown?.cta_presence ?? 0) * 100).toFixed(0)}%</span></span>
                                <span>Model: <span className="text-brand">{variant.model_used || 'Mastra Engine'}</span></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(workflow)}
                        disabled={loading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Approve & Generate Image Asset
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleRegenerate(workflow)}
                        disabled={loading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                        Regenerate (Max 3)
                      </Button>
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