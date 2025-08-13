'use client';

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  const [docContent, setDocContent] = useLocalStorage('docContent', '');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Documentation Tool</h1>
        <p className="text-muted-foreground mt-1">A simple place to write and save your notes. Content is saved automatically.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Document</CardTitle>
          <CardDescription>Start typing below. Your progress is saved to your browser.</CardDescription>
        </CardHeader>
        <CardContent>
            <Textarea
              placeholder="Start writing your document here..."
              className="min-h-[60vh] text-base"
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
            />
        </CardContent>
      </Card>
    </div>
  );
}
