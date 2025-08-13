'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AiCritique } from "./ai-critique";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle, CheckCircle, Download } from "lucide-react";
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

const templateCategories = [
    {
        title: "Standard Resume Formats",
        description: "These refer to the structure/layout type.",
        templates: [
            { name: "Chronological", hint: "classic resume", image: "https://placehold.co/400x560.png" },
            { name: "Functional", hint: "skills resume", image: "https://placehold.co/400x560.png" },
            { name: "Combination/Hybrid", hint: "modern resume", image: "https://placehold.co/400x560.png" },
            { name: "Targeted", hint: "professional resume", image: "https://placehold.co/400x560.png" },
        ]
    },
    {
        title: "Microsoft Word / Canva Template Styles",
        description: "Names you might see in template libraries.",
        templates: [
            { name: "Classic", hint: "simple resume", image: "https://placehold.co/400x560.png" },
            { name: "Modern", hint: "creative resume", image: "https://placehold.co/400x560.png" },
            { name: "Professional", hint: "business resume", image: "https://placehold.co/400x560.png" },
            { name: "Creative", hint: "designer resume", image: "https://placehold.co/400x560.png" },
            { name: "Minimalist", hint: "clean resume", image: "https://placehold.co/400x560.png" },
            { name: "Executive", hint: "ceo resume", image: "https://placehold.co/400x560.png" },
            { name: "Two-Column", hint: "column resume", image: "https://placehold.co/400x560.png" },
            { name: "Infographic", hint: "visual resume", image: "https://placehold.co/400x560.png" },
        ]
    },
    {
        title: "Popular Template Names on Portals",
        description: "Actual template names from platforms like Canva, MS Word, Zety, etc.",
        templates: [
            { name: "Cascade", hint: "modern resume", image: "https://placehold.co/400x560.png" },
            { name: "Concept", hint: "creative resume", image: "https://placehold.co/400x560.png" },
            { name: "Standout", hint: "bold resume", image: "https://placehold.co/400x560.png" },
            { name: "Modern Professional", hint: "professional resume", image: "https://placehold.co/400x560.png" },
            { name: "Coral", hint: "color resume", image: "https://placehold.co/400x560.png" },
            { name: "Simple Chronological", hint: "classic resume", image: "https://placehold.co/400x560.png" },
            { name: "Corporate Blue", hint: "business resume", image: "https://placehold.co/400x560.png" },
            { name: "Elegant Minimalist", hint: "minimalist resume", image: "https://placehold.co/400x560.png" },
            { name: "Tech Pro", hint: "developer resume", image: "https://placehold.co/400x560.png" },
            { name: "Creative Designer", hint: "designer resume", image: "https://placehold.co/400x560.png" },
        ]
    }
];


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
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage('selectedTemplate', 'Classic');


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

  const getFullResumeText = () => {
    let text = ``;
    text += `Name: ${personalInfo.fullName}\n`;
    text += `Email: ${personalInfo.email}\n`;
    text += `Phone: ${personalInfo.phone}\n`;
    text += `LinkedIn: ${personalInfo.linkedin}\n\n`;

    text += `## Summary\n${summary}\n\n`;

    text += `## Work Experience\n`;
    experiences.forEach(exp => {
      text += `### ${exp.title} at ${exp.company}\n`;
      text += `${exp.description}\n\n`;
    });

    text += `## Education\n`;
    educations.forEach(edu => {
      text += `### ${edu.degree}\n`;
      text += `${edu.university}\n\n`;
    });

    text += `## Skills\n`;
    text += skills.map(skill => skill.name).join(', ') + '\n';
    return text;
  }

  const resumeText = getFullResumeText();


  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Resume Tool</h1>
            <p className="text-muted-foreground mt-1">Build, refine, and get AI feedback on your resume.</p>
        </div>
        <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="editor">Resume Editor</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="critique">AI Critique</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Resume Editor</CardTitle>
                            <CardDescription>
                                Fill in your details to build your resume. All your progress is saved automatically.
                            </CardDescription>
                        </div>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Resume
                        </Button>
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
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="templates">
                 <Card>
                    <CardHeader>
                        <CardTitle>Resume Templates</CardTitle>
                        <CardDescription>
                            Choose a template to apply to your resume. Export options coming soon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                       {templateCategories.map(category => (
                            <div key={category.title}>
                               <h3 className="text-xl font-medium font-headline mb-1">{category.title}</h3>
                               <p className="text-muted-foreground mb-4">{category.description}</p>
                               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                   {category.templates.map(template => (
                                       <Card key={template.name} className="overflow-hidden">
                                           <CardContent className="p-0">
                                               <div className="aspect-[4/5] bg-muted">
                                                  <Image 
                                                    src={template.image} 
                                                    alt={`${template.name} template`} 
                                                    width={400} 
                                                    height={560}
                                                    data-ai-hint={template.hint}
                                                    className="object-cover w-full h-full"
                                                  />
                                               </div>
                                           </CardContent>
                                           <CardFooter className="flex flex-col items-start p-4">
                                                <h4 className="font-semibold">{template.name}</h4>
                                                <Button 
                                                    className="w-full mt-4" 
                                                    onClick={() => setSelectedTemplate(template.name)}
                                                    variant={selectedTemplate === template.name ? 'default' : 'secondary'}
                                                >
                                                   {selectedTemplate === template.name && <CheckCircle className="mr-2 h-4 w-4"/>}
                                                    {selectedTemplate === template.name ? 'Selected' : 'Select'}
                                                </Button>
                                           </CardFooter>
                                       </Card>
                                   ))}
                               </div>
                           </div>
                       ))}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="critique">
                <AiCritique resumeText={resumeText} />
            </TabsContent>
        </Tabs>
    </div>
  )
}
    
