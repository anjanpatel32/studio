
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReelCreator } from '@/components/reel-creator';
import { Clapperboard, Image as ImageIcon, History, Radio } from 'lucide-react';
import { PostCreator } from '@/components/post-creator';
import { StoryCreator } from '@/components/story-creator';
import { LiveCreator } from '@/components/live-creator';


export default function UploadPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
       <Tabs defaultValue="reel" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reel"><Clapperboard className="mr-2 h-4 w-4" /> Reel</TabsTrigger>
            <TabsTrigger value="post"><ImageIcon className="mr-2 h-4 w-4" /> Post</TabsTrigger>
            <TabsTrigger value="story"><History className="mr-2 h-4 w-4" /> Story</TabsTrigger>
            <TabsTrigger value="live"><Radio className="mr-2 h-4 w-4" /> Live</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reel">
            <Card>
                <CardHeader>
                <CardTitle>Create a new Reel</CardTitle>
                <CardDescription>
                    Record a new video or upload one from your device.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReelCreator />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="post">
            <Card>
                <CardHeader>
                <CardTitle>Create a new Post</CardTitle>
                <CardDescription>
                    Share a photo with your followers.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <PostCreator />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="story">
            <Card>
                <CardHeader>
                <CardTitle>Create a new Story</CardTitle>
                <CardDescription>
                   Share a photo or video that disappears after 24 hours.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <StoryCreator />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="live">
             <Card>
                <CardHeader>
                <CardTitle>Go Live</CardTitle>
                <CardDescription>
                    Stream live video to your followers.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <LiveCreator />
                </CardContent>
            </Card>
        </TabsContent>

       </Tabs>
    </div>
  );
}

