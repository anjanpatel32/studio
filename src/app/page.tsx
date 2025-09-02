
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="mb-8 flex items-center gap-4 text-primary">
        <Bot className="h-16 w-16" />
        <h1 className="text-6xl font-bold font-headline">ZYREEL</h1>
      </div>
      <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
        Discover, create, and share captivating short videos. Join a global community of creators and endless entertainment.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
