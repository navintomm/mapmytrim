'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSalon } from '@/lib/hooks/useSalon';
import { useQueue } from '@/lib/hooks/useQueue';
import { DutyToggle } from '@/components/stylist/DutyToggle';
import { QueueManager } from '@/components/stylist/QueueManager';
import { CustomerList } from '@/components/stylist/CustomerList';
import { AnalyticsChart } from '@/components/stylist/AnalyticsChart';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { generateCrowdFlowData } from '@/lib/utils/analytics';

// NOTE: In production, you'd fetch the stylist's salon ID from their profile
const DEMO_SALON_ID = 'demo-salon-1';
const DEMO_STYLIST_ID = 'demo-stylist-1';

export default function StylistDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { salon, loading: salonLoading } = useSalon(DEMO_SALON_ID);
  const { queue, loading: queueLoading } = useQueue(DEMO_SALON_ID);
  const [analyticsData] = useState(generateCrowdFlowData());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || salonLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Salon not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              ✂️ Stylist Dashboard
            </h1>
            <p className="text-sm text-gray-600">{salon.name}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duty Toggle */}
          <DutyToggle
            salonId={DEMO_SALON_ID}
            stylistId={DEMO_STYLIST_ID}
            initialStatus={false}
          />

          {/* Queue Manager */}
          <QueueManager salonId={DEMO_SALON_ID} currentQueue={salon.queueCount} />

          {/* Customer List */}
          <div className="lg:col-span-2">
            {queueLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <CustomerList queue={queue} />
            )}
          </div>

          {/* Analytics */}
          <div className="lg:col-span-2">
            <AnalyticsChart data={analyticsData} />
          </div>
        </div>
      </main>
    </div>
  );
}