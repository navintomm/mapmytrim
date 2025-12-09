import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { toggleStylistDuty } from '@/lib/firebase/functions';

interface DutyToggleProps {
  salonId: string;
  stylistId: string;
  initialStatus: boolean;
}

export const DutyToggle: React.FC<DutyToggleProps> = ({
  salonId,
  stylistId,
  initialStatus,
}) => {
  const [isOnDuty, setIsOnDuty] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !isOnDuty;
      await toggleStylistDuty({ salonId, stylistId, isOnDuty: newStatus });
      setIsOnDuty(newStatus);
    } catch (error) {
      console.error('Failed to toggle duty:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Duty Status</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">
            {isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
          </p>
          <p className="text-sm text-gray-600">
            {isOnDuty
              ? 'You are visible to customers'
              : 'You are not visible to customers'}
          </p>
        </div>
        <Button
          onClick={handleToggle}
          loading={loading}
          variant={isOnDuty ? 'danger' : 'primary'}
          size="lg"
        >
          {isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
        </Button>
      </div>
    </div>
  );
};
