'use client';

import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Settings, Timer, Notebook, IndianRupee } from 'lucide-react';

const tools = [
  {
    title: 'Online Compiler',
    description: 'Write, run, and test your code in various languages.',
    href: '/compiler',
    icon: Code,
  },
  {
    title: 'Notes',
    description: 'Create and manage your personal or study notes.',
    href: '/notes',
    icon: Notebook,
  },
  {
    title: 'Pomodoro Timer',
    description: 'Boost your productivity with the Pomodoro technique.',
    href: '/pomodoro',
    icon: Timer,
  },
];

const otherLinks = [
    {
        title: 'Your Profile',
        description: 'Manage your account settings and profile information.',
        href: '/profile',
        icon: Settings,
    },
    {
        title: 'Pricing',
        description: 'View our pricing plans and upgrade your account.',
        href: '/pricing',
        icon: IndianRupee,
    }
]

export default function DashboardPage() {
  const auth = getAuth(app);
  const user = auth.currentUser;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Welcome back, {user?.displayName || user?.email || 'Student'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here are your tools. Let's get something done today.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Tools</CardTitle>
            <CardDescription>Essential utilities for your success.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.title} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <tool.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl font-headline">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{tool.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={tool.href}>
                      Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Account & Billing</CardTitle>
            <CardDescription>Manage your profile and subscription.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherLinks.map((link) => (
              <Card key={link.title} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <link.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl font-headline">{link.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{link.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={link.href}>
                      Go to Page <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
