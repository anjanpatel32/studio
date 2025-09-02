
'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import type { TaggedContent } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useTranslation } from '@/app/i18n';

async function getTaggedContent(tag: string): Promise<TaggedContent[]> {
    const firestoreAdmin = getFirestoreAdmin();

    const reelsPromise = firestoreAdmin
        .collection('reels')
        .where('hashtags', 'array-contains', tag)
        .orderBy('createdAt', 'desc')
        .get();

    const postsPromise = firestoreAdmin
        .collection('posts')
        .where('hashtags', 'array-contains', tag)
        .orderBy('createdAt', 'desc')
        .get();

    const [reelsSnapshot, postsSnapshot] = await Promise.all([reelsPromise, postsPromise]);
    
    const reels: TaggedContent[] = reelsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            type: 'reel',
            thumbnailUrl: data.thumbnailUrl,
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
        };
    });

    const posts: TaggedContent[] = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            type: 'post',
            thumbnailUrl: data.imageUrls?.[0] || 'https://placehold.co/500x500.png',
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
        };
    });

    // For now, we'll just concatenate them. A more sophisticated feed might interleave them.
    return [...reels, ...posts];
}


export default async function TagPage({ params }: { params: { tag: string; lng: string; } }) {
    const { lng, tag: encodedTag } = params;
    const { t } = await useTranslation(lng);
    const tag = decodeURIComponent(encodedTag);
    const content = await getTaggedContent(tag);
    
    if (content.length === 0) {
        // Optional: you could check if the tag exists at all, but for now we'll just show no posts.
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold">#{tag}</h1>
                <p className="text-muted-foreground mt-2">{content.length} {t('posts')}</p>
            </div>
            
            {content.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                    {content.map((item) => (
                        <Link href={item.type === 'reel' ? `/${lng}/reel/${item.id}` : `/${lng}/post/${item.id}`} key={item.id}>
                            <Card className="overflow-hidden group aspect-square">
                                <CardContent className="p-0 relative">
                                    <Image
                                        src={item.thumbnailUrl || 'https://placehold.co/500x500.png'}
                                        alt={`Content for #${tag}`}
                                        width={500}
                                        height={500}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        data-ai-hint="social media content"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-5 w-5" />
                                                <span>{item.likesCount}</span>
                                            </div>
                                             <div className="flex items-center gap-1">
                                                <MessageCircle className="h-5 w-5" />
                                                <span>{item.commentsCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold">No posts yet</h2>
                    <p className="text-muted-foreground mt-2">
                        There are no posts with the #{tag} tag. Why not be the first?
                    </p>
                </div>
            )}
        </div>
    );
}
