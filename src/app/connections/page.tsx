'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { SocialAccount } from '@/types';

export default function ConnectionsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await fetch('/api/social/linkedin');
      if (!response.ok) throw new Error('Failed to fetch social accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching accounts';
      console.warn(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleConnectLinkedIn = () => {
    setConnecting(true);
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'mock_client_id';
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/linkedin/callback`);
    const state = crypto.randomUUID();
    const scope = encodeURIComponent('openid profile email w_member_social');

    // Store state in sessionStorage for OAuth verification
    sessionStorage.setItem('oauth_state', state);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    
    toast({
      type: 'info',
      title: 'Redirecting to LinkedIn...',
      description: 'Opening LinkedIn authorization window.',
    });

    window.location.href = authUrl;
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/social/linkedin?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect account');
      toast({ type: 'success', title: 'Account Disconnected', description: 'LinkedIn account connection removed.' });
      fetchAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disconnect failed';
      toast({ type: 'error', title: 'Error', description: msg });
    }
  };

  const linkedInAccount = accounts.find(a => a.platform === 'linkedin');

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text">Social Connections</h1>
          <p className="mt-1 text-text-muted text-sm">Manage connected social media channels and OAuth credentials for your workspace.</p>
        </div>

        <div className="space-y-6">
          {/* LinkedIn Connection Card */}
          <Card variant="default" padding="default">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white font-bold text-lg">
                  in
                </div>
                <div>
                  <CardTitle className="text-lg">LinkedIn Profile</CardTitle>
                  <p className="text-xs text-text-muted mt-0.5">Post text, image, and article updates automatically via LinkedIn Posts API</p>
                </div>
              </div>
              <Badge variant={linkedInAccount ? 'success' : 'neutral'}>
                {linkedInAccount ? 'Connected' : 'Not Connected'}
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="py-4 text-center text-text-muted text-sm">Checking connection status...</div>
              ) : linkedInAccount ? (
                <div className="rounded-xl bg-bg-elevated border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Connected Account</span>
                    <span className="font-medium text-text">{linkedInAccount.account_name || 'LinkedIn User'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Token Expires</span>
                    <span className="text-text font-mono text-xs">
                      {new Date(linkedInAccount.token_expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Permissions / Scopes</span>
                    <div className="flex gap-1 flex-wrap">
                      {linkedInAccount.scopes.map(s => (
                        <Badge key={s} variant="neutral" size="sm">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  Connect your LinkedIn account to allow Sapphire to automatically publish scheduled posts to your feed.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-2">
              {linkedInAccount ? (
                <Button variant="destructive" size="sm" onClick={() => handleDisconnect(linkedInAccount.id)}>
                  Disconnect Account
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleConnectLinkedIn} disabled={connecting}>
                  {connecting ? 'Connecting...' : 'Connect LinkedIn'}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Instagram Business Card */}
          <Card variant="default" padding="default">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  ig
                </div>
                <div>
                  <CardTitle className="text-lg">Instagram Business</CardTitle>
                  <p className="text-xs text-text-muted mt-0.5">Post photos and captions via Meta Content Publishing API (Phase 5)</p>
                </div>
              </div>
              <Badge variant="neutral">Phase 5</Badge>
            </CardHeader>
            <CardContent className="pt-2 text-sm text-text-muted">
              Instagram Content Publishing requires a connected Instagram Business/Creator account and Meta App Review authorization.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
