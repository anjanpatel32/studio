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
