'use client';

import React, { useState } from 'react';
import { User, MapPin, Calendar, LogOut, Star, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDateTime } from '@/lib/utils/time';
import { updateUser, getUserAppointments, cancelAppointment } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types';
import emailjs from '@emailjs/browser';
import { emailJSConfig } from '@/config/emailjs';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUser(user.id, formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // Subscribe to user appointments
  React.useEffect(() => {
    if (user) {
      import('@/lib/firebase/firestore').then(({ subscribeToUserAppointments }) => {
        const unsubscribe = subscribeToUserAppointments(user.id, (data) => {
          setAppointments(data);
          setLoadingAppointments(false);
        });
        return () => unsubscribe();
      }).catch(err => {
        console.error('Error importing firestore:', err);
        setLoadingAppointments(false);
      });
    }
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await cancelAppointment(appointmentId);

      // EMAIL NOTIFICATION
      try {
        // Find the appointment to get details (optimistic update happens after, so we might need to find it from state `appointments`)
        const appt = appointments.find(a => a.id === appointmentId);
        if (appt && emailJSConfig.templateId) {
          await emailjs.send(
            emailJSConfig.serviceId,
            emailJSConfig.templateId,
            {
              to_email: user?.email, // Notify the user themselves
              email_subject: `Appointment Cancelled 📅`,
              email_title: 'Cancellation Confirmed',
              email_body: `Your appointment at ${appt.salonName} has been cancelled as requested.`,

              details_label_1: 'Salon',
              details_value_1: appt.salonName,
              details_label_2: 'Date',
              details_value_2: appt.date,
              details_label_3: 'Reason',
              details_value_3: 'User requested cancellation',
            },
            emailJSConfig.publicKey
          );
          console.log('✅ Cancellation email sent');
        }
      } catch (e) {
        console.error('Email failed', e);
      }
      // Refresh appointments
      const updated = await getUserAppointments(user!.id);
      setAppointments(updated);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.push('/home')}>
            ← Back
          </Button>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Info */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Profile Information</h2>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <div className="flex gap-3">
                <Button onClick={handleSave} loading={saving} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name,
                      phone: user.phone,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold">
                  {formatDateTime(user.createdAt)}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Loyalty Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <text className="text-9xl font-black">★</text>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <span className="bg-white/20 p-1.5 rounded-lg"><Star size={16} className="text-yellow-300 fill-yellow-300" /></span>
              <span className="font-bold tracking-wide text-xs uppercase">MapMyTrim Rewards</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-4xl font-black">{user.loyaltyPoints || 0}</h3>
              <span className="text-lg font-medium opacity-80">Points</span>
            </div>
            <p className="text-sm opacity-80 mb-6">You're {100 - ((user.loyaltyPoints || 0) % 100)} points away from your next reward!</p>

            <div className="w-full bg-black/20 rounded-full h-2 mb-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((user.loyaltyPoints || 0) % 100)}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* My Appointments */}
        <Card>
          <h2 className="text-xl font-bold mb-4">My Appointments</h2>
          {loadingAppointments ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No appointments yet. Book your first appointment!
            </p>
          ) : (
            <div className="space-y-4">
              {/* Upcoming Appointments */}
              {appointments.filter(a => a.status === 'booked').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    📅 Upcoming
                  </h3>
                  <div className="space-y-3">
                    {appointments
                      .filter(a => a.status === 'booked')
                      .map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{appointment.serviceName}</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                📍 Salon ID: {appointment.salonId}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  📅 {appointment.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  🕐 {appointment.time}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Past Appointments */}
              {appointments.filter(a => a.status === 'completed').length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    ✅ Past Appointments
                  </h3>
                  <div className="space-y-3">
                    {appointments
                      .filter(a => a.status === 'completed')
                      .slice(0, 5)
                      .map((appointment) => (
                        <div key={appointment.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-800">{appointment.serviceName}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>📅 {appointment.date}</span>
                                <span>🕐 {appointment.time}</span>
                              </div>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Cancelled Appointments */}
              {appointments.filter(a => a.status === 'cancelled').length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    ❌ Cancelled
                  </h3>
                  <div className="space-y-3">
                    {appointments
                      .filter(a => a.status === 'cancelled')
                      .slice(0, 3)
                      .map((appointment) => (
                        <div key={appointment.id} className="border border-red-100 rounded-lg p-4 bg-red-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-800">{appointment.serviceName}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>📅 {appointment.date}</span>
                                <span>🕐 {appointment.time}</span>
                              </div>
                            </div>
                            <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">
                              Cancelled
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Remove or update Active Check-in section */}
        {/* Commenting out as check-in was removed */}
        {/*
        {user.activeCheckIn && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Active Check-in</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-700 font-semibold mb-2">
                You have an active check-in
              </p>
              <Button
                onClick={() => router.push(`/salon/${user.activeCheckIn!.shopId}`)}
                variant="primary"
              >
                View Details
              </Button>
            </div>
          </Card>
        )}
        */}


      </main>
    </div>
  );
}
