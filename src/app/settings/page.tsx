'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [voiceSummary, setVoiceSummary] = useState('Professional tone, medium length, low emoji usage, high question usage');
  const [linkedinStatus, setLinkedinStatus] = useState('connected');
  const [showReconnect, setShowReconnect] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100">Voice Profile & Settings</h2>

      <div className="card">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Voice Profile</h3>
        <p className="text-sm text-zinc-400 mb-4">
          This summary reflects what the system has learned about your writing style from your edits.
        </p>
        <div className="bg-zinc-900 rounded-lg p-4">
          <p className="text-zinc-300">{voiceSummary}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">LinkedIn Connection</h3>
        {linkedinStatus === 'connected' ? (
          <div className="flex items-center gap-3">
            <span className="badge badge-green">Connected</span>
            <span className="text-sm text-zinc-400">Your LinkedIn account is connected and ready to publish.</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="badge badge-red">Disconnected</span>
            <span className="text-sm text-zinc-400">Reconnect your LinkedIn account to enable publishing.</span>
            <button
              onClick={() => setShowReconnect(true)}
              className="btn-primary text-sm"
            >
              Reconnect
            </button>
          </div>
        )}

        {showReconnect && (
          <div className="mt-4 p-4 bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-400 mb-3">Click below to reconnect your LinkedIn account.</p>
            <a href="/api/auth/linkedin/callback" className="btn-primary text-sm">
              Connect LinkedIn
            </a>
          </div>
        )}
      </div>
    </div>
  );
}