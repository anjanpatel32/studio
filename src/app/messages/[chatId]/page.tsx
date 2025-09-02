'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useParams, useRouter } from 'next/navigation';
import { firestore } from '@/lib/firebase';
import type { Message, UserProfile } from '@/lib/types';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessage } from '../actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ChatPage() {
    const { chatId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatId || !user) return;
        setLoading(true);

        const chatRef = doc(firestore, 'chats', chatId as string);
        const unsubChat = onSnapshot(chatRef, async (docSnap) => {
            if (docSnap.exists()) {
                const members = docSnap.data().members;
                const recipientId = members.find((m: string) => m !== user.uid);
                if (recipientId) {
                    const userSnap = await getDoc(doc(firestore, 'users', recipientId));
                    setRecipient(userSnap.data() as UserProfile);
                }
            }
        });

        const messagesQuery = query(collection(firestore, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'));
        const unsubMessages = onSnapshot(messagesQuery, (querySnapshot) => {
            const msgs: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
        });

        return () => {
            unsubChat();
            unsubMessages();
        };

    }, [chatId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        setIsSubmitting(true);
        const result = await sendMessage(chatId as string, user.uid, newMessage);
        if (result.success) {
            setNewMessage('');
        } else {
            toast({ variant: 'destructive', title: "Failed to send message", description: result.error });
        }
        setIsSubmitting(false);
    }

    if (authLoading || loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
        )
    }
    
    if (!recipient) {
         return (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mt-4">Chat not found</h2>
                <p className="text-muted-foreground mt-2">
                   This chat may have been deleted or does not exist.
                </p>
                 <Button asChild variant="link" className="mt-4" onClick={() => router.push('/messages')}>Go to Messages</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center p-3 border-b">
                 <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => router.push('/messages')}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <Link href={`/profile/${recipient.uid}`} className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={recipient.photoURL} />
                        <AvatarFallback>{recipient.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{recipient.displayName}</span>
                </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={cn(
                        "flex items-end gap-2",
                        msg.senderId === user?.uid ? "justify-end" : "justify-start"
                    )}>
                        {msg.senderId !== user?.uid && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={recipient.photoURL} />
                                <AvatarFallback>{recipient.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn(
                            "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                            msg.senderId === user?.uid 
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        )}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input 
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" size="icon" disabled={isSubmitting || !newMessage.trim()}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
