'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: 'Signed In',
          description: 'You have successfully signed in.',
        });
        router.push('/compiler'); 
      } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please try again.';
        }
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: errorMessage,
        });
      }
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Sign In
            </Button>
             <p className="text-sm text-muted-foreground">
              <Link href="/reset-password" prefetch={false} className="underline hover:text-primary">
                Forgot password?
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
      <CardFooter className="justify-center">
         <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" prefetch={false} className="underline hover:text-primary">
              Sign Up
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
