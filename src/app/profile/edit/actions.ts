'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

interface UpdateProfileInput {
  uid: string;
  displayName: string;
  bio: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const firestoreAdmin = getFirestoreAdmin();
  const { uid, displayName, bio } = input;
  const userRef = firestoreAdmin.collection('users').doc(uid);

  try {
    await userRef.update({
      displayName,
      bio,
    });

    revalidatePath('/profile');
    revalidatePath(`/profile/edit`); // Revalidate the edit page itself if needed
    return { success: true };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}
