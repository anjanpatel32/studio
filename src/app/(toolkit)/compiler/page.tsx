'use client';

import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Play } from "lucide-react";

export default function CompilerPage() {
  const [code, setCode] = useLocalStorage('compilerCode', 'function hello() {\n  console.log("Hello, Student!");\n}');
  const [language, setLanguage] = useLocalStorage('compilerLanguage', 'javascript');

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
            className="min-h-[50vh] font-mono text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </CardContent>
        <CardFooter className="justify-between">
            <Button>
                <Play className="mr-2 h-4 w-4"/>
                Run Code
            </Button>
            <p className="text-sm text-muted-foreground">Compiler execution is coming soon.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
