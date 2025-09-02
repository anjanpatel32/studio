'use server';

import * as admin from 'firebase-admin';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

// Gets or creates a one-on-one chat between two users
export async function getOrCreateChat(userId1: string, userId2: string): Promise<{ chatId: string; success: boolean; error?: string }> {
  const firestoreAdmin = getFirestoreAdmin();
  if (userId1 === userId2) {
    return { success: false, error: 'Cannot create chat with yourself.', chatId: '' };
  }

  const members = [userId1, userId2].sort(); // Sort to ensure consistent chat ID
  const chatId = members.join('_');
  const chatRef = firestoreAdmin.collection('chats').doc(chatId);

  try {
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      await chatRef.set({
        members,
        isGroup: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessage: null,
      });
    }
    
    return { success: true, chatId };

  } catch (error: any) {
    console.error('Error getting or creating chat:', error);
    return { success: false, error: error.message, chatId: '' };
  }
}


export async function sendMessage(chatId: string, senderId: string, text: string) {
    const firestoreAdmin = getFirestoreAdmin();
    if (!text.trim()) {
        return { success: false, error: 'Message cannot be empty.' };
    }

    const chatRef = firestoreAdmin.collection('chats').doc(chatId);
    const messageRef = chatRef.collection('messages').doc();
    const now = admin.firestore.FieldValue.serverTimestamp();

    try {
        await firestoreAdmin.runTransaction(async (transaction) => {
            const chatDoc = await transaction.get(chatRef);
            if (!chatDoc.exists) {
                throw new Error("Chat does not exist.");
            }
            if (!chatDoc.data()?.members.includes(senderId)) {
                throw new Error("Sender is not a member of this chat.");
            }
            
            transaction.set(messageRef, {
                senderId,
                text,
                createdAt: now,
                type: 'text'
            });

            transaction.update(chatRef, {
                lastMessage: {
                    text,
                    senderId,
                    createdAt: now
                }
            });
        });

        revalidatePath(`/messages/${chatId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
    }
}
