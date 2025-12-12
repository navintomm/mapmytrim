'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Optimization: Check local storage synchronously to avoid waiting for Firebase init
    const cached = localStorage.getItem('mapmytrim_user');
    console.log('RootPage checking cache:', cached); // Debug & Force HMR

    if (cached) {
      try {
        const user = JSON.parse(cached);
        if (user.role === 'owner') {
          router.push('/salon/dashboard');
        } else {
          router.push('/home');
        }
      } catch (e) {
        // Corrupt cache
        localStorage.removeItem('mapmytrim_user');
        router.push('/login');
      }
    } else {
      // No cache = Guest (99% likely) -> Instant redirect
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}