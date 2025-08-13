'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, User as FirebaseUser, updatePassword, updateProfile, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, KeyRound, Loader2, Save, MailCheck } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const profileFormSchema = z.object({
    displayName: z.string().min(2, { message: "Display name must be at least 2 characters."}),
});


export default function ProfilePage() {
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseUser | null>(auth.currentUser);
  const [passwordPending, startPasswordTransition] = useTransition();
  const [profilePending, startProfileTransition] = useTransition();
  const [verificationPending, startVerificationTransition] = useTransition();


  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        profileForm.setValue('displayName', user.displayName || '');
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, router, profileForm]);

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
  
  const handleChangePassword = (values: z.infer<typeof passwordFormSchema>) => {
    startPasswordTransition(async () => {
        if(!user || !user.email) return;

        try {
            const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, values.newPassword);
            toast({
                title: 'Password Updated',
                description: 'Your password has been changed successfully.',
            });
            passwordForm.reset();
        } catch (error: any) {
            let errorMessage = "An unknown error occurred.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'The current password you entered is incorrect.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            }
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: errorMessage,
            });
        }
    });
  }

  const handleUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    startProfileTransition(async () => {
        if(!user) return;
        try {
            await updateProfile(user, {
                displayName: values.displayName
            });
            // Manually update state because firebase listener might be slow
            setUser(auth.currentUser);
            toast({
                title: 'Profile Updated',
                description: 'Your display name has been updated.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update your profile.',
            });
        }
    })
  }

  const handleResendVerification = () => {
    startVerificationTransition(async () => {
      if(!user) return;
      try {
        await sendEmailVerification(user);
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your inbox to verify your email address.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: 'Could not send verification email. Please try again later.',
        })
      }
    })
  }

  if (!user) {
    return null; // or a loading spinner
  }
  
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Details about your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl font-bold">
                    {getInitials(user.displayName, user.email || '')}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-lg font-semibold">{user.displayName || user.email}</p>
                    {user.displayName && <p className="text-sm text-muted-foreground">{user.email}</p>}
                    <p className="text-sm text-muted-foreground">User ID: {user.uid}</p>
                </div>
                </div>
                
                 <div>
                    <h3 className="text-md font-semibold mb-2">Verification Status</h3>
                    {user.emailVerified ? (
                        <Alert>
                            <MailCheck className="h-4 w-4" />
                            <AlertTitle>Email Verified</AlertTitle>
                            <AlertDescription>Your email address has been successfully verified.</AlertDescription>
                        </Alert>
                    ): (
                        <Alert variant="destructive">
                             <MailCheck className="h-4 w-4" />
                            <AlertTitle>Email Not Verified</AlertTitle>
                            <AlertDescription>Please verify your email to secure your account.</AlertDescription>
                            <Button size="sm" className="mt-4" onClick={handleResendVerification} disabled={verificationPending}>
                               {verificationPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Resend Verification Email
                            </Button>
                        </Alert>
                    )}
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

        <div className="lg:col-span-2 space-y-8">
            <Card>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
                        <CardHeader>
                            <CardTitle>Update Profile</CardTitle>
                            <CardDescription>Change your public display name.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={profileForm.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                         <CardFooter>
                            <Button type="submit" disabled={profilePending}>
                                {profilePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
            <Card>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
                        <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account's password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={passwordPending}>
                                {passwordPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <KeyRound className="mr-2 h-4 w-4" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
      </div>
    </div>
  );
}
