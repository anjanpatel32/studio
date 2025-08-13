import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AiCritique } from "./ai-critique";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResumePage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Resume Tool</h1>
            <p className="text-muted-foreground mt-1">Build, refine, and get AI feedback on your resume.</p>
        </div>
        <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="editor">Resume Editor</TabsTrigger>
                <TabsTrigger value="critique">AI Critique</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
                <Card>
                    <CardHeader>
                        <CardTitle>Resume Editor</CardTitle>
                        <CardDescription>
                            Fill in your details to build your resume. All your progress is saved automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" placeholder="Jane Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="jane.d@example.com" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" placeholder="(123) 456-7890" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                                <Input id="linkedin" placeholder="linkedin.com/in/janedoe" />
                            </div>
                       </div>
                        <div className="space-y-2">
                            <Label htmlFor="summary">Professional Summary</Label>
                            <Textarea id="summary" placeholder="A brief summary of your skills and experience..." />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Experience</h3>
                            <div className="space-y-2 border p-4 rounded-md">
                                <Label>Job 1</Label>
                                <Input placeholder="Job Title" />
                                <Input placeholder="Company Name" />
                                <Textarea placeholder="Job responsibilities and achievements..." />
                            </div>
                            <Button variant="outline">Add Experience</Button>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Education</h3>
                            <div className="space-y-2 border p-4 rounded-md">
                                <Label>Degree</Label>
                                <Input placeholder="Degree" />
                                <Input placeholder="University Name" />
                            </div>
                            <Button variant="outline">Add Education</Button>
                        </div>
                         <CardDescription className="text-xs">
                           This is a simplified editor. Full editor with templates and export options coming soon.
                        </CardDescription>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="critique">
                <AiCritique />
            </TabsContent>
        </Tabs>
    </div>
  )
}
