'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { AnimatedBackground } from './animated-background';
import { Loader2 } from 'lucide-react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          router.push('/login');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [auth, router]);

    if (loading) {
      return (
          <>
            <AnimatedBackground />
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-2 text-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span>Loading...</span>
                </div>
            </div>
        </>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
