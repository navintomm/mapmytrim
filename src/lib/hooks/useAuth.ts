'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { getUser } from '@/lib/firebase/firestore';
import type { User } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userData = await getUser(fbUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut();
    setUser(null);
    setFirebaseUser(null);
  };

  return { user, firebaseUser, loading, signOut };
};
