
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfilePage({ params }: { params: { lng: string }}) {
  const { lng } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/${lng}/login`);
    } else {
      router.replace(`/${lng}/profile/${user.uid}`);
    }
  }, [user, authLoading, router, lng]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}
