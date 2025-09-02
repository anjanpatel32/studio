
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth, signInWithEmailAndPassword } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserCredential, AuthError } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { getMultiFactorResolver, PhoneMultiFactorGenerator } from 'firebase/auth';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSuccessfulSignIn = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // This case might happen if a user was created but their profile wasn't.
      // For a sign-in page, we'll just redirect to home.
      // Profile creation is handled on the sign-up page.
      toast({ title: 'Welcome back!'});
    }
    router.push('/');
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulSignIn(result);
    } catch (error: any) {
        const authError = error as AuthError;
        if (authError.code === 'auth/multi-factor-auth-required') {
            const resolver = getMultiFactorResolver(auth, authError);
            const phoneHint = resolver.hints.find(h => h.factorId === PhoneMultiFactorGenerator.FACTOR_ID);
            // Store resolver and hint in session storage to be used on the verification page
            sessionStorage.setItem('mfaResolver', JSON.stringify(resolver));
            router.push(`/login/verify-mfa?hint=${phoneHint?.displayName}`);
        } else {
             toast({
                variant: 'destructive',
                title: 'Sign In Failed',
                description: authError.code === 'auth/invalid-credential' 
                    ? 'Invalid email or password.'
                    : authError.message,
            });
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign In to ZYREEL
          </CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
         <CardContent className="text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
              Sign Up
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
