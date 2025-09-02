
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { updateProfile } from '@/app/profile/edit/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const formSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters.' })
    .max(50, { message: 'Display name must not be longer than 50 characters.' }),
  bio: z
    .string()
    .max(150, { message: 'Bio must not be longer than 150 characters.' })
    .optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function EditProfilePage({ params }: { params: {lng: string}}) {
  const { lng } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        displayName: '',
        bio: '',
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);

    const result = await updateProfile({
      uid: user.uid,
      displayName: values.displayName,
      bio: values.bio || '',
    });

    if (result.success) {
      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved.',
      });
      router.push(`/${lng}/profile/${user.uid}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  }

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
       <div className="container mx-auto max-w-lg p-4 md:p-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex flex-col items-center space-y-4 mb-8">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
       </div>
    )
  }
  
  if (!user) {
    router.push(`/${lng}/login`);
    return null;
  }

  return (
    <div className="container mx-auto max-w-lg p-4 md:p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Make changes to your public profile.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center space-y-4 mb-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback>{profile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="link">Change Profile Photo</Button>
            </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your cool name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell everyone a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} className="w-full">
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
