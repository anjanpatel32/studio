'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const auth = getAuth(app);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, values.email);
        toast({
          title: 'Password Reset Email Sent',
          description: 'Please check your inbox to reset your password.',
        });
      } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No user found with this email address.';
        }
        toast({
          variant: 'destructive',
          title: 'Request Failed',
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
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset link.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
               {isPending && <Loader2 className="animate-spin" />}
              Send Reset Link
            </Button>
          </CardFooter>
        </form>
      </Form>
      <CardFooter className="justify-center">
         <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/login" prefetch={false} className="underline hover:text-primary">
              Sign In
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
