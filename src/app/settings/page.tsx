'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [voiceSummary, setVoiceSummary] = useState('Professional tone, medium length, low emoji usage, high question usage');
  const [linkedinStatus, setLinkedinStatus] = useState('connected');
  const [showReconnect, setShowReconnect] = useState(false);
  const [companyName, setCompanyName] = useState('Acme Inc.');
  const [brandKeywords, setBrandKeywords] = useState('AI, SaaS, productivity');

  const handleSave = () => {
    toast({ type: 'success', title: 'Settings Saved', description: 'Your settings have been updated.' });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text">Settings</h1>
          <p className="mt-1 text-text-muted text-sm">Manage your voice profile, brand preferences, and account connections.</p>
        </div>

        <div className="space-y-6">
          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Voice Profile</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                This summary reflects what the system has learned about your writing style from your edits.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-bg-elevated border border-border p-4">
                <p className="text-text leading-relaxed text-sm">{voiceSummary}</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Configure how your brand voice and keywords influence draft generation.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="companyName">Company / Brand Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <div>
                <Label htmlFor="brandKeywords">Brand Keywords</Label>
                <Input
                  id="brandKeywords"
                  value={brandKeywords}
                  onChange={e => setBrandKeywords(e.target.value)}
                  placeholder="Comma-separated keywords"
                />
                <p className="mt-1 text-xs text-text-muted">Separate keywords with commas.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>LinkedIn Connection</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Connect your LinkedIn account to enable automatic publishing.
              </p>
            </CardHeader>
            <CardContent>
              {linkedinStatus === 'connected' ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-sm">
                    in
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text">LinkedIn Account</p>
                    <p className="text-xs text-text-muted">Connected and ready to publish</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted font-bold text-sm">
                    in
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text">LinkedIn Account</p>
                    <p className="text-xs text-text-muted">Reconnect your account to enable publishing</p>
                  </div>
                  <Badge variant="error">Disconnected</Badge>
                  <Button variant="primary" size="sm" onClick={() => setShowReconnect(true)}>
                    Reconnect
                  </Button>
                </div>
              )}

              {showReconnect && (
                <div className="mt-4 rounded-xl bg-bg-elevated border border-border p-4">
                  <p className="text-sm text-text-muted mb-3">
                    Click below to reconnect your LinkedIn account. You'll be redirected to LinkedIn to authorize access.
                  </p>
                  <a
                    href="/api/auth/linkedin/callback"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4V8h4v2a6 6 0 012-2z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    Connect LinkedIn
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}