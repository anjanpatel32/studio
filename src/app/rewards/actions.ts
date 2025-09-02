'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const AD_REWARD_COINS = 10;
const MAX_AD_WATCHES_PER_DAY = 100;

/**
 * Awards coins to a user for watching a simulated ad.
 * Includes logic to prevent abuse by checking daily limits.
 * @param uid The user ID to award the coins to.
 * @returns An object indicating success, error, or coins awarded.
 */
export async function awardAdReward(uid: string) {
  const firestoreAdmin = getFirestoreAdmin();
  const walletRef = firestoreAdmin.doc(`wallets/${uid}`);
  const userRef = firestoreAdmin.doc(`users/${uid}`);

  try {
    const result = await firestoreAdmin.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) {
        throw new Error('Wallet not found for this user.');
      }
      
      const walletData = walletDoc.data()!;
      const today = new Date().toISOString().slice(0, 10);

      // Initialize daily stats if they don't exist or if the date has changed
      let dailyStats = walletData.dailyStats;
      if (!dailyStats || dailyStats.date !== today) {
        dailyStats = { date: today, watchedCount: 0, uploadedCount: 0, sharedCount: 0 };
      }

      if (dailyStats.watchedCount >= MAX_AD_WATCHES_PER_DAY) {
        return { success: false, error: 'Daily limit for watching ads reached.' };
      }

      // Increment counts and balances
      const newWatchedCount = dailyStats.watchedCount + 1;
      transaction.update(walletRef, {
        balance: admin.firestore.FieldValue.increment(AD_REWARD_COINS),
        'dailyStats.watchedCount': newWatchedCount,
        'dailyStats.date': today,
      });
      transaction.update(userRef, { coins: admin.firestore.FieldValue.increment(AD_REWARD_COINS) });
      
      // Create a transaction log
      const transactionRef = walletRef.collection('transactions').doc();
      transaction.set(transactionRef, {
        kind: 'earn',
        reason: 'ad_watch',
        coins: AD_REWARD_COINS,
        status: 'success',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, coinsAwarded: AD_REWARD_COINS };
    });

    return result;

  } catch (error: any) {
    console.error('Error awarding ad reward:', error);
    return { success: false, error: error.message };
  }
}
