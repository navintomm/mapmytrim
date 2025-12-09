'use client';

import React, { useState } from 'react';
import { useSalon } from '@/lib/hooks/useSalon';
import { QueueManager } from '@/components/stylist/QueueManager';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// NOTE: In production, device would be registered to a specific salon
const DEMO_SALON_ID = 'demo-salon-1';

export default function DevicePage() {
  const { salon, loading } = useSalon(DEMO_SALON_ID);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-600">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-600">
        <div className="text-center text-white">
          <p className="text-2xl font-bold mb-4">Device Not Configured</p>
          <p>Please contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Salon Info */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {salon.name}
          </h1>
          <p className="text-xl text-gray-600">Queue Management Device</p>
        </div>

        {/* Current Queue Display */}
        <div className="bg-white rounded-lg shadow-xl p-12 mb-8">
          <p className="text-center text-gray-600 text-2xl mb-4">
            Current Queue
          </p>
          <p className="text-center text-blue-600 text-9xl font-bold">
            {salon.queueCount}
          </p>
          <p className="text-center text-gray-600 text-xl mt-4">
            customers waiting
          </p>
        </div>

        {/* Queue Controls */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <QueueManager salonId={DEMO_SALON_ID} currentQueue={salon.queueCount} />
        </div>
      </div>
    </div>
  );
}