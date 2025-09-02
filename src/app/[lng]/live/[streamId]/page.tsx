
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import type { LiveStream, ChatMessage, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Radio, Send, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { postChatMessage, endLive } from '@/app/upload/actions';
import { formatDistanceToNow } from 'date-fns';

const ChatBubble = ({ message }: { message: ChatMessage }) => (
    <div className="flex items-start space-x-2 py-2">
        <Avatar className="h-8 w-8">
            <AvatarImage src={message.user.avatarUrl} />
            <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <div className='flex items-center gap-2'>
                <p className="text-sm font-semibold">{message.user.name}</p>
                 <p className="text-xs text-muted-foreground">
                    {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                </p>
            </div>
            <p className="text-sm">{message.text}</p>
        </div>
    </div>
);


export default function LiveStreamPage({ params }: { params: {lng: string}}) {
    const { lng } = params;
    const { streamId } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [stream, setStream] = useState<LiveStream | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingStream, setLoadingStream] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!streamId) return;

        const streamDocRef = doc(firestore, 'live-streams', streamId as string);
        const unsubscribeStream = onSnapshot(streamDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const streamData = docSnap.data() as Omit<LiveStream, 'id' | 'user'>;
                const userDoc = await doc(firestore, 'users', streamData.ownerUid).get();
                const userData = userDoc.data() as UserProfile;
                setStream({
                    id: docSnap.id,
                    user: { name: userData.displayName, avatarUrl: userData.photoURL },
                    ...streamData
                });
            } else {
                setStream(null);
            }
            setLoadingStream(false);
        });

        const chatQuery = query(collection(firestore, `live-streams/${streamId}/chat`), orderBy('createdAt', 'asc'), limit(100));
        const unsubscribeChat = onSnapshot(chatQuery, async (querySnapshot) => {
            const messages: ChatMessage[] = [];
            for (const messageDoc of querySnapshot.docs) {
                const messageData = messageDoc.data();
                const userDoc = await doc(firestore, 'users', messageData.uid).get();
                const userData = userDoc.data() as UserProfile;
                 messages.push({
                    id: messageDoc.id,
                    user: { id: messageData.uid, name: userData.displayName, avatarUrl: userData.photoURL },
                    ...messageData
                } as ChatMessage);
            }
            setChatMessages(messages);
        });

        return () => {
            unsubscribeStream();
            unsubscribeChat();
        };
    }, [streamId]);

    useEffect(() => {
        // Scroll to bottom of chat when new messages arrive
        if(chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages])


    const handlePostMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        setIsSubmitting(true);
        const result = await postChatMessage(streamId as string, user.uid, newMessage);
        if (result.success) {
            setNewMessage('');
        } else {
            toast({ variant: 'destructive', title: 'Failed to send message', description: result.error });
        }
        setIsSubmitting(false);
    };

    const handleEndStream = async () => {
        const result = await endLive(streamId as string);
        if(result.success) {
            toast({ title: "Stream Ended"});
            router.push(`/${lng}`);
        } else {
            toast({ variant: 'destructive', title: "Failed to end stream"});
        }
    }
    
    if (authLoading || loadingStream) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    if (!stream) {
        return (
             <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold">Stream Not Found</h1>
                <p className="text-muted-foreground">This live stream may have ended or does not exist.</p>
                <Button onClick={() => router.push(`/${lng}`)} className="mt-4">Go Home</Button>
            </div>
        )
    }

    const isOwner = user?.uid === stream.ownerUid;

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-4rem)]">
            {/* Video Player Section */}
            <div className="md:col-span-2 bg-black rounded-lg flex items-center justify-center text-white relative">
                 <div className="absolute top-4 left-4 z-10">
                    <Badge variant={stream.status === 'live' ? 'destructive' : 'secondary' } className="flex items-center gap-2">
                        <Radio className={stream.status === 'live' ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
                        {stream.status.toUpperCase()}
                    </Badge>
                </div>
                 <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {/* Placeholder for viewer count */}
                        {Math.floor(Math.random() * 1000)}
                    </Badge>
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold">Live Stream Placeholder</h2>
                    <p>A real video feed would be here.</p>
                </div>
                {isOwner && stream.status === 'live' && (
                    <div className="absolute bottom-4 left-4 z-10">
                        <Button variant="destructive" onClick={handleEndStream}>End Stream</Button>
                    </div>
                )}
            </div>

            {/* Chat Section */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex items-center space-x-3">
                         <Avatar className="h-12 w-12">
                            <AvatarImage src={stream.user.avatarUrl} />
                            <AvatarFallback>{stream.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold">{stream.user.name} is live!</h2>
                            <p className="text-sm text-muted-foreground">
                                Started {stream.startedAt ? formatDistanceToNow(stream.startedAt.toDate()) : ''} ago
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2">
                     {chatMessages.length > 0 ? (
                        chatMessages.map(msg => <ChatBubble key={msg.id} message={msg} />)
                     ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No messages yet.</p>
                        </div>
                     )}
                </CardContent>
                <CardFooter>
                    {user ? (
                        <form onSubmit={handlePostMessage} className="w-full flex items-center space-x-2">
                            <Input 
                                placeholder="Say something..." 
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                disabled={isSubmitting || stream.status === 'ended'}
                            />
                            <Button type="submit" size="icon" disabled={isSubmitting || stream.status === 'ended'}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    ) : (
                        <p className="text-sm text-muted-foreground">Log in to join the chat.</p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
