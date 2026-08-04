'use client';

import { useState } from 'react';

export default function IdeasPage() {
  const [idea, setIdea] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!idea.trim()) {
      setError('Idea cannot be empty');
      return;
    }

    if (idea.length > 500) {
      setError('Idea exceeds maximum length of 500 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, userId: 'current-user' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create idea');
      }

      setStatus(data);
      setIdea('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100">Capture Idea</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-zinc-300 mb-2">
            Your Idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your content idea..."
            maxLength={500}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent resize-none"
            rows={4}
          />
          <p className="text-xs text-zinc-500 mt-1">{idea.length}/500 characters</p>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !idea.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Capture Idea'}
        </button>
      </form>

      {status && (
        <div className="card border-green-900/50">
          <h3 className="text-green-400 font-medium mb-2">✅ Idea Captured</h3>
          <p className="text-sm text-zinc-400">Run ID: {status.runId || 'N/A'}</p>
          <p className="text-sm text-zinc-400">State: {status.state || 'processing'}</p>
        </div>
      )}
    </div>
  );
}