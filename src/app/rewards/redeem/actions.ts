
'use server';

import * as admin from 'firebase-admin';
import { getFirestoreAdmin } from '@/lib/firebase-admin';

interface RequestRedeemInput {
  uid: string;
  upiId: string;
  coins: number;
}

const PAYOUT_MIN_COINS = 100; // As per your doc
const COINS_PER_INR = 100; // 100 coins = 1 INR

export async function requestRedeem(input: RequestRedeemInput) {
  const { uid, upiId, coins } = input;
  const firestoreAdmin = getFirestoreAdmin();

  // Server-side validation
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
    return { success: false, error: 'Invalid UPI ID format.' };
  }
  if (coins < PAYOUT_MIN_COINS) {
    return { success: false, error: `Minimum ${PAYOUT_MIN_COINS} coins required to redeem.` };
  }

  const userRef = firestoreAdmin.doc(`users/${uid}`);
  const walletRef = firestoreAdmin.doc(`wallets/${uid}`);
  const payoutRef = firestoreAdmin.collection('payouts').doc();

  try {
    const result = await firestoreAdmin.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const walletDoc = await transaction.get(walletRef);

      if (!userDoc.exists) {
        throw new Error('User does not exist.');
      }
      if (!walletDoc.exists) {
        throw new Error('Wallet does not exist.');
      }

      if (userDoc.data()?.rewardSuspended) {
          throw new Error('Rewards are suspended for this account.');
      }

      const currentBalance = walletDoc.data()?.balance || 0;
      if (coins > currentBalance) {
        throw new Error('Insufficient coin balance.');
      }

      const amountInr = coins / COINS_PER_INR;

      // 1. Decrement balances
      transaction.update(walletRef, { balance: admin.firestore.FieldValue.increment(-coins) });
      transaction.update(userRef, { coins: admin.firestore.FieldValue.increment(-coins) });
      
      // 2. Create payout document
      transaction.set(payoutRef, {
        uid,
        upiId,
        coinsRequested: coins,
        amountInr,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Create transaction log
      const transactionRef = walletRef.collection('transactions').doc();
      transaction.set(transactionRef, {
        kind: 'redeem',
        reason: 'payout_request',
        coins: -coins,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        meta: {
            payoutId: payoutRef.id
        }
      });

      return { amountInr };
    });

    return { success: true, amountInr: result.amountInr };

  } catch (error: any) {
    console.error('Redemption failed:', error);
    return { success: false, error: error.message };
  }
}
