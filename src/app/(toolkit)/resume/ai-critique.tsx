'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { critiqueResume, CritiqueResumeInput, CritiqueResumeOutput } from '@/ai/flows/critique-resume';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Sparkles, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  jobDescription: z.string().optional(),
});

interface AiCritiqueProps {
  resumeText: string;
}

export function AiCritique({ resumeText }: AiCritiqueProps) {
  const [isPending, startTransition] = useTransition();
  const [critique, setCritique] = useState<CritiqueResumeOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setCritique(null);
    startTransition(async () => {
      try {
        const input: CritiqueResumeInput = {
          resumeText: resumeText,
          jobDescription: values.jobDescription,
        };
        const result = await critiqueResume(input);
        setCritique(result);
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
              Your resume from the editor is ready to be analyzed. You can also provide a job description for more tailored feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <p className="text-sm font-medium">Your Current Resume</p>
                <Alert variant="default">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Ready for Analysis</AlertTitle>
                    <AlertDescription>
                        The content from the "Resume Editor" tab will be used for the critique. Any changes you make there will be reflected here automatically.
                    </AlertDescription>
                </Alert>
             </div>
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
            <Button type="submit" disabled={isPending || !resumeText.trim()}>
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
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: critique.critique }} />
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
