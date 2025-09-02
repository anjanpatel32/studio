
'use server';

import * as admin from 'firebase-admin';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(currentUserId: string, targetUserId: string, isFollowing: boolean) {
  const firestoreAdmin = getFirestoreAdmin();
  if (currentUserId === targetUserId) {
      return { success: false, error: "You cannot follow yourself." };
  }

  const currentUserFollowingRef = firestoreAdmin.doc(`users/${currentUserId}/following/${targetUserId}`);
  const targetUserFollowersRef = firestoreAdmin.doc(`users/${targetUserId}/followers/${currentUserId}`);

  const currentUserRef = firestoreAdmin.doc(`users/${currentUserId}`);
  const targetUserRef = firestoreAdmin.doc(`users/${targetUserId}`);

  try {
    await firestoreAdmin.runTransaction(async (transaction) => {
      if (isFollowing) {
        // Unfollow
        transaction.delete(currentUserFollowingRef);
        transaction.delete(targetUserFollowersRef);
        transaction.update(currentUserRef, { followingCount: admin.firestore.FieldValue.increment(-1) });
        transaction.update(targetUserRef, { followersCount: admin.firestore.FieldValue.increment(-1) });
      } else {
        // Follow
        transaction.set(currentUserFollowingRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
        transaction.set(targetUserFollowersRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
        transaction.update(currentUserRef, { followingCount: admin.firestore.FieldValue.increment(1) });
        transaction.update(targetUserRef, { followersCount: admin.firestore.FieldValue.increment(1) });
      }
    });

    revalidatePath('/');
    revalidatePath('/profile');
    revalidatePath(`/profile/${targetUserId}`);
    return { success: true };

  } catch (error: any) {
    console.error('Error toggling follow:', error);
    return { success: false, error: 'Failed to update follow status.' };
  }
}
