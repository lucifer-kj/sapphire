'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export default function ApprovalPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [decision, setDecision] = useState('');
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const response = await fetch('/api/ideas');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    }
  }

  async function handleResume(runId, action) {
    setError(null);
    setLoading(true);

    try {
      const body: { runId: string; decision: string; editedText?: string } = { runId, decision: action };
      if (action === 'edit' && editedText) {
        body.editedText = editedText;
      }

      const response = await fetch(`/api/workflows/${runId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resume workflow');
      }

      toast({ type: 'success', title: `Workflow ${action}`, description: 'The workflow was updated successfully.' });
      setSelectedWorkflow(null);
      setEditedText('');
      setDecision('');
      setSelectedVariant(null);
      fetchWorkflows();
    } catch (err) {
      setError(err.message);
      toast({ type: 'error', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  }

  const suspendedWorkflows = workflows.filter(function(w) { return w.state === 'suspended'; });

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Approval Gate</h1>
            <p className="mt-1 text-text-muted text-sm">Review and approve generated drafts before they go live.</p>
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
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-text">No pending approvals</h2>
              <p className="mt-1 text-sm text-text-muted max-w-sm">
                Ideas will appear here after draft generation. Capture an idea to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {suspendedWorkflows.map(function(workflow) {
              return (
                <Card key={workflow.runId} variant="default" padding="default">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-text-muted mb-1">{workflow.runId}</p>
                      <CardTitle className="text-lg">
                        {workflow.ideaTitle || `Workflow ${workflow.runId.substring(0, 8)}`}
                      </CardTitle>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </CardHeader>

                  <CardContent>
                    {workflow.scoredVariants && workflow.scoredVariants.length > 0 && (
                      <div className="space-y-4">
                        <Separator />
                        <h3 className="text-sm font-medium text-text mb-3">Draft Variants</h3>
                        {workflow.scoredVariants.map(function(variant, index) {
                          const isSelected = selectedVariant === index;
                          return (
                            <div
                              key={index}
                              className={cn(
                                'rounded-xl border p-4 transition-colors cursor-pointer',
                                isSelected ? 'border-brand bg-brand-muted/40' : 'border-border bg-bg-elevated hover:border-border-muted'
                              )}
                              onClick={() => setSelectedVariant(isSelected ? null : index)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-text">Variant {index + 1}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="brand" size="sm">{(variant.score * 100).toFixed(1)}% score</Badge>
                                  {isSelected && <Badge variant="success" size="sm">Selected</Badge>}
                                </div>
                              </div>
                              <p className="text-sm text-text-muted mb-3 leading-relaxed">{variant.text}</p>
                              <div className="flex gap-4 text-xs text-text-muted">
                                <span>Hook: <span className="text-text">{(variant.score_breakdown?.hook_strength * 100).toFixed(1)}%</span></span>
                                <span>Length: <span className="text-text">{(variant.score_breakdown?.length_band * 100).toFixed(1)}%</span></span>
                                <span>CTA: <span className="text-text">{(variant.score_breakdown?.cta_presence * 100).toFixed(1)}%</span></span>
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
                        onClick={() => handleResume(workflow.runId, 'approve')}
                        disabled={loading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleResume(workflow.runId, 'regenerate')}
                        disabled={loading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                        Regenerate
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleResume(workflow.runId, 'reject')}
                        disabled={loading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        Reject
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