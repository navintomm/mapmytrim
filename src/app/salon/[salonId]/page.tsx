'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSalon } from '@/lib/hooks/useSalon';
import { useQueue } from '@/lib/hooks/useQueue';
import { SalonDetails } from '@/components/salon/SalonDetails';
import { QueueDisplay } from '@/components/salon/QueueDisplay';
import { RatingForm } from '@/components/salon/RatingForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookingModal } from '@/components/salon/BookingModal';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { createCheckIn, checkoutCustomer } from '@/lib/firebase/functions';
import { extractErrorCode, getErrorMessage } from '@/lib/utils/errors';

export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = decodeURIComponent(params.salonId as string);

  console.log('📍 Salon Details Page loaded:', {
    rawParam: params.salonId,
    decodedId: salonId,
    allParams: params
  });

  const { user } = useAuth();
  const { salon, loading: salonLoading } = useSalon(salonId);
  const { queue, loading: queueLoading } = useQueue(salonId);
  const [stylists, setStylists] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (salonId) {
      console.log('Fetching stylists for salon:', salonId);
      import('@/lib/firebase/firestore').then(({ getStylists }) => {
        getStylists(salonId).then((data) => {
          console.log('Fetched stylists from DB:', data);
          if (data && data.length > 0) {
            setStylists(data);
          } else {
            console.log('Using mock stylists fallback');
            setStylists([
              { id: '1', name: 'Sarah Jenkins', isOnDuty: true },
              { id: '2', name: 'Mike Ross', isOnDuty: true },
              { id: '3', name: 'Jessica Pearson', isOnDuty: false }
            ]);
          }
        }).catch(err => console.error('Error fetching stylists:', err));
      }).catch(err => console.error('Error importing firestore:', err));
    }
  }, [salonId]);

  // Fetch services
  React.useEffect(() => {
    if (salonId) {
      import('@/lib/firebase/firestore').then(({ getServices }) => {
        getServices(salonId).then((data) => {
          setServices(data || []);
        }).catch(err => console.error('Error fetching services:', err));
      });
    }
  }, [salonId]);

  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [services, setServices] = React.useState<any[]>([]);

  const userInQueue = user?.activeCheckIn?.shopId === salonId;

  const handleCheckIn = async () => {
    setChecking(true);
    setError('');

    try {
      await createCheckIn({ salonId });
    } catch (err: any) {
      const errorCode = extractErrorCode(err);
      const errorMessage = errorCode
        ? getErrorMessage(errorCode)
        : err.message || 'Failed to check in';
      setError(errorMessage);
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.activeCheckIn?.checkInId) return;

    setChecking(true);
    setError('');

    try {
      await checkoutCustomer({
        salonId,
        checkInId: user.activeCheckIn.checkInId,
      });
      setShowRating(true);
    } catch (err: any) {
      setError(err.message || 'Failed to check out');
    } finally {
      setChecking(false);
    }
  };

  if (salonLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Debugging: Log if salon is null after loading
  if (!salon) {
    console.error('Salon not found for ID:', salonId);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Salon not found (ID: {salonId})</p>
          <Button onClick={() => router.push('/home')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.push('/home')}>
            ← Back
          </Button>
          <h1 className="text-xl font-bold">Salon Details</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <SalonDetails salon={salon} stylists={stylists} />

        {/* Book Appointment Button */}
        {salon.acceptsAppointments && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Button
              onClick={() => setShowBookingModal(true)}
              className="w-full"
              size="lg"
            >
              📅 Book Appointment
            </Button>
          </div>
        )}

        {/* Feedback Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Button
            onClick={() => setShowFeedbackModal(true)}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            💬 Send Feedback
          </Button>
        </div>

        {queueLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <QueueDisplay queue={queue} currentUserId={user?.id} />
        )}
      </main>

      {/* Rating Modal */}
      <Modal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        title="Rate Your Experience"
      >
        <RatingForm
          salonId={salonId}
          onSuccess={() => {
            setShowRating(false);
            router.push('/home');
          }}
          onCancel={() => {
            setShowRating(false);
            router.push('/home');
          }}
        />
      </Modal>

      {/* Booking Modal */}
      {user && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          salonId={salonId}
          salonName={salon.name}
          services={services}
          userId={user.id}
          userName={user.name || user.email || 'Guest'}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        salonId={salonId}
        salonName={salon.name}
      />
    </div>
  );
}