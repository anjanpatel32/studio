'use client';

import { useState, useTransition } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Play, Terminal, IndianRupee, AlertCircle } from "lucide-react";
import { executeCode, ExecuteCodeInput } from '@/ai/flows/execute-code';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const helloWorldSnippets: { [key: string]: string } = {
  c: '#include <stdio.h>\n\nint main() {\n   printf("Hello, World!");\n   return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n   std::cout << "Hello, World!";\n   return 0;\n}',
  java: 'public class HelloWorld {\n   public static void main(String[] args) {\n      System.out.println("Hello, World!");\n   }\n}',
  python: 'print("Hello, World!")',
  csharp: 'using System;\n\nclass Program {\n   static void Main() {\n      Console.WriteLine("Hello, World!");\n   }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n   fmt.Println("Hello, World!")\n}',
  rust: 'fn main() {\n   println!("Hello, World!");\n}',
  swift: 'print("Hello, World!")',
  kotlin: 'fun main() {\n   println("Hello, World!")\n}',
  dart: 'void main() {\n  print(\'Hello, World!\');\n}',
  julia: 'println("Hello, World!")',
  perl: 'use strict;\nuse warnings;\n\nprint "Hello, World!\\n";',
  pascal: 'program HelloWorld;\nbegin\n  writeln(\'Hello, World!\');\nend.',
  fortran: 'program HelloWorld\n  print *, "Hello, World!"\nend program HelloWorld',
  ada: 'with Ada.Text_IO;\nprocedure Hello is\nbegin\n  Ada.Text_IO.Put_Line("Hello, World!");\nend Hello;',
  html: '<!DOCTYPE html>\n<html>\n<head>\n   <title>Page Title</title>\n</head>\n<body>\n\n   <h1>Hello, World!</h1>\n\n</body>\n</html>',
  css: 'body {\n   background-color: lightblue;\n}\n\nh1 {\n   color: white;\n   text-align: center;\n}',
  javascript: 'console.log("Hello, World!");',
  typescript: 'let message: string = "Hello, World!";\nconsole.log(message);',
  php: '<?php\n   echo "Hello, World!";\n?>',
  ruby: 'puts "Hello, World!"',
  elixir: 'IO.puts "Hello, World!"',
  erlang: '-module(hello).\n-export([start/0]).\n\nstart() ->\n  io:fwrite("Hello, World!\\n").',
  'asp.net': '// ASP.NET Core using C#\n// In a Controller action\npublic string Get() {\n    return "Hello, World!";\n}',
  jsp: '<%@ page contentType="text/html; charset=UTF-8" %>\n<html>\n<body>\n  <h2><%= "Hello, World!" %></h2>\n</body>\n</html>',
  r: 'print("Hello, World!")',
  matlab: 'disp(\'Hello, World!\')',
  sas: 'DATA _NULL_;\n   PUT "Hello, World!";\nRUN;',
  stata: 'display "Hello, World!"',
  scala: 'object HelloWorld extends App {\n  println("Hello, World!")\n}',
  sql: 'SELECT \'Hello, World!\';',
  'pl/sql': 'BEGIN\n  DBMS_OUTPUT.PUT_LINE(\'Hello, World!\');\nEND;',
  tsql: 'SELECT \'Hello, World!\';',
  nosql: '// MongoDB\ndb.greetings.insertOne({ message: "Hello, World!" });',
  graphql: '{\n  hello\n}',
  bash: 'echo "Hello, World!"',
  powershell: 'Write-Host "Hello, World!"',
  groovy: 'println "Hello, World!"',
  haskell: 'main :: IO ()\nmain = putStrLn "Hello, World!"',
  lisp: '(princ "Hello, World!")',
  scheme: '(display "Hello, World!")',
  ocaml: 'print_endline "Hello, World!"',
  fsharp: 'printfn "Hello, World!"',
  prolog: ':- initialization(main).\nmain :- write(\'Hello, World!\'), nl.',
  gdscript: 'extends Node\n\nfunc _ready():\n    print("Hello, World!")',
  lua: 'print("Hello, World!")'
};

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

const FREE_TIER_LIMIT = 20;

export default function CompilerPage() {
  const [code, setCode] = useLocalStorage('compilerCode', 'console.log("Hello, World!");');
  const [language, setLanguage] = useLocalStorage('compilerLanguage', 'javascript');
  const [compilationCount, setCompilationCount] = useLocalStorage('compilationCount', 0);
  const [isPending, startTransition] = useTransition();
  const [output, setOutput] = useState<string | null>(null);
  const { toast } = useToast();

  const isFreemiumBlocked = compilationCount >= FREE_TIER_LIMIT;

  const handleLanguageSelect = (langValue: string) => {
    setLanguage(langValue);
    setCode(helloWorldSnippets[langValue] || `// No "Hello World" example for ${langValue}`);
  };

  const handleRunCode = () => {
    if (isFreemiumBlocked) {
       toast({
          variant: "destructive",
          title: "Free Limit Reached",
          description: "You have used all your free compilations.",
        });
      return;
    }
    setOutput(null);
    startTransition(async () => {
      try {
        const result = await executeCode({ code, language } as ExecuteCodeInput);
        setOutput(result.output);
        setCompilationCount(prev => prev + 1);
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
          <CardTitle>Language Selection</CardTitle>
          <CardDescription>Click a language to load a "Hello, World!" example.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      onClick={() => handleLanguageSelect(lang.value)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      
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
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <Button onClick={handleRunCode} disabled={isPending || isFreemiumBlocked}>
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
            {isFreemiumBlocked && (
              <Button>
                <IndianRupee className="mr-2 h-4 w-4" />
                Pay ₹40 for Unlimited Access
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
              {FREE_TIER_LIMIT - compilationCount} free compilations remaining.
          </p>
        </CardFooter>
      </Card>

      {isFreemiumBlocked && (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Free Tier Limit Reached</AlertTitle>
            <AlertDescription>
                You have used all your {FREE_TIER_LIMIT} free code executions. Please pay to continue using the compiler.
            </AlertDescription>
        </Alert>
      )}

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
