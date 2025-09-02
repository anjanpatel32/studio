
import { z } from 'zod';

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    phone: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    reelsCount: number;
    createdAt: any; // Firestore Timestamp
    coins?: number;
    isPrivate: boolean;
    blockedUsers: string[];
    settings: {
        theme: 'light' | 'dark' | 'system';
        language: 'en' | 'es' | 'hi';
        notifications: NotificationSettings;
        twoFactorEnabled?: boolean;
    };
    rewardSuspended?: boolean;
}

export interface NotificationSettings {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    payouts: boolean;
}

export interface Reel {
    id: string;
    ownerUid: string;
    videoUrl: string;
    thumbnailUrl: string;
    caption: string;
    hashtags: string[];
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    sharesCount: number;
    region: string;
    language: string;
    visibility: 'public' | 'private';
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
    user: {
        id: string;
        name: string;
        avatarUrl: string;
    };
}

export interface Comment {
    id: string;
    uid: string;
    text: string;
    createdAt: any; // Firestore Timestamp
    user: UserProfile;
    taggedUids?: string[];
}

export interface Story {
    id: string;
    ownerUid: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: any; // Firestore Timestamp
    expiresAt: any; // Firestore Timestamp
    user: UserProfile;
}

export interface Transaction {
    id: string;
    kind: 'earn' | 'redeem';
    reason: string;
    coins: number;
    status: 'success' | 'pending' | 'failed';
    createdAt: any; // Firestore Timestamp
    meta?: {
        payoutId?: string;
        note?: string;
    }
}


export interface LiveStream {
    id: string;
    ownerUid: string;
    status: 'live' | 'ended';
    startedAt: any; // Firestore Timestamp
    endedAt?: any; // Firestore Timestamp
    user: {
        name: string;
        avatarUrl: string;
    }
}

export interface ChatMessage {
    id: string;
    uid: string;
    text: string;
    createdAt: any; // Firestore Timestamp
    user: {
        id: string;
        name: string;
        avatarUrl: string;
    }
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: any;
    type: 'text' | 'image';
}

export interface Chat {
    id: string;
    members: string[];
    isGroup: boolean;
    lastMessage: {
        text: string;
        senderId: string;
        createdAt: any;
    } | null;
}

export interface TaggedContent {
    id: string;
    type: 'reel' | 'post';
    thumbnailUrl: string;
    likesCount: number;
    commentsCount: number;
}


export interface Payout {
    id: string;
    uid: string;
    upiId: string;
    coinsRequested: number;
    amountInr: number;
    status: 'pending' | 'completed' | 'failed';
    requestedAt: any; // Firestore Timestamp
    processedAt?: any; // Firestore Timestamp
    rejectionReason?: string;
    user?: UserProfile; // populated on the client
}


// AI Flow Schemas

export const DebugCodeInputSchema = z.object({
  code: z.string().describe('The code that has an error.'),
  language: z.string().describe('The programming language of the code.'),
  error: z.string().describe('The error message produced by the code.'),
});
export type DebugCodeInput = z.infer<typeof DebugCodeInputSchema>;

export const DebugCodeOutputSchema = z.object({
  explanation: z.string().describe('An explanation of what the error is and why it occurred.'),
  fixedCode: z.string().describe('The corrected version of the code.'),
});
export type DebugCodeOutput = z.infer<typeof DebugCodeOutputSchema>;


export const ExecuteCodeInputSchema = z.object({
  code: z.string().describe('The code to execute.'),
  language: z.string().describe('The programming language of the code.'),
});
export type ExecuteCodeInput = z.infer<typeof ExecuteCodeInputSchema>;

export const ExecuteCodeOutputSchema = z.object({
  output: z.string().describe('The output of the code execution.'),
});
export type ExecuteCodeOutput = z.infer<typeof ExecuteCodeOutputSchema>;


export const ModerateContentInputSchema = z.object({
  reelDataUri: z
    .string()
    .describe(
      "The video reel, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description or caption of the reel.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

export const ModerateContentOutputSchema = z.object({
    isCompliant: z.boolean().describe('Whether or not the content is compliant with the guidelines.'),
    reason: z.string().describe('The reason for non-compliance. Provide a detailed explanation.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;
