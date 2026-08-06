'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { BrandProfile } from '@/types';

export default function SettingsPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('Acme Inc.');
  const [persona, setPersona] = useState('Professional Thought Leader');
  const [tone, setTone] = useState('Informative, engaging, approachable');
  const [brandKeywords, setBrandKeywords] = useState('AI, SaaS, productivity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBrandProfile();
  }, []);

  async function fetchBrandProfile() {
    try {
      const res = await fetch('/api/brand');
      if (!res.ok) throw new Error('Failed to fetch brand settings');
      const data = await res.json();
      const profile: BrandProfile = data.profile;
      if (profile) {
        setCompanyName(profile.company_name || 'Acme Inc.');
        setPersona(profile.persona || 'Thought Leader');
        setTone(profile.tone || 'Professional');
        setBrandKeywords((profile.topics || ['AI', 'SaaS']).join(', '));
      }
    } catch (err: unknown) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const topicsArray = brandKeywords.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          persona,
          tone,
          topics: topicsArray,
        }),
      });

      if (!res.ok) throw new Error('Failed to save settings');
      toast({ type: 'success', title: 'Settings Saved', description: 'Your brand persona & settings have been updated.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text">Settings</h1>
          <p className="mt-1 text-text-muted text-sm">Manage your brand persona, tone preferences, and AI learning rules.</p>
        </div>

        <div className="space-y-6">
          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Learned Voice Summary</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Reflects edit patterns analyzed by n8n feedback loops from your approved content.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-bg-elevated border border-border p-4 space-y-2 text-sm text-text">
                <div className="flex justify-between">
                  <span className="text-text-muted">Tone Preference:</span>
                  <span className="font-medium">{tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Persona Framing:</span>
                  <span className="font-medium">{persona}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Emoji / Question Balance:</span>
                  <span className="font-medium text-brand">Optimized for LinkedIn algorithm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="default">
            <CardHeader>
              <CardTitle>Brand & Workspace Settings</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Configure how the n8n Strategy & Draft Generator agents frame content for your workspace.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="companyName">Company / Brand Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Your company or creator name"
                />
              </div>
              <div>
                <Label htmlFor="persona">Brand Persona Description</Label>
                <Input
                  id="persona"
                  value={persona}
                  onChange={e => setPersona(e.target.value)}
                  placeholder="e.g. Thought Leader in AI & Software Engineering"
                />
              </div>
              <div>
                <Label htmlFor="tone">Tone Guidelines</Label>
                <Input
                  id="tone"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  placeholder="e.g. Informative, direct, data-backed"
                />
              </div>
              <div>
                <Label htmlFor="brandKeywords">Topic Pillars & Keywords</Label>
                <Input
                  id="brandKeywords"
                  value={brandKeywords}
                  onChange={e => setBrandKeywords(e.target.value)}
                  placeholder="Comma-separated topics (e.g. AI, SaaS, Growth)"
                />
                <p className="mt-1 text-xs text-text-muted">Separate topic pillars with commas.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}