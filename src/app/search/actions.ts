
'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';

export async function searchUsers(query: string): Promise<UserProfile[]> {
  const firestoreAdmin = getFirestoreAdmin();
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // For a robust search, you'd typically convert the query to a consistent case
    // and query against a normalized field in your database.
    // Firestore's `orderBy` with `startAt` and `endAt` provides a "starts-with" search,
    // which is case-sensitive.
    const usersSnapshot = await firestoreAdmin
      .collection('users')
      .orderBy('displayName')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .limit(10)
      .get();

    if (usersSnapshot.empty) {
      return [];
    }
    
    const users: UserProfile[] = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
    
    return users;

  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}
