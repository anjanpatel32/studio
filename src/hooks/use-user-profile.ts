
'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function useUserProfile(uid: string | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setProfile(null);
            return;
        }

        setLoading(true);
        const userDocRef = doc(firestore, 'users', uid);
        
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setProfile(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    return { profile, loading };
}
