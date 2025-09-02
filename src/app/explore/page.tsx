
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getExploreReels, type ReelWithUser } from './actions';
import Link from 'next/link';

export default function ExplorePage() {
  const [reels, setReels] = useState<ReelWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      const exploreReels = await getExploreReels();
      setReels(exploreReels);
      setLoading(false);
    };

    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Explore</h1>
      {reels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {reels.map((reel) => (
            <Link href={`/reel/${reel.id}`} key={reel.id}>
              <Card className="overflow-hidden aspect-[9/16] group">
                <CardContent className="p-0 relative">
                  <Image
                    src={reel.thumbnailUrl || 'https://placehold.co/300x500.png'}
                    alt={`Reel by ${reel.user.name}`}
                    width={300}
                    height={500}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    data-ai-hint="social media video"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-bold">{reel.user.name}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center mt-8">
          No reels to explore right now. Check back later!
        </p>
      )}
    </div>
  );
}
