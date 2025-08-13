'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { critiqueResume, CritiqueResumeInput } from '@/ai/flows/critique-resume';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  resumeText: z.string().min(200, {
    message: "Resume text must be at least 200 characters.",
  }),
  jobDescription: z.string().optional(),
});

export function AiCritique() {
  const [isPending, startTransition] = useTransition();
  const [critique, setCritique] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: "",
      jobDescription: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setCritique(null);
    startTransition(async () => {
      try {
        const result = await critiqueResume(values as CritiqueResumeInput);
        setCritique(result.critique);
      } catch (error) {
        console.error("Failed to get resume critique:", error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Failed to get resume critique. Please try again.",
        });
      }
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>AI Resume Critique</CardTitle>
            <CardDescription>
              Paste your resume and an optional job description to get AI-powered feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Resume Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the full text of your resume here..."
                      className="min-h-[250px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste a job description to get tailored feedback..."
                      className="min-h-[150px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Providing a job description helps the AI give more relevant advice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Feedback
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {isPending && (
         <div className="p-6 pt-0">
             <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <Bot className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
            </div>
         </div>
      )}

      {critique && (
        <div className="p-6 pt-0">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Feedback</AlertTitle>
            <AlertDescription>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: critique.replace(/\n/g, '<br />') }} />
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
