
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Radio } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { goLive } from '@/app/upload/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LiveCreator({ lng }: { lng: string }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGoLive = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await goLive(user.uid);
            if (result.success && result.streamId) {
                toast({ title: "You are now live!", description: "Your followers have been notified." });
                router.push(`/${lng}/live/${result.streamId}`);
            } else {
                throw new Error(result.error || 'Failed to start live stream.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 text-center">
            <Alert>
                <Radio className="h-4 w-4" />
                <AlertTitle>You're about to go live!</AlertTitle>
                <AlertDescription>
                    Your followers will be notified when you start. Make sure you have a stable internet connection.
                </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center p-8">
                <div className="relative flex items-center justify-center h-32 w-32">
                    <div className="absolute h-full w-full bg-primary/20 rounded-full animate-ping"></div>
                     <div className="relative h-24 w-24 bg-primary/50 rounded-full flex items-center justify-center">
                         <Radio className="h-12 w-12 text-primary-foreground" />
                     </div>
                </div>
            </div>

            <Button size="lg" className="w-full" disabled={isSubmitting} onClick={handleGoLive}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Starting Stream...
                    </>
                ) : (
                    <>
                        <Radio className="mr-2 h-5 w-5" />
                        Go Live Now
                    </>
                )}
            </Button>
        </div>
    );
}
