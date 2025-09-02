
'use server';

import * as admin from 'firebase-admin';
import { getFirestoreAdmin } from '@/lib/firebase-admin';

const AD_REWARD_COINS = 10;
const AD_WATCH_LIMIT = 100; // Max ads per day

export async function awardAdReward(uid: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const userRef = firestoreAdmin.doc(`users/${uid}`);
    const walletRef = firestoreAdmin.doc(`wallets/${uid}`);
    
    try {
        const { coinsAwarded } = await firestoreAdmin.runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(walletRef);
            if (!walletDoc.exists) {
                throw new Error('Wallet not found for user.');
            }

            const walletData = walletDoc.data()!;
            const today = new Date().toISOString().slice(0, 10);
            let dailyStats = walletData.dailyStats;

            // Reset daily stats if it's a new day
            if (dailyStats.date !== today) {
                dailyStats = {
                    date: today,
                    watchedCount: 0,
                    uploadedCount: 0,
                    sharedCount: 0,
                };
            }
            
            // Check daily limit for watching ads
            if (dailyStats.watchedCount >= AD_WATCH_LIMIT) {
                throw new Error('You have reached your daily limit for watching ads.');
            }

            // Increment the watched count for today
            dailyStats.watchedCount += 1;
            
            // Update balances and stats
            transaction.update(walletRef, { 
                balance: admin.firestore.FieldValue.increment(AD_REWARD_COINS),
                dailyStats: dailyStats,
            });
            transaction.update(userRef, { coins: admin.firestore.FieldValue.increment(AD_REWARD_COINS) });

            // Create transaction log
            const transactionRef = walletRef.collection('transactions').doc();
            transaction.set(transactionRef, {
                kind: 'earn',
                reason: 'ad_watch',
                coins: AD_REWARD_COINS,
                status: 'success',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return { coinsAwarded: AD_REWARD_COINS };
        });
        
        return { success: true, coinsAwarded };

    } catch (error: any) {
        console.error('Error awarding ad reward:', error);
        return { success: false, error: error.message };
    }
}

    
