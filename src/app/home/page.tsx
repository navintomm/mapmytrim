'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSalons } from '@/lib/hooks/useSalons';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { SalonMap } from '@/components/maps/SalonMap';
import { SalonCard } from '@/components/salon/SalonCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Salon } from '@/types/salon';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const userLocation =
    latitude && longitude ? { lat: latitude, lng: longitude } : null;

  const { salons, loading: salonsLoading } = useSalons(
    userLocation || undefined
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSalonClick = (salon: Salon) => {
    router.push(`/salon/${salon.id}`);
  };

  if (authLoading || locationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                ✂️
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MapMyTrim
                </h1>
                <p className="text-sm text-gray-600">
                  Hello, <span className="font-semibold text-purple-600">{user?.name || 'User'}</span> 👋
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push('/profile')}
                className="hover:scale-105 transition-transform"
              >
                👤 Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="hover:scale-105 transition-transform"
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
              }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {salonsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 font-medium">Finding salons near you...</p>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <SalonMap
            salons={salons}
            userLocation={userLocation}
            onSalonClick={handleSalonClick}
          />
        ) : (
          <div className="h-full overflow-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Nearby Salons
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <p className="text-gray-600">
                    <span className="font-bold text-purple-600">{salons.length}</span> salon{salons.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              
              {salons.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl text-gray-600 font-medium">No salons found nearby</p>
                  <p className="text-gray-500 mt-2">Try adjusting your location or check back later</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {salons.map((salon) => (
                    <SalonCard
                      key={salon.id}
                      salon={salon}
                      onClick={() => handleSalonClick(salon)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}