'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { revalidatePath } from 'next/cache';

const PAYOUT_MIN_COINS = 100;
const COINS_PER_INR = 100;

interface RedeemInput {
  uid: string;
  upiId: string;
  coins: number;
}

interface RedeemResult {
  success: boolean;
  error?: string;
  amountInr?: number;
}

export async function requestRedeem(input: RedeemInput): Promise<RedeemResult> {
  const { uid, upiId, coins } = input;
  const firestoreAdmin = getFirestoreAdmin();

  if (coins < PAYOUT_MIN_COINS) {
    return { success: false, error: `A minimum of ${PAYOUT_MIN_COINS} coins is required to redeem.` };
  }

  const userRef = firestoreAdmin.doc(`users/${uid}`);
  const walletRef = firestoreAdmin.doc(`wallets/${uid}`);
  const payoutRef = firestoreAdmin.collection('payouts').doc();

  try {
    const amountInr = coins / COINS_PER_INR;

    await firestoreAdmin.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found.');
      }
      const userCoins = userDoc.data()?.coins || 0;
      if (userCoins < coins) {
        throw new Error('Insufficient coin balance.');
      }

      // 1. Create the payout request document
      transaction.set(payoutRef, {
        uid,
        upiId,
        coinsRequested: coins,
        amountInr,
        status: 'pending',
        requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Decrement the user's coins
      transaction.update(userRef, { coins: admin.firestore.FieldValue.increment(-coins) });
      transaction.update(walletRef, { balance: admin.firestore.FieldValue.increment(-coins) });

      // 3. Log the redemption transaction
      const txRef = walletRef.collection('transactions').doc();
      transaction.set(txRef, {
        kind: 'redeem',
        reason: 'payout_request',
        coins: -coins, // Log as a negative value for redemption
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        meta: {
          payoutId: payoutRef.id,
        },
      });
    });

    revalidatePath('/rewards');
    return { success: true, amountInr };
  } catch (error: any) {
    console.error('Error requesting redemption:', error);
    return { success: false, error: error.message };
  }
}
