import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ExternalLink } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    title: "AI-Powered Study Planner",
    description: "A web application that uses machine learning to generate optimized study schedules for students based on their course load and learning style.",
    tags: ["React", "Node.js", "Python", "TensorFlow"],
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "abstract algorithm",
    link: "#"
  },
  {
    title: "Campus Event Finder",
    description: "A mobile app that helps students discover and RSVP to events happening on campus, with features for filtering by category and adding to calendar.",
    tags: ["React Native", "Firebase", "Express"],
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "campus event",
    link: "#"
  },
  {
    title: "Collaborative Whiteboard",
    description: "A real-time collaborative whiteboard application for group study sessions, featuring drawing tools, text notes, and file uploads.",
    tags: ["Vue.js", "WebSockets", "MongoDB"],
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "team collaboration",
    link: "#"
  },
  {
    title: "Personal Portfolio Website",
    description: "A serverless personal portfolio website built with Next.js and deployed on Vercel, showcasing my projects and skills.",
    tags: ["Next.js", "Tailwind CSS", "Vercel"],
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "website design",
    link: "#"
  }
];

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">My Portfolio</h1>
            <p className="text-muted-foreground mt-1">Showcase your projects, skills, and achievements to the world.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
                <div className="aspect-video relative overflow-hidden rounded-t-lg -mt-6 -mx-6 mb-4">
                    <Image src={project.imageUrl} alt={project.title} fill className="object-cover" data-ai-hint={project.imageHint} />
                </div>
              <CardTitle className="font-headline">{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  View Project
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
