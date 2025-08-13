'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AiCritique } from "./ai-critique";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle } from "lucide-react";
import useLocalStorage from "@/hooks/use-local-storage";

interface Experience {
  id: number;
  title: string;
  company: string;
  description: string;
}

interface Education {
    id: number;
    degree: string;
    university: string;
}

interface Skill {
    id: number;
    name: string;
}

export default function ResumePage() {
  const [personalInfo, setPersonalInfo] = useLocalStorage('resumePersonalInfo', {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
  });
  const [summary, setSummary] = useLocalStorage('resumeSummary', '');
  const [experiences, setExperiences] = useLocalStorage<Experience[]>('resumeExperiences', [
    { id: 1, title: '', company: '', description: '' },
  ]);
  const [educations, setEducations] = useLocalStorage<Education[]>('resumeEducations', [
      { id: 1, degree: '', university: ''}
  ]);
  const [skills, setSkills] = useLocalStorage<Skill[]>('resumeSkills', [
    { id: 1, name: 'React' }, {id: 2, name: 'Node.js'}
  ]);
  const [newSkill, setNewSkill] = useState('');


  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [id]: value }));
  };

  const handleExperienceChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExperiences(prev => prev.map(exp => (exp.id === id ? { ...exp, [name]: value } : exp)));
  };

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      { id: Date.now(), title: '', company: '', description: '' },
    ]);
  };

  const removeExperience = (id: number) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const handleEducationChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEducations(prev => prev.map(edu => (edu.id === id ? { ...edu, [name]: value } : edu)));
  };

  const addEducation = () => {
    setEducations(prev => [
      ...prev,
      { id: Date.now(), degree: '', university: ''},
    ]);
  };

  const removeEducation = (id: number) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
  };

   const addSkill = () => {
    if (newSkill.trim() !== '') {
      setSkills(prev => [...prev, { id: Date.now(), name: newSkill.trim() }]);
      setNewSkill('');
    }
  };

  const removeSkill = (id: number) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };


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
                    <CardContent className="space-y-8">
                       <div className="space-y-4">
                           <h3 className="text-lg font-medium font-headline">Personal Information</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" placeholder="Jane Doe" value={personalInfo.fullName} onChange={handlePersonalInfoChange}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="jane.d@example.com" value={personalInfo.email} onChange={handlePersonalInfoChange}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" placeholder="(123) 456-7890" value={personalInfo.phone} onChange={handlePersonalInfoChange}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                                    <Input id="linkedin" placeholder="linkedin.com/in/janedoe" value={personalInfo.linkedin} onChange={handlePersonalInfoChange}/>
                                </div>
                           </div>
                       </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Professional Summary</h3>
                            <div className="p-4 border rounded-lg">
                                <Label htmlFor="summary" className="sr-only">Professional Summary</Label>
                                <Textarea id="summary" placeholder="A brief summary of your skills and experience..." value={summary} onChange={(e) => setSummary(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Work Experience</h3>
                            {experiences.map((exp, index) => (
                                <div key={exp.id} className="space-y-4 border p-4 rounded-lg relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`title-${exp.id}`}>Job Title</Label>
                                            <Input id={`title-${exp.id}`} name="title" placeholder="Software Engineer" value={exp.title} onChange={(e) => handleExperienceChange(exp.id, e)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`company-${exp.id}`}>Company</Label>
                                            <Input id={`company-${exp.id}`} name="company" placeholder="Tech Solutions Inc." value={exp.company} onChange={(e) => handleExperienceChange(exp.id, e)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${exp.id}`}>Responsibilities & Achievements</Label>
                                        <Textarea id={`description-${exp.id}`} name="description" placeholder="Developed feature X, improved performance by 20%..." value={exp.description} onChange={(e) => handleExperienceChange(exp.id, e)} />
                                    </div>
                                    {experiences.length > 1 && (
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(exp.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" onClick={addExperience}><PlusCircle className="mr-2 h-4 w-4" />Add Experience</Button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Education</h3>
                             {educations.map((edu, index) => (
                                <div key={edu.id} className="space-y-4 border p-4 rounded-lg relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`degree-${edu.id}`}>Degree / Certificate</Label>
                                            <Input id={`degree-${edu.id}`} name="degree" placeholder="B.S. in Computer Science" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, e)}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`university-${edu.id}`}>School / University</Label>
                                            <Input id={`university-${edu.id}`} name="university" placeholder="State University" value={edu.university} onChange={(e) => handleEducationChange(edu.id, e)}/>
                                        </div>
                                    </div>
                                     {educations.length > 1 && (
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(edu.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" onClick={addEducation}><PlusCircle className="mr-2 h-4 w-4" />Add Education</Button>
                        </div>

                        <div className="space-y-4">
                             <h3 className="text-lg font-medium font-headline">Skills</h3>
                             <div className="p-4 border rounded-lg">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {skills.map(skill => (
                                        <div key={skill.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                                            <span>{skill.name}</span>
                                            <button onClick={() => removeSkill(skill.id)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add a new skill" 
                                        value={newSkill} 
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                    />
                                    <Button onClick={addSkill}>Add Skill</Button>
                                </div>
                             </div>
                        </div>

                         <CardDescription className="text-xs pt-4">
                           Templates and export options coming soon.
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
    