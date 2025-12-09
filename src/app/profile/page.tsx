'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDateTime } from '@/lib/utils/time';
import { updateUser } from '@/lib/firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

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

        {/* Active Check-in */}
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

        {/* Visit History Placeholder */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Visit History</h2>
          <p className="text-gray-500 text-center py-8">
            Your visit history will appear here
          </p>
        </Card>
      </main>
    </div>
  );
}
