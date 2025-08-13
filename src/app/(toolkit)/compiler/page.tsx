'use client';

import { useState, useTransition } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Play, Terminal } from "lucide-react";
import { executeCode, ExecuteCodeInput } from '@/ai/flows/execute-code';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const languageGroups = [
  {
    label: "General-Purpose",
    languages: [
      { value: "c", name: "C" },
      { value: "cpp", name: "C++" },
      { value: "java", name: "Java" },
      { value: "python", name: "Python" },
      { value: "csharp", name: "C#" },
      { value: "go", name: "Go (Golang)" },
      { value: "swift", name: "Swift" },
      { value: "kotlin", name: "Kotlin" },
      { value: "dart", name: "Dart" },
      { value: "rust", name: "Rust" },
      { value: "ruby", name: "Ruby" },
      { value: "scala", name: "Scala" },
      { value: "perl", name: "Perl" },
      { value: "lua", name: "Lua" },
      { value: "objective-c", name: "Objective-C" },
      { value: "groovy", name: "Groovy" },
      { value: "pascal", name: "Pascal" },
      { value: "fortran", name: "Fortran" },
      { value: "ada", name: "Ada" },
    ]
  },
  {
    label: "Web Development",
    languages: [
      { value: "html", name: "HTML" },
      { value: "css", name: "CSS" },
      { value: "javascript", name: "JavaScript" },
      { value: "typescript", name: "TypeScript" },
      { value: "php", name: "PHP" },
      { value: "sql", name: "SQL" },
      { value: "nosql", name: "NoSQL" },
      { value: "asp.net", name: "ASP.NET" },
      { value: "jsp", name: "JSP" },
    ]
  },
  {
    label: "Data Science & Analytics",
    languages: [
      { value: "r", name: "R" },
      { value: "matlab", name: "MATLAB" },
      { value: "julia", name: "Julia" },
      { value: "sas", name: "SAS" },
      { value: "stata", name: "Stata" },
    ]
  },
  {
    label: "Scripting & Automation",
    languages: [
      { value: "bash", name: "Bash / Shell" },
      { value: "powershell", name: "PowerShell" },
      { value: "awk", name: "AWK" },
      { value: "tcl", name: "TCL" },
    ]
  },
  {
    label: "Functional & Academic",
    languages: [
      { value: "haskell", name: "Haskell" },
      { value: "lisp", name: "Lisp" },
      { value: "scheme", name: "Scheme" },
      { value: "prolog", name: "Prolog" },
      { value: "ocaml", name: "OCaml" },
      { value: "fsharp", name: "F#" },
      { value: "erlang", name: "Erlang" },
      { value: "elixir", name: "Elixir" },
    ]
  }
];

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
                  {languageGroups.map(group => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
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
