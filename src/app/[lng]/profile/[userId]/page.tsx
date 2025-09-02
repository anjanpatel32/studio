
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Clapperboard, Loader2, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useParams, useRouter } from 'next/navigation';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Reel } from '@/lib/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFollowStatus } from '@/hooks/use-follow-status';
import { toggleFollow } from '@/app/users/actions';
import { getOrCreateChat } from '@/app/messages/actions';
import { LikedReelsTab } from './_components/liked-reels-tab';
import { useTranslation } from '@/app/i18n/client';

export default function UserProfilePage() {
  const params = useParams();
  const lng = params.lng as string;
  const userId = params.userId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation(lng, 'translation');
  
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { isFollowing, loading: followLoading } = useFollowStatus(user?.uid, userId);

  const [reels, setReels] = useState<Reel[]>([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [isFollowingAction, setIsFollowingAction] = useState(false);
  const [isMessagingAction, setIsMessagingAction] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchReels = async () => {
      setLoadingReels(true);
      const q = query(collection(firestore, 'reels'), where('ownerUid', '==', userId));
      const querySnapshot = await getDocs(q);
      const userReels: Reel[] = [];
      querySnapshot.forEach((doc) => {
        userReels.push({ id: doc.id, ...doc.data() } as Reel);
      });
      setReels(userReels);
      setLoadingReels(false);
    };

    fetchReels();
  }, [userId]);
  
  const handleFollowToggle = async () => {
      if (!user) {
          router.push(`/${lng}/login`);
          return;
      }
      setIsFollowingAction(true);
      await toggleFollow(user.uid, userId, isFollowing);
      setIsFollowingAction(false);
  }

  const handleMessage = async () => {
    if (!user) {
        router.push(`/${lng}/login`);
        return;
    }
    setIsMessagingAction(true);
    const result = await getOrCreateChat(user.uid, userId);
    if(result.success) {
        router.push(`/${lng}/messages/${result.chatId}`);
    } else {
        // show toast
        setIsMessagingAction(false);
    }
  }


  if (authLoading || profileLoading || loadingReels || followLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  if (!profile) {
      return <div className="text-center p-8">User not found.</div>
  }

  const isOwnProfile = user?.uid === userId;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-4 md:space-y-0 md:space-x-8 mb-8">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 shrink-0">
          <AvatarImage src={profile.photoURL} data-ai-hint="profile avatar" />
          <AvatarFallback className="text-4xl">{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
          <div className="flex justify-center md:justify-start space-x-6 my-3 text-lg">
            <div>
              <span className="font-bold">{reels.length}</span>
              <span className="text-muted-foreground"> {t('reels')}</span>
            </div>
            <div>
              <span className="font-bold">{(profile.followersCount || 0)}</span>
              <span className="text-muted-foreground"> {t('followers')}</span>
            </div>
            <div>
              <span className="font-bold">{profile.followingCount || 0}</span>
              <span className="text-muted-foreground"> {t('following')}</span>
            </div>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap max-w-prose">{profile.bio}</p>
          <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
            {isOwnProfile ? (
                <>
                 <Button variant="secondary" asChild>
                    <Link href={`/${lng}/profile/edit`}>{t('editProfile')}</Link>
                </Button>
                 <Button variant="ghost" size="icon" asChild>
                    <Link href={`/${lng}/settings`}>
                        <Settings className="h-5 w-5" />
                    </Link>
                </Button>
                </>
            ) : (
                <>
                <Button onClick={handleFollowToggle} disabled={isFollowingAction}>
                    {isFollowingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    {isFollowing ? t('unfollow') : t('follow')}
                </Button>
                <Button variant="secondary" onClick={handleMessage} disabled={isMessagingAction}>
                    {isMessagingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageCircle className="mr-2 h-4 w-4"/> }
                    {t('message')}
                </Button>
                </>
            )}
           
          </div>
        </div>
      </div>

      <Tabs defaultValue="reels" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reels">
            <Clapperboard className="mr-2 h-4 w-4" /> {t('reels')}
          </TabsTrigger>
          <TabsTrigger value="liked">
            <Heart className="mr-2 h-4 w-4" /> {t('liked')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reels">
            {reels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mt-4">
                    {reels.map((reel) => (
                      <Link href={`/${lng}/reel/${reel.id}`} key={reel.id}>
                        <Card className="overflow-hidden aspect-[9/16] group">
                            <CardContent className="p-0">
                            <Image
                                src={reel.thumbnailUrl || 'https://placehold.co/300x500.png'}
                                alt="Reel thumbnail"
                                width={300}
                                height={500}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                data-ai-hint="social media video"
                            />
                            </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center mt-8">This user hasn't posted any reels yet.</p>
            )}
        </TabsContent>
        <TabsContent value="liked">
            <LikedReelsTab userId={userId} isOwnProfile={isOwnProfile} lng={lng}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
