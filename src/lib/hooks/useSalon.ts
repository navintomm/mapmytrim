'use client';

import { useState, useEffect } from 'react';
import { subscribeSalon } from '@/lib/firebase/firestore';
import type { Salon } from '@/types/salon';

export const useSalon = (salonId: string) => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) return;

    setLoading(true);
    const unsubscribe = subscribeSalon(salonId, (updatedSalon) => {
      setSalon(updatedSalon);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [salonId]);

  return { salon, loading };
};