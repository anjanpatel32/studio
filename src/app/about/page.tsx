
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Info className="h-8 w-8" />
            <h1 className="text-3xl font-bold">About ZYREEL</h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    ZYREEL is dedicated to empowering creators by providing a platform to share short, engaging video content with the world. We believe in fostering a positive and creative community where everyone has a voice.
                </p>
                <p>
                    Our goal is to build a fun, safe, and rewarding environment for both creators and viewers.
                </p>
            </CardContent>
        </Card>

         <Card className="mt-8">
            <CardHeader>
                <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">App Version:</span>
                    <span>1.0.0 (Prototype)</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Framework:</span>
                    <span>Next.js</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Backend:</span>
                    <span>Firebase</span>
                </div>
            </CardContent>
        </Card>

         <Card className="mt-8">
            <CardHeader>
                <CardTitle>Contact & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
                <p>
                    For any inquiries or support requests, please visit our <Link href="/help" className="text-primary hover:underline">Help Center</Link> or email us at <a href="mailto:support@zyreel.example.com" className="text-primary hover:underline">support@zyreel.example.com</a>.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
