'use client';

import { useState, useTransition } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Play, Terminal } from "lucide-react";
import { executeCode, ExecuteCodeInput } from '@/ai/flows/execute-code';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CompilerPage() {
  const [code, setCode] = useLocalStorage('compilerCode', 'function hello() {\n  console.log("Hello, Student!");\n}');
  const [language, setLanguage] = useLocalStorage('compilerLanguage', 'javascript');
  const [isPending, startTransition] = useTransition();
  const [output, setOutput] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRunCode = () => {
    setOutput(null);
    startTransition(async () => {
      try {
        const result = await executeCode({ code, language } as ExecuteCodeInput);
        setOutput(result.output);
      } catch (error) {
        console.error("Failed to execute code:", error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Failed to execute code. Please try again.",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Online Compiler</h1>
        <p className="text-muted-foreground mt-1">Write, run, and test your code in various languages. Your code is saved automatically.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Code Editor</CardTitle>
              <CardDescription>Select a language and start coding.</CardDescription>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your code here..."
            className="min-h-[40vh] font-mono text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleRunCode} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {(isPending || output !== null) && (
        <Card>
            <CardHeader>
                <CardTitle>Output</CardTitle>
                <CardDescription>Result of your code execution.</CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div className="flex items-center space-x-4">
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <Alert variant="default">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Compiler Output</AlertTitle>
                        <AlertDescription>
                            <pre className="text-sm font-mono bg-transparent p-0 whitespace-pre-wrap">{output || 'No output.'}</pre>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
