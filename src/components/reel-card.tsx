'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Heart, MessageCircle, Send, Share2, MoreVertical, Loader2 } from 'lucide-react';
import type { Reel, UserProfile, Comment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useFollowStatus } from '@/hooks/use-follow-status';
import { toggleLike, addComment, addShare } from '@/app/reels/actions';
import { toggleFollow } from '@/app/users/actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { firestore } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';

interface ReelCardProps {
  reel: Reel;
  lng: string;
}

export default function ReelCard({ reel, lng }: ReelCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { isFollowing, loading: followLoading } = useFollowStatus(user?.uid, reel.ownerUid);
  
  useEffect(() => {
    if (!user) return;
    // Check if the current user has liked this reel
    const likeRef = doc(firestore, `reels/${reel.id}/likes/${user.uid}`);
    const unsubscribe = onSnapshot(likeRef, (doc) => {
        setIsLiked(doc.exists());
    });
    return () => unsubscribe();
  }, [reel.id, user]);

  useEffect(() => {
    // Fetch comments
    const commentsQuery = query(collection(firestore, `reels/${reel.id}/comments`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
        const commentsData = await Promise.all(snapshot.docs.map(async (doc) => {
            const comment = doc.data() as Comment;
            const userSnap = await getDoc(firestore.doc(firestore, 'users', comment.uid));
            return {
                ...comment,
                id: doc.id,
                user: userSnap.data() as UserProfile
            };
        }));
        setComments(commentsData);
    });
    return () => unsubscribe();
  }, [reel.id]);


  const handleLike = async () => {
    if (!user) {
      router.push(`/${lng}/login`);
      return;
    }
    const originalLiked = isLiked;
    const originalLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    const { success } = await toggleLike(reel.id, user.uid, originalLiked);
    if (!success) {
        setIsLiked(originalLiked);
        setLikesCount(originalLikesCount);
        toast({ variant: 'destructive', title: 'Failed to update like.' });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
          router.push(`/${lng}/login`);
          return;
      }
      if (!newComment.trim()) return;

      setIsSubmittingComment(true);
      const { success } = await addComment(reel.id, user.uid, newComment);
      if(success) {
          setNewComment('');
      } else {
          toast({ variant: 'destructive', title: 'Failed to add comment.' });
      }
      setIsSubmittingComment(false);
  }

  const handleShare = async () => {
    await addShare(reel.id);
    toast({ title: 'Shared!', description: 'The share count has been updated.' });
  }

  const handleFollowToggle = async () => {
      if (!user) {
        router.push(`/${lng}/login`);
        return;
      }
      await toggleFollow(user.uid, reel.ownerUid, isFollowing);
  };
  
  const isOwnReel = user?.uid === reel.ownerUid;

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        playsInline
        className="w-full h-full object-cover"
        onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none"></div>

      {/* Header */}
      <div className="absolute top-4 left-4 text-white z-10 flex items-center gap-2">
        <Link href={`/${lng}/profile/${reel.ownerUid}`}>
            <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={reel.user?.avatarUrl} alt={reel.user?.name} />
            <AvatarFallback>{reel.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
        </Link>
        <div>
            <Link href={`/${lng}/profile/${reel.ownerUid}`}>
                <h3 className="font-semibold text-sm">{reel.user?.name}</h3>
            </Link>
        </div>
        {!isOwnReel && !followLoading && (
            <Button size="sm" variant={isFollowing ? 'secondary' : 'default'} onClick={handleFollowToggle} className="h-7 text-xs px-3">
                {isFollowing ? 'Following' : 'Follow'}
            </Button>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-4 text-white z-10">
        <p className="text-sm font-semibold">{reel.caption}</p>
        <p className="text-xs text-white/80">{reel.hashtags?.map(h => `#${h}`).join(' ')}</p>
      </div>

      {/* Side Actions */}
      <div className="absolute right-2 bottom-4 z-10 flex flex-col items-center gap-4 text-white">
        <button className="flex flex-col items-center" onClick={handleLike}>
          <Heart className={cn("h-8 w-8", isLiked ? 'text-red-500 fill-current' : '')} />
          <span className="text-xs">{likesCount}</span>
        </button>

        <Sheet>
            <SheetTrigger asChild>
                <button className="flex flex-col items-center">
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs">{reel.commentsCount}</span>
                </button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Comments ({comments.length})</SheetTitle>
                </SheetHeader>
                <div className="py-4 h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-4">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-2 mb-4">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.user.photoURL} />
                                        <AvatarFallback>{comment.user.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold">{comment.user.displayName}</p>
                                            <p className="text-xs text-muted-foreground">{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : ''}</p>
                                        </div>
                                        <p className="text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-muted-foreground text-center">No comments yet.</p>}
                    </div>
                     {user && (
                         <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
                            <Input 
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={isSubmittingComment}
                            />
                            <Button type="submit" size="icon" disabled={isSubmittingComment}>
                                {isSubmittingComment ? <Loader2 className="animate-spin" /> : <Send />}
                            </Button>
                        </form>
                     )}
                </div>
            </SheetContent>
        </Sheet>
        
        <button className="flex flex-col items-center" onClick={handleShare}>
          <Share2 className="h-8 w-8" />
          <span className="text-xs">{reel.sharesCount}</span>
        </button>
        <button className="flex flex-col items-center">
          <MoreVertical className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}