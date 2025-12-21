'use client';

import React, { useState } from 'react';
import { User, MapPin, Calendar, LogOut, Star, Award, Clock, Scissors } from 'lucide-react';
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

  // Group appointments
  const groupedAppointments = React.useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    appointments.forEach(appt => {
      // Create a unique key for the booking event
      const key = `${appt.salonId}_${appt.date}_${appt.time}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(appt);
    });

    // Convert to array and sort by date/time descending (newest first)
    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(`${a[0].date}T${a[0].time}`);
      const dateB = new Date(`${b[0].date}T${b[0].time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [appointments]);

  const handleCancelGroup = async (group: Appointment[]) => {
    if (!group.length) return;
    const first = group[0];

    if (!confirm(`Are you sure you want to cancel your appointment at ${first.salonName || 'Unknown Salon'}?`)) return;

    try {
      // Cancel all in parallel
      await Promise.all(group.map(a => cancelAppointment(a.id)));

      // Send ONE email for the group
      try {
        if (emailJSConfig.templateId) {
          await emailjs.send(
            emailJSConfig.serviceId,
            emailJSConfig.templateId,
            {
              to_email: user?.email,
              email_subject: `Appointment Cancelled 📅`,
              email_title: 'Cancellation Confirmed',
              email_body: `Your booking at ${first.salonName || 'Salon'} for ${group.map(g => g.serviceName).join(', ')} has been cancelled.`,
              details_label_1: 'Salon',
              details_value_1: first.salonName || 'N/A',
              details_label_2: 'Date',
              details_value_2: `${first.date} at ${first.time}`,
              details_label_3: 'Services',
              details_value_3: group.map(g => g.serviceName).join(', '),
            },
            emailJSConfig.publicKey
          );
        }
      } catch (e) {
        console.error('Email failed', e);
      }

      // Refresh is handled by subscription
    } catch (error) {
      console.error('Failed to cancel appointment group:', error);
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

        {/* My Appointments (Grouped) */}
        {/* My Appointments (Unified) */}
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
              {groupedAppointments.map((group) => {
                const first = group[0];
                const totalPrice = group.reduce((sum, item) => sum + (item.price || 0), 0);
                const isCancelled = first.status === 'cancelled';
                const isCompleted = first.status === 'completed';
                const isBooked = first.status === 'booked';

                let statusLabel = 'Booked';
                let statusColor = 'bg-purple-100 text-purple-700';

                if (isCancelled) {
                  statusLabel = 'Cancelled';
                  statusColor = 'bg-red-100 text-red-700';
                } else if (isCompleted) {
                  statusLabel = 'Completed';
                  statusColor = 'bg-green-100 text-green-700';
                }

                return (
                  <div key={first.id} className={`border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all ${isCancelled ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* Left Section: Info */}
                      <div className="space-y-1 flex-1">
                        <div className="text-lg font-bold text-gray-900">
                          {first.date} at {first.time}
                        </div>
                        <div className="text-gray-700">
                          <span className="font-medium">{group.map(g => g.serviceName).join(', ')}</span> at <span className="font-semibold">{first.salonName}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {first.salonAddress || `Salon ${first.salonId}`}
                        </div>
                        <div className="font-bold text-purple-700 pt-1">
                          Total: ₹{totalPrice}
                        </div>
                      </div>

                      {/* Right Section: Status & Actions */}
                      <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 border-t md:border-t-0 border-dashed border-gray-200 pt-4 md:pt-0 mt-2 md:mt-0">
                        <div className={`hidden md:block px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                          {statusLabel}
                        </div>



                        {isBooked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelGroup(group)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full md:w-auto"
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
