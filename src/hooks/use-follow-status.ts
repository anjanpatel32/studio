
'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function useFollowStatus(currentUserId: string | undefined, targetUserId: string | undefined) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
            setLoading(false);
            setIsFollowing(false);
            return;
        }

        setLoading(true);
        // Path to the document that signifies the current user is following the target user.
        const followDocRef = doc(firestore, `users/${currentUserId}/following/${targetUserId}`);

        const unsubscribe = onSnapshot(followDocRef, (doc) => {
            setIsFollowing(doc.exists());
            setLoading(false);
        }, (error) => {
            console.error("Error checking follow status:", error);
            setIsFollowing(false);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [currentUserId, targetUserId]);

    return { isFollowing, loading };
}
