'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ type: 'error', title: 'Missing fields', description: 'Please enter email and password.' });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        toast({ type: 'success', title: 'Sign up successful', description: 'Check your email or log in.' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ type: 'success', title: 'Welcome back!', description: 'Logged in successfully.' });
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      toast({ type: 'error', title: 'Auth Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md" variant="default" padding="lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xl">
          S
        </div>
        <CardTitle className="text-2xl font-bold font-display text-text">
          {isSignUp ? 'Create Sapphire Account' : 'Log in to Sapphire'}
        </CardTitle>
        <p className="text-sm text-text-muted mt-1">
          {isSignUp ? 'Sign up to manage your multi-tenant content OS' : 'Welcome back to your AI content workspace'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button variant="primary" className="w-full mt-2" type="submit" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <button
          type="button"
          className="text-xs text-text-muted hover:text-brand transition-colors"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-text-muted">Loading auth page...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
