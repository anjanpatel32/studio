'use client';

import { AnimatedBackground } from "@/components/shared/animated-background";
import { Bot } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnimatedBackground />
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center justify-center gap-4">
                 <Bot className="h-12 w-12 text-primary" />
                 <h1 className="text-3xl font-headline font-bold">Welcome to StudentKit</h1>
                 <p className="text-muted-foreground text-center">Your essential toolkit for success. Sign in to continue.</p>
            </div>
            {children}
        </div>
      </div>
    </>
  );
}
