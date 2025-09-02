'use client';

import { useState, useEffect } from 'react';
import { getFirestoreAdmin } from '@/lib/firebase-admin-client';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import type { Payout, UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { approvePayout, rejectPayout } from '../actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';

const PayoutRow = ({ payout }: { payout: Payout }) => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');


    const handleApprove = async () => {
        setIsProcessing(true);
        const result = await approvePayout(payout.id);
        if (result.success) {
            toast({ title: "Payout Approved" });
        } else {
            toast({ variant: 'destructive', title: "Approval Failed", description: result.error });
        }
        setIsProcessing(false);
    }
    
    const handleReject = async () => {
        if(!rejectionReason.trim()){
            toast({ variant: 'destructive', title: "Reason required", description: "Please provide a reason for rejection."});
            return;
        }
        setIsProcessing(true);
        const result = await rejectPayout(payout.id, rejectionReason);
        if (result.success) {
            toast({ title: "Payout Rejected" });
        } else {
            toast({ variant: 'destructive', title: "Rejection Failed", description: result.error });
        }
        setIsProcessing(false);
        setShowRejectDialog(false);
    }


    return (
      <>
        <TableRow>
            <TableCell>
                <div className="font-medium">{payout.user?.displayName || 'Unknown User'}</div>
                <div className="text-sm text-muted-foreground">{payout.uid}</div>
            </TableCell>
            <TableCell>{payout.upiId}</TableCell>
            <TableCell className="text-right font-mono">{payout.coinsRequested.toLocaleString()}</TableCell>
            <TableCell className="text-right font-mono">{payout.amountInr.toFixed(2)}</TableCell>
            <TableCell>{formatDistanceToNow(payout.requestedAt.toDate(), { addSuffix: true })}</TableCell>
            <TableCell>
                <Badge variant={payout.status === 'pending' ? 'secondary' : 'default'}>{payout.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
                {payout.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleApprove} disabled={isProcessing}>
                           {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4 text-green-500" />}
                        </Button>
                         <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setShowRejectDialog(true)} disabled={isProcessing}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </TableCell>
        </TableRow>

        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reject Payout?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will refund the coins to the user and mark the payout as failed. Please provide a reason.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    placeholder="Reason for rejection (e.g., invalid UPI ID)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm Rejection
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = getFirestoreAdmin();

    useEffect(() => {
        const payoutsQuery = query(
            collection(firestore, 'payouts'),
            orderBy('requestedAt', 'desc')
        );

        const unsubscribe = onSnapshot(payoutsQuery, async (snapshot) => {
            const payoutsData = await Promise.all(snapshot.docs.map(async payoutDoc => {
                const payoutData = payoutDoc.data();
                let userProfile: UserProfile | undefined = undefined;
                try {
                    const userSnap = await getDoc(doc(firestore, 'users', payoutData.uid));
                    if (userSnap.exists()) {
                       userProfile = userSnap.data() as UserProfile;
                    }
                } catch (e) {
                    console.error("Failed to fetch user for payout", e);
                }

                return {
                    id: payoutDoc.id,
                    ...payoutData,
                    user: userProfile,
                } as Payout;
            }));
            setPayouts(payoutsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    if(loading) {
        return (
             <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Payout Requests</CardTitle>
                    <CardDescription>Review and process pending user payout requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>UPI ID</TableHead>
                                <TableHead className="text-right">Coins</TableHead>
                                <TableHead className="text-right">Amount (INR)</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payouts.length > 0 ? (
                                payouts.map(payout => <PayoutRow key={payout.id} payout={payout} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No pending payouts.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
