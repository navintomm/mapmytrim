'use client';

import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      });
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Location request timed out',
        loading: false,
      });
    }, 5000); // 5 second timeout

    const success = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const error = () => {
      clearTimeout(timeoutId);
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Unable to retrieve your location',
        loading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      timeout: 5000, // 5 second timeout
      maximumAge: 300000, // Accept cached position up to 5 minutes old
      enableHighAccuracy: false, // Faster, less accurate
    });

    return () => clearTimeout(timeoutId);
  }, []);

  return location;
};
