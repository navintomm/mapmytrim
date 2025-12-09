'use client';

import { useState, useEffect } from 'react';
import { getSalons } from '@/lib/firebase/firestore';
import { calculateDistance } from '@/lib/utils/distance';
import type { Salon } from '@/types/salon';

export const useSalons = (userLocation?: { lat: number; lng: number }) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        setLoading(true);
        const fetchedSalons = await getSalons();

        // Calculate distances if user location is available
        const salonsWithDistance = fetchedSalons.map((salon) => {
          if (userLocation) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              salon.geoLocation.latitude,
              salon.geoLocation.longitude
            );
            return { ...salon, distance };
          }
          return salon;
        });

        // Sort by distance if available
        if (userLocation) {
          salonsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setSalons(salonsWithDistance);
      } catch (err) {
        setError('Failed to fetch salons');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, [userLocation]);

  return { salons, loading, error };
};
