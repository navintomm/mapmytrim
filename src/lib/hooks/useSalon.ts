'use client';

import { useState, useEffect } from 'react';
import { subscribeSalon } from '@/lib/firebase/firestore';
import type { Salon } from '@/types/salon';

export const useSalon = (salonId: string) => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) {
      console.warn('⚠️ useSalon: No salonId provided');
      return;
    }

    console.log('🔄 useSalon: Subscribing to salon:', salonId);
    setLoading(true);
    const unsubscribe = subscribeSalon(salonId, (updatedSalon) => {
      console.log('📡 useSalon: Received salon update:', {
        salonId,
        found: !!updatedSalon,
        salonName: updatedSalon?.name
      });
      setSalon(updatedSalon);
      setLoading(false);
    });

    return () => {
      console.log('🔌 useSalon: Unsubscribing from salon:', salonId);
      unsubscribe();
    };
  }, [salonId]);

  return { salon, loading };
};