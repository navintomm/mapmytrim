import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { adjustSalonQueue } from '@/lib/firebase/functions';
import { Alert } from '../ui/Alert';

interface QueueManagerProps {
  salonId: string;
  currentQueue: number;
}

export const QueueManager: React.FC<QueueManagerProps> = ({ salonId, currentQueue }) => {
  const [loading, setLoading] = useState<'increment' | 'decrement' | null>(null);
  const [error, setError] = useState('');

  const handleAdjustQueue = async (adjustment: 1 | -1) => {
    setLoading(adjustment === 1 ? 'increment' : 'decrement');
    setError('');

    try {
      await adjustSalonQueue({ salonId, adjustment });
    } catch (err: any) {
      setError(err.message || 'Failed to adjust queue');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Queue Management</h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="flex items-center justify-center gap-8 my-8">
        <Button
          onClick={() => handleAdjustQueue(-1)}
          loading={loading === 'decrement'}
          variant="danger"
          size="lg"
          className="w-20 h-20 text-4xl rounded-full"
          disabled={currentQueue === 0}
        >
          −
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Current Queue</p>
          <p className="text-5xl font-bold text-blue-600">{currentQueue}</p>
        </div>

        <Button
          onClick={() => handleAdjustQueue(1)}
          loading={loading === 'increment'}
          variant="primary"
          size="lg"
          className="w-20 h-20 text-4xl rounded-full"
        >
          +
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => handleAdjustQueue(-1)}
          disabled={currentQueue === 0}
          className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-semibold disabled:opacity-50"
        >
          Customer Served
        </button>
        <button
          onClick={() => handleAdjustQueue(1)}
          className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-semibold"
        >
          Walk-in Customer
        </button>
      </div>
    </div>
  );
};
