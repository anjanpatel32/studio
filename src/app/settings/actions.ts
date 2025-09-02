
'use server';

import { auth } from '@/lib/firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import type { NotificationSettings } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordInput = z.infer<typeof formSchema>;

export async function changePassword(input: ChangePasswordInput) {
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }
  
  if (!user.email) {
    return { success: false, error: 'Cannot change password for accounts without an email.' };
  }

  try {
    // Re-authenticate the user to verify their identity
    const credential = EmailAuthProvider.credential(user.email, input.currentPassword);
    await reauthenticateWithCredential(user, credential);

    // If re-authentication is successful, update the password
    await updatePassword(user, input.newPassword);
    
    return { success: true };
    
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred.';
    switch (error.code) {
        case 'auth/wrong-password':
            errorMessage = 'The current password you entered is incorrect.';
            break;
        case 'auth/weak-password':
            errorMessage = 'The new password is too weak. Please choose a stronger one.';
            break;
        case 'auth/requires-recent-login':
            errorMessage = 'This action is sensitive and requires a recent login. Please sign out and sign back in to change your password.';
            break;
        default:
            errorMessage = error.message;
            break;
    }
    console.error('Password change failed:', error);
    return { success: false, error: errorMessage };
  }
}


export async function updateNotificationSettings(uid: string, settings: Partial<NotificationSettings>) {
    const firestoreAdmin = getFirestoreAdmin();
    const userRef = firestoreAdmin.collection('users').doc(uid);
    const settingsToUpdate: { [key: string]: any } = {};

    for (const [key, value] of Object.entries(settings)) {
        settingsToUpdate[`settings.notifications.${key}`] = value;
    }

    try {
        await userRef.update(settingsToUpdate);
        return { success: true };
    } catch (error) {
        console.error('Error updating notification settings:', error);
        return { success: false, error: 'Failed to update settings.' };
    }
}


export async function updateUserSetting(uid: string, setting: { theme?: 'light' | 'dark' | 'system', language?: 'en' | 'es' | 'hi' }) {
    const firestoreAdmin = getFirestoreAdmin();
    const userRef = firestoreAdmin.collection('users').doc(uid);
     const settingsToUpdate: { [key: string]: any } = {};

    if (setting.theme) {
        settingsToUpdate['settings.theme'] = setting.theme;
    }
     if (setting.language) {
        settingsToUpdate['settings.language'] = setting.language;
    }

    if (Object.keys(settingsToUpdate).length === 0) {
        return { success: true };
    }

    try {
        await userRef.update(settingsToUpdate);
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating user setting:', error);
        return { success: false, error: 'Failed to update setting.' };
    }
}
