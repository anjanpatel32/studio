'use client';

import { useState, useTransition } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Play, Terminal } from "lucide-react";
import { executeCode, ExecuteCodeInput } from '@/ai/flows/execute-code';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const languageGroups = [
  {
    label: "General-Purpose Programming Languages",
    description: "Used across many domains — software, apps, games, etc.",
    languages: [
      { value: "c", name: "C" },
      { value: "cpp", name: "C++" },
      { value: "java", name: "Java" },
      { value: "python", name: "Python" },
      { value: "csharp", name: "C#" },
      { value: "go", name: "Go (Golang)" },
      { value: "rust", name: "Rust" },
      { value: "swift", name: "Swift" },
      { value: "kotlin", name: "Kotlin" },
      { value: "dart", name: "Dart" },
      { value: "julia", name: "Julia" },
      { value: "perl", name: "Perl" },
      { value: "pascal", name: "Pascal" },
      { value: "fortran", name: "Fortran" },
      { value: "ada", name: "Ada" },
    ]
  },
  {
    label: "Web Development Languages",
    description: "Frontend, backend, and full-stack",
    languages: [
      { value: "html", name: "HTML" },
      { value: "css", name: "CSS" },
      { value: "javascript", name: "JavaScript" },
      { value: "typescript", name: "TypeScript" },
      { value: "php", name: "PHP" },
      { value: "ruby", name: "Ruby (Ruby on Rails)" },
      { value: "elixir", name: "Elixir (Phoenix framework)" },
      { value: "erlang", name: "Erlang (messaging systems)" },
      { value: "asp.net", name: "ASP.NET (C# web framework)" },
      { value: "jsp", name: "JSP (Java Server Pages)" },
    ]
  },
  {
    label: "Data Science, AI & Analytics",
    description: "Data processing, AI models, statistics",
    languages: [
      { value: "python", name: "Python (NumPy, Pandas, TensorFlow)" },
      { value: "r", name: "R" },
      { value: "julia", name: "Julia" },
      { value: "matlab", name: "MATLAB" },
      { value: "sas", name: "SAS" },
      { value: "stata", name: "Stata" },
      { value: "scala", name: "Scala (Apache Spark)" },
    ]
  },
  {
    label: "Database & Query Languages",
    description: "Used to interact with databases",
    languages: [
      { value: "sql", name: "SQL" },
      { value: "pl/sql", name: "PL/SQL (Oracle)" },
      { value: "tsql", name: "T-SQL (Microsoft SQL Server)" },
      { value: "nosql", name: "NoSQL (MongoDB queries)" },
      { value: "graphql", name: "GraphQL (APIs)" },
    ]
  },
  {
    label: "Mobile App Development Languages",
    description: "Native & cross-platform",
    languages: [
      { value: "swift", name: "Swift (iOS/macOS)" },
      { value: "kotlin", name: "Kotlin (Android)" },
      { value: "java", name: "Java (Android)" },
      { value: "dart", name: "Dart (Flutter apps)" },
      { value: "csharp", name: "C# (Xamarin, Unity mobile)" },
    ]
  },
  {
    label: "Scripting & Automation Languages",
    description: "System scripts, automation, DevOps",
    languages: [
      { value: "bash", name: "Bash / Shell Script" },
      { value: "powershell", name: "PowerShell" },
      { value: "python", name: "Python" },
      { value: "perl", name: "Perl" },
      { value: "groovy", name: "Groovy (Jenkins automation)" },
    ]
  },
  {
    label: "Functional & Academic Languages",
    description: "Used for research, math-heavy projects, or functional programming",
    languages: [
      { value: "haskell", name: "Haskell" },
      { value: "lisp", name: "Lisp" },
      { value: "scheme", name: "Scheme" },
      { value: "ocaml", name: "OCaml" },
      { value: "fsharp", name: "F#" },
      { value: "prolog", name: "Prolog" },
    ]
  },
  {
    label: "Game Development Languages",
    description: "Game engines & graphics",
    languages: [
      { value: "cpp", name: "C++ (Unreal Engine, game engines)" },
      { value: "csharp", name: "C# (Unity)" },
      { value: "java", name: "Java (Minecraft, Android games)" },
      { value: "gdscript", name: "GDScript (Godot engine)" },
      { value: "lua", name: "Lua (Roblox, scripting inside games)" },
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

      <div>
        <h2 className="text-xl font-headline font-semibold tracking-tight mb-4">Select Language</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {languageGroups.map(group => (
            <Card key={group.label} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-headline">{group.label}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {group.languages.map(lang => (
                    <Button
                      key={lang.value}
                      variant={language === lang.value ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setLanguage(lang.value)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Code Editor</CardTitle>
          <CardDescription>
              Selected language: <span className="font-semibold text-primary">{languageGroups.flatMap(g => g.languages).find(l => l.value === language)?.name || language}</span>
          </CardDescription>
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
