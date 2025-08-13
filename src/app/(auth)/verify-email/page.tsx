'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, sendEmailVerification, signOut, User } from 'firebase/auth';
import { app } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            // Periodically check if the email has been verified
            const intervalId = setInterval(async () => {
                await currentUser.reload();
                if (currentUser.emailVerified) {
                    clearInterval(intervalId);
                     toast({
                        title: 'Email Verified!',
                        description: 'Your email has been successfully verified. Redirecting...',
                    });
                    router.push('/dashboard');
                }
            }, 3000);

            return () => clearInterval(intervalId);
        } else {
            // If no user, redirect to login
            router.push('/login');
        }
    });
    return () => unsubscribe();
  }, [auth, router, toast]);

  const handleResendVerification = () => {
    startTransition(async () => {
      if (!user) return;
      try {
        await sendEmailVerification(user);
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your inbox to verify your email address.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: 'Could not send verification email. Please try again later.',
        });
      }
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'An error occurred while signing out.',
      });
    }
  };


  return (
    <Card>
        <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
            A verification link has been sent to your email address: <span className="font-bold text-primary">{user?.email}</span>. Please click the link to continue.
        </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert>
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Check Your Inbox</AlertTitle>
                <AlertDescription>
                   If you don't see the email, please check your spam folder. This page will automatically redirect after you've verified your email.
                </AlertDescription>
            </Alert>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button onClick={handleResendVerification} className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Resend Verification Email
            </Button>
             <Button onClick={handleSignOut} variant="secondary" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </CardFooter>
    </Card>
  );
}
