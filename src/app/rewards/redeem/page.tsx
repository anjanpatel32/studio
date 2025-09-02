
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Coins, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { requestRedeem } from './actions';

const PAYOUT_MIN_COINS = 100;
const COINS_PER_INR = 100;

const formSchema = z.object({
    upiId: z
        .string()
        .min(1, 'UPI ID is required')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, 'Please enter a valid UPI ID'),
    coins: z
        .coerce.number()
        .min(PAYOUT_MIN_COINS, `Minimum ${PAYOUT_MIN_COINS} coins required`)
});

export default function RedeemPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useUserProfile(user?.uid);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            upiId: '',
            coins: PAYOUT_MIN_COINS,
        },
    });

    const watchedCoins = form.watch('coins');

    const payoutAmount = useMemo(() => {
        const coins = Number(watchedCoins);
        if (isNaN(coins) || coins < PAYOUT_MIN_COINS) return 0;
        return coins / COINS_PER_INR;
    }, [watchedCoins]);
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.' });
            return;
        }
        if (values.coins > (profile?.coins || 0)) {
            form.setError('coins', { type: 'manual', message: 'Insufficient balance.' });
            return;
        }
        setIsSubmitting(true);
        
        const result = await requestRedeem({
            uid: user.uid,
            upiId: values.upiId,
            coins: values.coins
        });

        if (result.success) {
            toast({
                title: 'Payout Requested!',
                description: `Your request for ₹${result.amountInr} is being processed. It may take up to 24 hours.`,
            });
            router.push('/rewards');
        } else {
            toast({
                variant: 'destructive',
                title: 'Redemption Failed',
                description: result.error,
            });
        }
        setIsSubmitting(false);
    }

    const isLoading = authLoading || profileLoading;

    return (
        <div className="container mx-auto max-w-lg p-4 md:p-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rewards
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Redeem Coins</CardTitle>
                    <CardDescription>Convert your earned coins into real money via UPI.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <div className="h-10 w-full bg-muted rounded animate-pulse" />
                            <div className="h-10 w-full bg-muted rounded animate-pulse" />
                         </div>
                    ) : (
                        <>
                        <div className="mb-6 p-4 rounded-lg bg-muted flex justify-between items-center">
                           <div className="flex items-center gap-2">
                             <Coins className="h-5 w-5 text-yellow-500" />
                             <span className="font-medium">Your Balance</span>
                           </div>
                           <span className="text-xl font-bold">{profile?.coins?.toLocaleString() || 0}</span>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="upiId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>UPI ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="your-name@bank" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="coins"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Coins to Redeem</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder={`e.g., ${PAYOUT_MIN_COINS}`} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Alert>
                                    <IndianRupee className="h-4 w-4" />
                                    <AlertTitle>Payout Amount</AlertTitle>
                                    <AlertDescription className="font-bold text-lg">
                                       {payoutAmount.toFixed(2)} INR
                                    </AlertDescription>
                                </Alert>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Request...</> : 'Redeem Now'}
                                </Button>
                            </form>
                        </Form>
                        </>
                    )}
                </CardContent>
                 <CardFooter className='text-xs text-muted-foreground'>
                    <p>Payouts are processed within 24 hours. The conversion rate is {COINS_PER_INR} coins = 1 INR.</p>
                 </CardFooter>
            </Card>
        </div>
    );
}
