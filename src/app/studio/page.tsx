'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { DraftVariant, WorkflowRun } from '@/types';

export default function StudioPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [editingText, setEditingText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchStudioWorkflows();
  }, []);

  async function fetchStudioWorkflows() {
    try {
      const response = await fetch('/api/ideas');
      const data = await response.json();
      const items: WorkflowRun[] = data.workflows || [];
      setWorkflows(items);
      if (items.length > 0 && !selectedWorkflowId) {
        setSelectedWorkflowId(items[0].runId);
        if (items[0].scoredVariants && items[0].scoredVariants.length > 0) {
          setEditingText(items[0].scoredVariants[0].text);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load studio items';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  }

  const activeWorkflow = workflows.find(w => w.runId === selectedWorkflowId) || workflows[0];
  const activeVariants = activeWorkflow?.scoredVariants || [];
  const currentVariant: DraftVariant | undefined = activeVariants[selectedVariantIndex] || activeVariants[0];

  const handleSelectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    if (activeVariants[index]) {
      setEditingText(activeVariants[index].text);
    }
    setIsEditing(false);
  };

  const handleApprove = async () => {
    if (!activeWorkflow) return;
    setActionLoading(true);
    try {
      const textToPublish = isEditing ? editingText : currentVariant?.text || '';
      const response = await fetch(`/api/workflows/${activeWorkflow.runId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve', editedText: textToPublish }),
      });
      if (!response.ok) throw new Error('Failed to approve draft');
      toast({
        type: 'success',
        title: 'Draft Approved & Scheduled!',
        description: 'The selected variant has been approved for publishing.',
      });
      fetchStudioWorkflows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeWorkflow) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: activeWorkflow.ideaId || activeWorkflow.runId,
          rawContent: activeWorkflow.ideaTitle || 'Regenerate social content variant',
          platform: 'linkedin',
        }),
      });
      if (!response.ok) throw new Error('Failed to trigger regeneration');
      const data = await response.json();
      toast({
        type: 'success',
        title: 'n8n Regeneration Triggered',
        description: `Dispatched to n8n workflow (Job ID: ${data.jobId.substring(0, 8)}...)`,
      });
      fetchStudioWorkflows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Regeneration trigger failed';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">Content Studio</h1>
            <p className="mt-1 text-text-muted text-sm">Review AI-generated variants, edit copy, and approve for publishing.</p>
          </div>
          <Badge variant="brand" size="default">
            {workflows.length} Active Workflows
          </Badge>
        </div>

        {loading ? (
          <Card variant="default" padding="default">
            <CardContent className="py-12 text-center text-text-muted text-sm">Loading studio content...</CardContent>
          </Card>
        ) : workflows.length === 0 ? (
          <Card variant="default" padding="default">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <h2 className="text-lg font-medium text-text">No active drafts in studio</h2>
              <p className="mt-1 text-sm text-text-muted max-w-sm mb-4">
                Capture an idea to trigger the n8n AI content generation pipeline.
              </p>
              <Button variant="primary" onClick={() => (window.location.href = '/ideas')}>
                Capture New Idea
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar list of workflows/ideas */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Ideas & Workflows</h2>
              <div className="space-y-3">
                {workflows.map(item => {
                  const isSelected = item.runId === activeWorkflow?.runId;
                  return (
                    <Card
                      key={item.runId}
                      variant="default"
                      padding="default"
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected ? 'border-brand bg-brand-muted/10 shadow-brand' : 'hover:border-border-hover'
                      )}
                      onClick={() => {
                        setSelectedWorkflowId(item.runId);
                        setSelectedVariantIndex(0);
                        if (item.scoredVariants && item.scoredVariants[0]) {
                          setEditingText(item.scoredVariants[0].text);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-text-muted">{item.runId.substring(0, 8)}</span>
                        <Badge
                          variant={
                            item.state === 'completed'
                              ? 'success'
                              : item.state === 'suspended'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {item.state}
                        </Badge>
                      </div>
                      <p className="font-medium text-text text-sm line-clamp-2">
                        {item.ideaTitle || `Workflow ${item.runId.substring(0, 8)}`}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                        <span>{item.scoredVariants?.length || 0} variants</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Main Draft Review & Editing Studio */}
            <div className="lg:col-span-8 space-y-6">
              {activeWorkflow && (
                <Card variant="default" padding="default">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <p className="text-xs text-text-muted font-mono mb-1">Active Workflow: {activeWorkflow.runId}</p>
                      <CardTitle className="text-xl">
                        {activeWorkflow.ideaTitle || 'Social Content Generation'}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={actionLoading}>
                        Regenerate (n8n)
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleApprove} disabled={actionLoading}>
                        Approve & Schedule
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Variant Selector Tabs */}
                    {activeVariants.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium text-text mb-3">Select Variant Angle</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {activeVariants.map((v, idx) => {
                            const isSelected = selectedVariantIndex === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectVariant(idx)}
                                className={cn(
                                  'rounded-xl border p-3 text-left transition-all',
                                  isSelected
                                    ? 'border-brand bg-brand-muted/20 text-brand'
                                    : 'border-border bg-bg-elevated hover:border-border-hover text-text-muted'
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold uppercase">Variant {idx + 1}</span>
                                  <Badge variant="brand" size="sm">
                                    {((v.score || 0.8) * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                <p className="text-xs line-clamp-2">{v.text}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-warning-muted bg-warning-muted/10 p-4 text-warning text-sm">
                        No AI variants generated for this workflow yet. Click &quot;Regenerate (n8n)&quot; to trigger the pipeline.
                      </div>
                    )}

                    <Separator />

                    {/* Variant Score Breakdown Metrics */}
                    {currentVariant && (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg bg-bg-elevated border border-border p-3">
                          <p className="text-xs text-text-muted">Hook Strength</p>
                          <p className="text-lg font-bold text-brand mt-1">
                            {(((currentVariant.score_breakdown?.hook_strength ?? 0.85)) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-bg-elevated border border-border p-3">
                          <p className="text-xs text-text-muted">CTA Quality</p>
                          <p className="text-lg font-bold text-success mt-1">
                            {(((currentVariant.score_breakdown?.cta_presence ?? 0.90)) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-bg-elevated border border-border p-3">
                          <p className="text-xs text-text-muted">Length Optimization</p>
                          <p className="text-lg font-bold text-text mt-1">
                            {(((currentVariant.score_breakdown?.length_band ?? 0.95)) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Draft Text Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-text">Draft Text Copy</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? 'Done Editing' : 'Edit Copy'}
                        </Button>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          rows={8}
                          className="font-sans text-sm leading-relaxed"
                        />
                      ) : (
                        <div className="rounded-xl bg-bg-elevated border border-border p-5 font-sans text-sm text-text leading-relaxed whitespace-pre-wrap">
                          {editingText || currentVariant?.text || 'No draft text available.'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
