'use client';

import React from 'react';
import useLocalStorage from '@/hooks/use-local-storage';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiCritique } from './ai-critique';

export default function ResumePage() {
  const [resumeText, setResumeText] = useLocalStorage('resumeText', '');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Resume Builder</h1>
        <p className="text-muted-foreground mt-1">
          Craft your perfect resume and get instant feedback from our AI assistant.
        </p>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Resume Editor</TabsTrigger>
          <TabsTrigger value="ai-critique">AI Critique</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Resume Editor</CardTitle>
              <CardDescription>
                Write or paste your resume content here. Your work is saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Start building your resume..."
                className="min-h-[60vh] font-mono text-sm"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-critique">
            <AiCritique resumeText={resumeText} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
