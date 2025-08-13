
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, IndianRupee } from 'lucide-react';
import React from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';

const proFeatures = [
    'Unlimited code compilations',
    'AI-powered code debugging',
    'Priority access to new features',
    'Ad-free experience',
    'Premium support'
]

export default function PricingPage() {
    const { toast } = useToast();
    const auth = getAuth(app);
    const user = auth.currentUser;
    
    const paymentLink = "upi://pay?pa=9666335190@axl&pn=KOPPULA%20ANJAN%20KUMAR&mc=0000&mode=02&purpose=00";

    const handlePaymentClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!user) {
            e.preventDefault();
            toast({
                variant: "destructive",
                title: "Not Signed In",
                description: "You must be signed in to make a purchase.",
            });
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Pricing Plans</h1>
                <p className="text-muted-foreground mt-1">
                    Choose the plan that's right for you.
                </p>
            </div>

            <div className="flex justify-center">
                 <Card className="max-w-md w-full">
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-3xl font-headline">StudentKit Pro</CardTitle>
                        <CardDescription>Unlock all premium features and compile without limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <span className="text-5xl font-bold">₹99</span>
                            <span className="text-muted-foreground">/ month</span>
                        </div>
                        <ul className="space-y-3">
                            {proFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" asChild>
                           <Link href={paymentLink} onClick={handlePaymentClick}>
                             <IndianRupee className="mr-2 h-5 w-5" />
                             Upgrade to Pro
                           </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
