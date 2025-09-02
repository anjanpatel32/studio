
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
import { auth, createUserWithEmailAndPassword } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserCredential } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');


  const handleSuccessfulSignUp = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    const userRef = doc(firestore, 'users', user.uid);
    
    // New user, create documents
    const walletRef = doc(firestore, 'wallets', user.uid);
    try {
      await setDoc(userRef, {
          uid: user.uid,
          displayName: displayName || `user_${user.uid.substring(0, 6)}`,
          email: user.email,
          photoURL: `https://placehold.co/128x128.png`,
          phone: '',
          bio: '',
          followersCount: 0,
          followingCount: 0,
          reelsCount: 0,
          createdAt: serverTimestamp(),
          coins: 0,
          isPrivate: false,
          blockedUsers: [],
          settings: {
              theme: 'dark',
              notifications: {
                  likes: true,
                  comments: true,
                  follows: true,
                  payouts: true,
              }
          }
      });
      await setDoc(walletRef, {
          balance: 0,
          coins: 0,
          dailyStats: {
              date: new Date().toISOString().slice(0, 10),
              watchedCount: 0,
              uploadedCount: 0,
              sharedCount: 0,
          }
      });
      toast({ title: 'Welcome!', description: "Your account has been created."});
      router.push('/');
    } catch (error) {
      console.error("Error creating user documents:", error);
      toast({ variant: 'destructive', title: 'Setup Failed', description: 'Could not create user profile.' });
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await handleSuccessfulSignUp(result);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription>
            Enter your details to sign up for ZYREEL
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" type="text" placeholder="Your Name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
         <CardContent className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign In
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
