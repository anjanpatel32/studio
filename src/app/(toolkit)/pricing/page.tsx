'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, IndianRupee, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

declare const Cashfree: any;

const proFeatures = [
    'Unlimited code compilations',
    'AI-powered code debugging',
    'Priority access to new features',
    'Ad-free experience',
    'Premium support'
]

export default function PricingPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const auth = getAuth(app);
    const user = auth.currentUser;

    const getSessionId = async () => {
        // ### IMPORTANT SERVER-SIDE LOGIC REQUIRED ###
        // This is a placeholder. In a real application, you would make a fetch request 
        // to your own backend server. This server would then securely call the Cashfree 
        // Order API with your secret key to create a payment session.
        // Your backend should return the `payment_session_id`.
        //
        // Example backend function (using Node.js):
        //
        // const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'x-api-version': '2023-08-01',
        //     'x-client-id': 'YOUR_APP_ID',
        //     'x-client-secret': 'YOUR_SECRET_KEY'
        //   },
        //   body: JSON.stringify({
        //     "order_amount": 99.00,
        //     "order_currency": "INR",
        //     "order_id": `order_${Date.now()}`,
        //     "customer_details": {
        //         "customer_id": user.uid,
        //         "customer_email": user.email,
        //         "customer_phone": "9999999999" // Or get from user profile
        //     }
        //   })
        // });
        // const data = await response.json();
        // return data.payment_session_id;

        toast({
            variant: "destructive",
            title: "Backend Required",
            description: "A backend endpoint is needed to generate a payment session.",
        });
        // This is a placeholder and will fail. Replace with a real session ID.
        return "session_placeholder_id"; 
    };

    const handlePayment = async () => {
        setIsLoading(true);
        if (!user) {
            toast({
                variant: "destructive",
                title: "Not Signed In",
                description: "You must be signed in to make a purchase.",
            });
            setIsLoading(false);
            return;
        }

        try {
            const sessionId = await getSessionId();
            
            if (sessionId === "session_placeholder_id") {
                 setIsLoading(false);
                 return;
            }

            const cashfree = new Cashfree(sessionId);
            const paymentDom = document.getElementById("payment-dom");

            if (!paymentDom) {
                console.error("Payment DOM element not found");
                setIsLoading(false);
                return;
            }

            const components = ["order-details", "card", "upi", "netbanking"];
            cashfree.drop(paymentDom, {
                components,
                onSuccess: (data: any) => {
                    console.log("Payment successful:", data);
                    toast({
                        title: 'Payment Successful!',
                        description: 'Welcome to StudentKit Pro!',
                    });
                     // Here you would typically update the user's status in your database
                    setIsLoading(false);
                },
                onFailure: (data: any) => {
                    console.error("Payment failed:", data);
                    toast({
                        variant: 'destructive',
                        title: 'Payment Failed',
                        description: 'Your payment could not be processed. Please try again.',
                    });
                    setIsLoading(false);
                },
            });

        } catch (error) {
            console.error("Error setting up payment:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not initiate the payment process.',
            });
            setIsLoading(false);
        }
    };

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
                        <div id="payment-dom"></div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={handlePayment} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <IndianRupee className="mr-2 h-5 w-5" />}
                            {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
