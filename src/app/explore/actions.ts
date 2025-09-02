
'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';

// This is a simplified version. In a real app, you'd get the current user's ID
// from the session. For now, we'll pass it in.

export interface Reel {
    id: string;
    ownerUid: string;
    thumbnailUrl: string;
    // other reel fields
}

export interface User {
    name: string;
    avatarUrl: string;
}

export interface ReelWithUser extends Reel {
    user: User;
}

export async function getExploreReels(): Promise<ReelWithUser[]> {
    const firestoreAdmin = getFirestoreAdmin();
    try {
        // Updated query to sort by engagement (likesCount) instead of just recency.
        const reelsSnapshot = await firestoreAdmin.collection('reels')
            .where('visibility', '==', 'public')
            .orderBy('likesCount', 'desc')
            .limit(20)
            .get();

        if (reelsSnapshot.empty) {
            return [];
        }
        
        const reels: Reel[] = reelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reel));
        
        const userIds = [...new Set(reels.map(reel => reel.ownerUid))];
        
        const userDocs = await Promise.all(
            userIds.map(uid => firestoreAdmin.collection('users').doc(uid).get())
        );

        const usersMap = new Map<string, User>();
        userDocs.forEach(doc => {
            if (doc.exists) {
                const data = doc.data();
                usersMap.set(doc.id, { 
                    name: data?.displayName || 'Unknown User', 
                    avatarUrl: data?.photoURL || 'https://placehold.co/40x40.png'
                });
            }
        });

        const reelsWithUsers: ReelWithUser[] = reels.map(reel => ({
            ...reel,
            user: usersMap.get(reel.ownerUid) || { name: 'Unknown User', avatarUrl: 'https://placehold.co/40x40.png' }
        }));
        
        return reelsWithUsers;

    } catch (error) {
        console.error('Error fetching explore reels:', error);
        return [];
    }
}
