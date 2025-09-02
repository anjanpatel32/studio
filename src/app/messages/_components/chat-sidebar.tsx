'use client';

import { useAuth } from "@/hooks/use-auth";
import { firestore } from "@/lib/firebase";
import type { Chat } from "@/lib/types";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { UserProfile } from "@/lib/types";

interface ChatWithRecipient extends Chat {
    recipient: UserProfile | null;
}

const ChatListItem = ({ chat, isActive }: { chat: ChatWithRecipient; isActive: boolean }) => {
    if (!chat.recipient) {
        return (
            <div className="flex items-center space-x-3 p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
        )
    }

    return (
        <Link href={`/messages/${chat.id}`} className={cn(
            "block p-3 rounded-lg hover:bg-muted",
            isActive && "bg-muted"
        )}>
            <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.recipient.photoURL} />
                    <AvatarFallback>{chat.recipient.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate">{chat.recipient.displayName}</h3>
                        {chat.lastMessage?.createdAt && (
                             <p className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(chat.lastMessage.createdAt.toDate(), { addSuffix: true })}
                            </p>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage?.text || 'No messages yet'}
                    </p>
                </div>
            </div>
        </Link>
    )
}


export function ChatSidebar() {
    const { user, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const [chats, setChats] = useState<ChatWithRecipient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(firestore, 'chats'),
            where('members', 'array-contains', user.uid),
            orderBy('lastMessage.createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const chatsData = await Promise.all(
                querySnapshot.docs.map(async (chatDoc) => {
                    const chat = { id: chatDoc.id, ...chatDoc.data() } as Chat;
                    const recipientId = chat.members.find(m => m !== user.uid);
                    let recipient: UserProfile | null = null;
                    if (recipientId) {
                        const userSnap = await getDoc(doc(firestore, 'users', recipientId));
                        recipient = userSnap.data() as UserProfile;
                    }
                    return { ...chat, recipient };
                })
            );
            setChats(chatsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const activeChatId = pathname.split('/messages/')[1];

    if (authLoading || loading) {
        return (
            <div className="w-80 border-r p-4 space-y-4">
                {[...Array(5)].map((_, i) => <ChatListItem key={i} chat={{} as any} isActive={false} />)}
            </div>
        )
    }
    
    return (
        <aside className="w-80 border-r p-2">
            <h2 className="p-3 text-lg font-semibold">Messages</h2>
            <div className="space-y-1">
                {chats.length > 0 ? (
                    chats.map(chat => (
                        <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} />
                    ))
                ) : (
                    <p className="text-muted-foreground text-center p-4">No conversations yet.</p>
                )}
            </div>
        </aside>
    )
}
