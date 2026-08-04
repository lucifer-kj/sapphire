'use client';

import { useState, useEffect } from 'react';

export default function ApprovalPage() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [decision, setDecision] = useState('');
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

      setSelectedWorkflow(null);
      setEditedText('');
      setDecision('');
      fetchWorkflows();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const suspendedWorkflows = workflows.filter(function(w) { return w.state === 'suspended'; });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100">Approval Gate</h2>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {suspendedWorkflows.length === 0 ? (
        <div className="card">
          <p className="text-zinc-500">No pending approvals. Ideas will appear here after draft generation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suspendedWorkflows.map(function(workflow) {
            return (
              <div key={workflow.runId} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-zinc-200">Workflow: {workflow.runId.substring(0, 8)}...</h3>
                  <span className="badge badge-amber">Pending Review</span>
                </div>

                {workflow.scoredVariants && workflow.scoredVariants.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-medium text-zinc-400">Draft Variants</h4>
                    {workflow.scoredVariants.map(function(variant, index) {
                      return (
                        <div key={index} className="bg-zinc-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-300">Variant {index}</span>
                            <span className="text-sm font-semibold text-accent">{(variant.score * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-sm text-zinc-400 mb-2 draft-text">{variant.text}</p>
                          <div className="flex gap-4 text-xs text-zinc-500">
                            <span>Hook: {(variant.score_breakdown?.hook_strength * 100).toFixed(1)}%</span>
                            <span>Length: {(variant.score_breakdown?.length_band * 100).toFixed(1)}%</span>
                            <span>CTA: {(variant.score_breakdown?.cta_presence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleResume(workflow.runId, 'approve')}
                    disabled={loading}
                    className="btn-primary text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleResume(workflow.runId, 'regenerate')}
                    disabled={loading}
                    className="btn-secondary text-sm"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleResume(workflow.runId, 'reject')}
                    disabled={loading}
                    className="btn-destructive text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}