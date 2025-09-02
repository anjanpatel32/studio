
'use client';

import { useState, useEffect } from 'react';
import ReelCard from '@/components/reel-card';
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc, where, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Reel, Story, UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';


const Stories = ({ lng }: { lng: string }) => {
    const { user } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const fetchStories = async () => {
             // Get the list of users the current user is following
            const followingRef = collection(firestore, `users/${user.uid}/following`);
            const followingSnapshot = await getDocs(followingRef);
            const followingIds = followingSnapshot.docs.map(doc => doc.id);

            // Include the current user's own stories
            const allUserIds = [...new Set([user.uid, ...followingIds])];

             if (allUserIds.length === 0) {
                setStories([]);
                setLoading(false);
                return;
            }

            const storiesQuery = query(
                collection(firestore, 'stories'),
                where('ownerUid', 'in', allUserIds),
                where('expiresAt', '>', new Date()),
                orderBy('expiresAt', 'desc')
            );

            const unsubscribe = onSnapshot(storiesQuery, async (snapshot) => {
                const storiesData = await Promise.all(snapshot.docs.map(async (storyDoc) => {
                    const story = storyDoc.data() as Story;
                    const userDoc = await getDoc(doc(firestore, 'users', story.ownerUid));
                    return {
                        ...story,
                        id: storyDoc.id,
                        user: userDoc.data() as UserProfile
                    }
                }));
                setStories(storiesData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching stories: ", error);
                setLoading(false);
            });

            return unsubscribe;
        }


        const unsubscribePromise = fetchStories();

        return () => {
            unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex space-x-4 p-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1">
                        <div className="rounded-full bg-muted h-16 w-16 animate-pulse" />
                        <div className="bg-muted h-2 w-12 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }
    
    if (stories.length === 0) return null;

    return (
        <div className="p-4 border-b">
            <div className="flex space-x-4 overflow-x-auto no-scrollbar">
                 {stories.map(story => (
                    <Link href={`/${lng}/stories/${story.user.uid}`} key={story.id}>
                        <div className="flex flex-col items-center space-y-1 cursor-pointer">
                            <Avatar className="h-16 w-16 border-2 border-pink-500">
                                <AvatarImage src={story.user.photoURL} />
                                <AvatarFallback>{story.user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs truncate w-16 text-center">{story.user.displayName}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}


export default function HomePage() {
  const params = useParams();
  const lng = params.lng as string;
  const { user, loading: authLoading } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let unsubscribe: () => void = () => {};

    if (!user) {
        // If not logged in, show a generic feed of public reels
        const reelsCollection = collection(firestore, 'reels');
        const q = query(reelsCollection, where('visibility', '==', 'public'), orderBy('createdAt', 'desc'), limit(10));
        
        unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const reelsWithUsers = await fetchUsersForReels(querySnapshot.docs);
            setReels(reelsWithUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching public reels: ", error);
            setLoading(false);
        });
    } else {
        // If logged in, fetch reels from followed users
        const followingRef = collection(firestore, `users/${user.uid}/following`);
        unsubscribe = onSnapshot(followingRef, (followingSnapshot) => {
            const followingIds = followingSnapshot.docs.map(doc => doc.id);
            const feedUserIds = [...new Set([user.uid, ...followingIds])]; // Include own reels

            if (feedUserIds.length === 0) {
                // Handle case where user is new and follows no one
                setReels([]);
                setLoading(false);
                return;
            }

            const reelsCollection = collection(firestore, 'reels');
            const q = query(reelsCollection, where('ownerUid', 'in', feedUserIds), orderBy('createdAt', 'desc'), limit(20));
            
            const unsubscribeReels = onSnapshot(q, async (querySnapshot) => {
                const reelsWithUsers = await fetchUsersForReels(querySnapshot.docs);
                setReels(reelsWithUsers);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching feed reels: ", error);
                setLoading(false);
            });
            
            // This is a bit tricky, we need to return the nested unsubscribe
            // For simplicity in this structure, we'll just re-assign it.
            unsubscribe = unsubscribeReels;
        });
    }

    return () => unsubscribe();

  }, [user, authLoading]);

  const fetchUsersForReels = async (docs: any[]) => {
      const reelsData = docs.map(doc => ({ ...doc.data(), id: doc.id })) as Reel[];
      return await Promise.all(reelsData.map(async (reel) => {
        const userDoc = await getDoc(doc(firestore, 'users', reel.ownerUid));
        return {
            ...reel,
            user: userDoc.exists()
            ? {
                id: reel.ownerUid,
                name: userDoc.data().displayName || 'Unknown User',
                avatarUrl: userDoc.data().photoURL || 'https://placehold.co/40x40.png'
                }
            : {
                id: reel.ownerUid,
                name: 'Unknown User',
                avatarUrl: 'https://placehold.co/40x40.png'
            }
        };
    }));
  }


  if (loading || authLoading) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      );
  }

  return (
    <>
    <Stories lng={lng}/>
    <div className="relative h-[calc(100vh-4rem-8rem)] w-full max-w-md mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar">
       {reels.length > 0 ? reels.map((reel, index) => (
        <div key={reel.id} className="h-full w-full snap-start flex-shrink-0 flex items-center justify-center">
          <div className="h-full w-full aspect-[9/16] max-h-[calc(85vh-8rem)] relative">
            <ReelCard reel={reel} lng={lng} />
          </div>
        </div>
      )) : (
        <div className="flex h-full flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-semibold">Welcome to ZYREEL</h2>
          <p className="text-muted-foreground mt-2">
            {user ? "Your feed is empty. Start by following some creators to see their reels here." : "Sign up or log in to see a personalized feed."}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${lng}/explore`}>Explore Creators</Link>
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
