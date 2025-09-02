'use server';

import * as admin from 'firebase-admin';
import { getFirestoreAdmin } from '@/lib/firebase-admin';

/**
 * Approves a pending payout request.
 * This action should only be callable by an administrator.
 * @param payoutId The ID of the payout document to approve.
 * @returns An object indicating success or failure.
 */
export async function approvePayout(payoutId: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const payoutRef = firestoreAdmin.doc(`payouts/${payoutId}`);
    
    try {
        await payoutRef.update({
            status: 'completed',
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // You might also want to send a notification to the user here.

        return { success: true };
    } catch (error: any) {
        console.error('Error approving payout:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Rejects a pending payout request and refunds the coins to the user.
 * This action should only be callable by an administrator.
 * @param payoutId The ID of the payout document to reject.
 * @param reason A reason for the rejection, which could be shown to the user.
 * @returns An object indicating success or failure.
 */
export async function rejectPayout(payoutId: string, reason: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const payoutRef = firestoreAdmin.doc(`payouts/${payoutId}`);

    try {
        await firestoreAdmin.runTransaction(async (transaction) => {
            const payoutDoc = await transaction.get(payoutRef);
            if (!payoutDoc.exists) {
                throw new Error('Payout document not found.');
            }
            if (payoutDoc.data()?.status !== 'pending') {
                throw new Error('This payout has already been processed.');
            }

            const { uid, coinsRequested } = payoutDoc.data()!;
            const userRef = firestoreAdmin.doc(`users/${uid}`);
            const walletRef = firestoreAdmin.doc(`wallets/${uid}`);
            
            // 1. Update payout status to 'failed'
            transaction.update(payoutRef, {
                status: 'failed',
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                rejectionReason: reason
            });

            // 2. Refund coins to the user and wallet
            transaction.update(userRef, { coins: admin.firestore.FieldValue.increment(coinsRequested) });
            transaction.update(walletRef, { balance: admin.firestore.FieldValue.increment(coinsRequested) });
            
            // 3. Create a transaction log for the refund
            const refundTxRef = walletRef.collection('transactions').doc();
            transaction.set(refundTxRef, {
                kind: 'earn', // It's an 'earn' from the user's perspective
                reason: 'refund',
                coins: coinsRequested,
                status: 'success',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                meta: {
                    payoutId: payoutId,
                    note: `Refund for rejected payout: ${reason}`
                }
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error rejecting payout:', error);
        return { success: false, error: error.message };
    }
}
