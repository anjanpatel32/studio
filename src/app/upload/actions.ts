
'use server';

import { moderateContent, type ModerateContentInput } from '@/ai/flows/moderate-content';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import * as admin from 'firebase-admin';

const extractHashtags = (text: string): string[] => {
    if (!text) return [];
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (!matches) return [];
    // Return unique hashtags without the '#' symbol
    return [...new Set(matches.map(tag => tag.substring(1)))];
}

interface HandleReelUploadInput {
    ownerUid: string;
    description: string;
    reelDataUri: string;
}

interface HandleReelUploadResult {
  success: boolean;
  error?: string;
}

// Store for chunks in memory. In a scalable production app, use a distributed cache like Redis.
const chunkStore = new Map<string, Buffer[]>();

export async function uploadChunk(formData: FormData) {
    const chunk = formData.get('chunk') as File;
    const chunkIndex = Number(formData.get('chunkIndex'));
    const totalChunks = Number(formData.get('totalChunks'));
    const fileId = formData.get('fileId') as string;
    const description = formData.get('description') as string;
    const ownerUid = formData.get('ownerUid') as string;

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !fileId || !description || !ownerUid) {
        return { success: false, error: 'Invalid upload data' };
    }

    try {
        const buffer = Buffer.from(await chunk.arrayBuffer());
        if (!chunkStore.has(fileId)) {
            chunkStore.set(fileId, new Array(totalChunks));
        }
        
        const chunks = chunkStore.get(fileId)!;
        chunks[chunkIndex] = buffer;

        // Check if all chunks are received
        const isComplete = chunks.every(c => c !== undefined);

        if (isComplete) {
            const fullBuffer = Buffer.concat(chunks);
            const reelDataUri = `data:${chunk.type};base64,${fullBuffer.toString('base64')}`;

            // Clean up chunks from memory
            chunkStore.delete(fileId);

            // Directly call the processing function now that we have the full file in memory
            return await handleReelUpload({
                ownerUid,
                description,
                reelDataUri,
            });
        }
        
        return { success: true, isComplete: false };
    } catch (error: any) {
        console.error('Error handling chunk upload:', error);
        chunkStore.delete(fileId); // Clean up on error
        return { success: false, error: error.message || 'Failed to process chunk' };
    }
}


export async function handleReelUpload(input: HandleReelUploadInput): Promise<HandleReelUploadResult> {
  const firestoreAdmin = getFirestoreAdmin();
  try {
    // 1. Moderate content
    const moderationResult = await moderateContent({
        reelDataUri: input.reelDataUri,
        description: input.description
    });

    if (!moderationResult.isCompliant) {
      return {
        success: false,
        error: `Content moderation failed: ${moderationResult.reason}`,
      };
    }
    
    // 2. If compliant, save to database.
    // In a real app, you'd upload the video to Firebase Storage and get a URL.
    // For this prototype, we'll use a placeholder.
    
    const hashtags = extractHashtags(input.description);
    const newReelRef = firestoreAdmin.collection('reels').doc();
    
    await newReelRef.set({
        reelId: newReelRef.id,
        ownerUid: input.ownerUid,
        videoUrl: 'https://placehold.co/400x700.png', // Placeholder URL
        thumbnailUrl: 'https://placehold.co/400x700.png', // Placeholder URL
        caption: input.description,
        hashtags,
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        sharesCount: 0,
        region: 'IN',
        language: 'en',
        visibility: 'public',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Revalidate paths to show the new reel
    revalidatePath('/');
    revalidatePath('/profile');
    revalidatePath('/explore');
    hashtags.forEach(tag => revalidatePath(`/explore/tags/${tag}`));

    return { success: true };

  } catch (error) {
    console.error('Error during reel upload and moderation:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}


interface HandlePostUploadInput {
    ownerUid: string;
    caption: string;
    imageDataUris: string[];
}

interface HandlePostUploadResult {
    success: boolean;
    error?: string;
}

export async function handlePostUpload(input: HandlePostUploadInput): Promise<HandlePostUploadResult> {
    const firestoreAdmin = getFirestoreAdmin();
    try {
        // In a real app, you'd moderate the caption and images.
        // For this prototype, we'll skip moderation for photo posts.

        const newPostRef = firestoreAdmin.collection('posts').doc();
        const hashtags = extractHashtags(input.caption);
        
        // In a real app, you'd upload images to Storage and get URLs.
        // For this prototype, we'll use placeholders.
        const imageUrls = input.imageDataUris.map((_, index) => `https://placehold.co/600x600.png?text=Post+Image+${index+1}`);

        await newPostRef.set({
            postId: newPostRef.id,
            ownerUid: input.ownerUid,
            imageUrls,
            caption: input.caption,
            hashtags,
            likesCount: 0,
            commentsCount: 0,
            visibility: 'public',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        revalidatePath('/profile');
        revalidatePath('/');
        hashtags.forEach(tag => revalidatePath(`/explore/tags/${tag}`));
        
        return { success: true };

    } catch (error) {
        console.error('Error during post upload:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

interface HandleStoryUploadInput {
    ownerUid: string;
    imageDataUri: string;
}

interface HandleStoryUploadResult {
    success: boolean;
    error?: string;
}

export async function handleStoryUpload(input: HandleStoryUploadInput): Promise<HandleStoryUploadResult> {
    const firestoreAdmin = getFirestoreAdmin();
    try {
        const newStoryRef = firestoreAdmin.collection('stories').doc();
        
        // In a real app, you'd upload the image to Storage.
        const imageUrl = 'https://placehold.co/1080x1920.png'; // Placeholder
        const now = admin.firestore.Timestamp.now();
        const expiresAt = new admin.firestore.Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds);

        await newStoryRef.set({
            storyId: newStoryRef.id,
            ownerUid: input.ownerUid,
            mediaUrl: imageUrl,
            mediaType: 'image',
            createdAt: now,
            expiresAt: expiresAt,
            // In a real app, you'd handle privacy and close friends
            privacy: 'public', 
            closeFriends: [],
        });
        
        revalidatePath('/');
        
        return { success: true };

    } catch (error) {
        console.error('Error during story upload:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}


interface GoLiveResult {
  success: boolean;
  streamId?: string;
  error?: string;
}

export async function goLive(ownerUid: string): Promise<GoLiveResult> {
  const firestoreAdmin = getFirestoreAdmin();
  const liveStreamRef = firestoreAdmin.collection('live-streams').doc();

  try {
    await liveStreamRef.set({
      ownerUid: ownerUid,
      status: 'live',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/');
    return { success: true, streamId: liveStreamRef.id };
  } catch (error) {
    console.error('Failed to go live:', error);
    return { success: false, error: 'Could not start live stream.' };
  }
}

export async function endLive(streamId: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const liveStreamRef = firestoreAdmin.collection('live-streams').doc(streamId);
    try {
        await liveStreamRef.update({
            status: 'ended',
            endedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to end live stream:', error);
        return { success: false, error: 'Could not end live stream.' };
    }
}

export async function postChatMessage(streamId: string, userId: string, message: string) {
    const firestoreAdmin = getFirestoreAdmin();
    const chatRef = firestoreAdmin.collection('live-streams').doc(streamId).collection('chat').doc();
    try {
        await chatRef.set({
            uid: userId,
            text: message,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to post chat message:', error);
        return { success: false, error: 'Could not post message.' };
    }
}
