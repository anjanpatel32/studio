
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, UserPlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'payout';
    user?: {
        name: string;
        avatarUrl: string;
    };
    text: string;
    time: any; // Firestore Timestamp
    reelThumbnailUrl?: string;
    reelId?: string;
    userId?: string;
    status?: string;
    payoutId?: string;
    seen: boolean;
}


const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'like':
            return <Heart className="h-5 w-5 text-red-500" />;
        case 'comment':
            return <MessageCircle className="h-5 w-5 text-primary" />;
        case 'follow':
            return <UserPlus className="h-5 w-5 text-green-500" />;
        case 'payout':
            return <span className="text-xl">💰</span>;
        default:
            return null;
    }
}


export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const notificationsRef = collection(firestore, `users/${user.uid}/notifications`);
        const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notifs: Notification[] = querySnapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data(),
                 time: doc.data().createdAt,
            } as Notification));
            setNotifications(notifs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if(loading) {
        return (
             <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        
        {notifications.length > 0 ? (
            <div className="space-y-4">
            {notifications.map((notif) => (
                <Card key={notif.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="relative">
                            {notif.user && (
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={notif.user.avatarUrl} alt={notif.user.name} />
                                    <AvatarFallback>{notif.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                               <NotificationIcon type={notif.type} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <p className="text-sm">
                                {notif.user && <span className="font-semibold">{notif.user.name}</span>}{' '}
                                {notif.text}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {notif.time ? formatDistanceToNow(notif.time.toDate(), { addSuffix: true }) : ''}
                            </p>
                        </div>
                        
                        {notif.reelThumbnailUrl && (
                            <Link href={`/reel/${notif.reelId}`}>
                                <Image 
                                    src={notif.reelThumbnailUrl}
                                    alt="Reel thumbnail"
                                    width={50}
                                    height={50}
                                    className="rounded-md object-cover aspect-square"
                                    data-ai-hint="social media video"
                                />
                            </Link>
                        )}
                        {notif.type === 'follow' && (
                             <Link href={`/profile/${notif.userId}`} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90">
                                View Profile
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ))}
            </div>
        ) : (
             <div className="text-center py-16">
                <h2 className="text-xl font-semibold">No new notifications</h2>
                <p className="text-muted-foreground mt-2">
                    Likes, comments, and other updates will appear here.
                </p>
            </div>
        )}
      </div>
    );
  }
