'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { subscribeUser } from '@/lib/firebase/firestore';
import type { User } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage for cached user for instant load
    const cachedUser = localStorage.getItem('mapmytrim_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false);
    }

    let unsubscribeUser: () => void;

    const unsubscribeAuth = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Subscribe to user document changes
        unsubscribeUser = subscribeUser(fbUser.uid, (userData) => {
          if (userData) {
            setUser(userData);
            localStorage.setItem('mapmytrim_user', JSON.stringify(userData));
          } else {
            // User authenticated but no profile doc? (Shouldn't happen with updated race fix but safety)
            localStorage.removeItem('mapmytrim_user');
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        localStorage.removeItem('mapmytrim_user');
        setLoading(false);
        if (unsubscribeUser) unsubscribeUser();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut();
    setUser(null);
    localStorage.removeItem('mapmytrim_user');
    setFirebaseUser(null);
  };

  return { user, firebaseUser, loading, signOut };
};
