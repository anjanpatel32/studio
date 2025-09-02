
'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import * as admin from 'firebase-admin';

// This is a simplified version. In a real app, you'd get the current user's ID
// from the session. For now, we'll pass it in.
// We are also not handling the atomic update of the user's relationships collection for now.

export async function toggleLike(reelId: string, userId: string, isLiked: boolean) {
  const firestoreAdmin = getFirestoreAdmin();
  const reelRef = firestoreAdmin.collection('reels').doc(reelId);
  const likeRef = reelRef.collection('likes').doc(userId);
  const userLikedReelsRef = firestoreAdmin.collection('users').doc(userId).collection('likedReels').doc(reelId);

  try {
    await firestoreAdmin.runTransaction(async (transaction) => {
      if (isLiked) {
        // Unlike
        transaction.delete(likeRef);
        transaction.delete(userLikedReelsRef);
        transaction.update(reelRef, {
          likesCount: admin.firestore.FieldValue.increment(-1),
        });
      } else {
        // Like
        transaction.set(likeRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
        transaction.set(userLikedReelsRef, { reelId: reelId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        transaction.update(reelRef, {
          likesCount: admin.firestore.FieldValue.increment(1),
        });
      }
    });
    
    revalidatePath('/');
    revalidatePath(`/profile/${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Failed to update like status.' };
  }
}

export async function addComment(reelId: string, userId: string, commentText: string) {
  const firestoreAdmin = getFirestoreAdmin();
  if (!commentText.trim()) {
    return { success: false, error: 'Comment cannot be empty.' };
  }

  const reelRef = firestoreAdmin.collection('reels').doc(reelId);
  const commentsRef = reelRef.collection('comments');

  // --- Start of new logic for parsing mentions ---
  const taggedUsernames = commentText.match(/@(\w+)/g)?.map(u => u.substring(1)) || [];
  const taggedUids: string[] = [];

  if (taggedUsernames.length > 0) {
    // In a production app, you might want to query in batches if there are many mentions
    const usersQuery = await firestoreAdmin.collection('users').where('displayName', 'in', taggedUsernames).get();
    usersQuery.forEach(doc => {
      taggedUids.push(doc.id);
    });
  }
  // --- End of new logic for parsing mentions ---


  try {
    await firestoreAdmin.runTransaction(async (transaction) => {
        const newCommentRef = commentsRef.doc();
        transaction.set(newCommentRef, {
            uid: userId,
            text: commentText,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            taggedUids: taggedUids // Store the UIDs of tagged users
        });
        transaction.update(reelRef, {
            commentsCount: admin.firestore.FieldValue.increment(1),
        });
    });
    
    // Here you would trigger notifications for the users in taggedUids
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment.' };
  }
}


export async function addShare(reelId: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const reelRef = firestoreAdmin.collection('reels').doc(reelId);
  
    try {
      await reelRef.update({
        sharesCount: admin.firestore.FieldValue.increment(1),
      });
      revalidatePath('/');
      return { success: true };
    } catch (error) {
      console.error('Error adding share:', error);
      return { success: false, error: 'Failed to update share count.' };
    }
}

export async function getLikedReels(userId: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const likedReelsRef = firestoreAdmin.collection('users').doc(userId).collection('likedReels');
    const likedReelsSnapshot = await likedReelsRef.orderBy('createdAt', 'desc').limit(30).get();
    
    if (likedReelsSnapshot.empty) {
        return [];
    }

    const likedReelIds = likedReelsSnapshot.docs.map(doc => doc.id);

    // Firestore 'in' queries are limited to 30 items per query.
    // In a real-world scenario with many liked reels, you would need to batch this.
    const reelsQuery = await firestoreAdmin.collection('reels').where(admin.firestore.FieldPath.documentId(), 'in', likedReelIds).get();

    const likedReelsData = reelsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // The order from the 'in' query is not guaranteed, so we re-order based on the liked timestamp.
    const orderedReels = likedReelIds.map(id => likedReelsData.find(reel => reel.id === id)).filter(Boolean);

    return orderedReels;
}
