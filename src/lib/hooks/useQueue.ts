'use client';

import { useState, useEffect } from 'react';
import { subscribeQueue } from '@/lib/firebase/firestore';
import type { QueueItem } from '@/types/queue';

export const useQueue = (salonId: string) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) return;

    setLoading(true);
    const unsubscribe = subscribeQueue(salonId, (updatedQueue) => {
      setQueue(updatedQueue);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [salonId]);

  return { queue, loading };
};
