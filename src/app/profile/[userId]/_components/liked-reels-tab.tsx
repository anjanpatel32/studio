
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Reel } from '@/lib/types';
import { getLikedReels } from '@/app/reels/actions';

interface LikedReelsTabProps {
    userId: string;
    isOwnProfile: boolean;
}

export function LikedReelsTab({ userId, isOwnProfile }: LikedReelsTabProps) {
    const [likedReels, setLikedReels] = useState<Partial<Reel>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOwnProfile) {
            setLoading(false);
            return;
        }

        const fetchLikedReels = async () => {
            setLoading(true);
            const reels = await getLikedReels(userId);
            setLikedReels(reels);
            setLoading(false);
        };

        fetchLikedReels();
    }, [userId, isOwnProfile]);

    if (!isOwnProfile) {
        return (
            <p className="text-muted-foreground text-center mt-8">
                This user's liked reels are private.
            </p>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center mt-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (likedReels.length === 0) {
        return (
             <p className="text-muted-foreground text-center mt-8">
                You haven't liked any reels yet.
            </p>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mt-4">
            {likedReels.map((reel) => (
                <Link href={`/reel/${reel.id}`} key={reel.id}>
                     <Card className="overflow-hidden aspect-[9/16] group">
                        <CardContent className="p-0">
                            <Image
                                src={reel.thumbnailUrl || 'https://placehold.co/300x500.png'}
                                alt="Liked reel thumbnail"
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
    );
}
