'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, History, Gift, Loader2, Video } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Transaction } from '@/lib/types';
import Link from 'next/link';
import { awardAdReward } from '@/app/rewards/actions';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

interface DailyStats {
    date: string;
    watchedCount: number;
    uploadedCount: number;
    sharedCount: number;
}

export default function RewardsPage() {
    const params = useParams();
    const lng = params.lng as string;
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useUserProfile(user?.uid);
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [isWatchingAd, setIsWatchingAd] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            setLoadingTransactions(true);
            const txCollection = collection(firestore, `wallets/${user.uid}/transactions`);
            const q = query(txCollection, orderBy('createdAt', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            const txs: Transaction[] = [];
            querySnapshot.forEach(doc => {
                txs.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            setTransactions(txs);
            setLoadingTransactions(false);
        };

        const unsubStats = onSnapshot(doc(firestore, "wallets", user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                 if (data.dailyStats) {
                    const today = new Date().toISOString().slice(0, 10);
                    if (data.dailyStats.date === today) {
                        setDailyStats(data.dailyStats);
                    } else {
                        setDailyStats({ date: today, watchedCount: 0, uploadedCount: 0, sharedCount: 0 });
                    }
                } else {
                     setDailyStats({ date: new Date().toISOString().slice(0, 10), watchedCount: 0, uploadedCount: 0, sharedCount: 0 });
                }
            }
            setLoadingStats(false);
        });

        fetchTransactions();
        return () => unsubStats();
    }, [user]);

    const handleWatchAd = async () => {
        if (!user) return;
        setIsWatchingAd(true);

        await new Promise(resolve => setTimeout(resolve, 3000));

        const result = await awardAdReward(user.uid);
        if (result.success) {
            toast({
                title: "Reward Received!",
                description: `You've earned ${result.coinsAwarded} coins.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to get reward',
                description: result.error
            })
        }

        setIsWatchingAd(false);
    }
    
    const isLoading = authLoading || profileLoading || loadingTransactions || loadingStats;

    const limits = {
        watch: 100,
        upload: 100,
        share: 100,
    };

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <div className="mb-8 text-left">
                <h1 className="text-3xl font-bold">Rewards & Wallet</h1>
                <p className="text-muted-foreground mt-2">Earn coins by engaging with the community and redeem them for rewards.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-6 w-6 text-yellow-500" />
                            <span>Your Balance</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-12 w-36 bg-muted rounded animate-pulse" />
                        ) : (
                            <p className="text-5xl font-bold">{profile?.coins?.toLocaleString() || 0}</p>
                        )}
                        <p className="text-muted-foreground mt-1">coins</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href={`/${lng}/rewards/redeem`}>
                                <Gift className="mr-2 h-4 w-4" />
                                Redeem Coins
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Limits</CardTitle>
                        <CardDescription>Limits reset every 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        { isLoading ? <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div> : <>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Watched Reels</span>
                                <span className="text-sm text-muted-foreground">{dailyStats?.watchedCount || 0} / {limits.watch}</span>
                            </div>
                            <Progress value={((dailyStats?.watchedCount || 0) / limits.watch) * 100} />
                        </div>
                         <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Uploaded Reels</span>
                                <span className="text-sm text-muted-foreground">{dailyStats?.uploadedCount || 0} / {limits.upload}</span>
                            </div>
                            <Progress value={((dailyStats?.uploadedCount || 0) / limits.upload) * 100} />
                        </div>
                         <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Shared Reels</span>
                                <span className="text-sm text-muted-foreground">{dailyStats?.sharedCount || 0} / {limits.share}</span>
                            </div>
                            <Progress value={((dailyStats?.sharedCount || 0) / limits.share) * 100} />
                        </div>
                        </> }
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Watch & Earn</CardTitle>
                        <CardDescription>Watch a short ad to earn a reward.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button onClick={handleWatchAd} disabled={isWatchingAd || (dailyStats?.watchedCount ?? 0) >= limits.watch} className="w-full">
                           {isWatchingAd ? (
                               <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ad in progress...</>
                           ) : (
                               <><Video className="mr-2 h-4 w-4" /> Watch Ad for 10 Coins</>
                           )}
                       </Button>
                       <p className='text-xs text-muted-foreground mt-2 text-center'>
                           This is a simulation. You can watch {limits.watch - (dailyStats?.watchedCount || 0)} more ads today.
                       </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>How to Earn</CardTitle>
                        <CardDescription>Complete tasks to earn more coins.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                       <div className="flex items-center justify-between">
                           <span className="font-medium">Watch a Reel (&gt;= 80%)</span>
                           <span className="font-semibold text-primary">+5 Coins</span>
                       </div>
                        <div className="flex items-center justify-between">
                           <span className="font-medium">Upload a Reel</span>
                           <span className="font-semibold text-primary">+10 Coins</span>
                       </div>
                        <div className="flex items-center justify-between">
                           <span className="font-medium">Share a Reel</span>
                           <span className="font-semibold text-primary">+10 Coins</span>
                       </div>
                       <div className="flex items-center justify-between">
                           <span className="font-medium">Watch an Ad</span>
                           <span className="font-semibold text-primary">+10 Coins</span>
                       </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-6 w-6" />
                        <span>Transaction History</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-4">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between">
                                    <div className="flex-1 text-left">
                                        <p className="font-medium capitalize">{tx.reason.replace(/_/g, ' ')}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {tx.createdAt ? formatDistanceToNow(tx.createdAt.toDate(), { addSuffix: true }) : ''}
                                        </p>
                                    </div>
                                    <div className='text-right shrink-0'>
                                        <Badge variant={tx.kind === 'earn' ? 'default' : 'destructive'} className="w-20 justify-end">
                                            {tx.kind === 'earn' ? '+' : ''}{tx.coins.toLocaleString()}
                                        </Badge>
                                        <p className='text-xs text-muted-foreground capitalize'>{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center p-8">No transactions yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
