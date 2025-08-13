'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export default function ProfilePage() {
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseUser | null>(null);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

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

  if (!user) {
    return null; // or a loading spinner
  }
  
  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.email}</p>
              <p className="text-sm text-muted-foreground">User ID: {user.uid}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2">Account Actions</h3>
            <Button onClick={handleSignOut} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
