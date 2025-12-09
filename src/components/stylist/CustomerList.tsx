import React from 'react';
import { formatRelativeTime } from '@/lib/utils/time';
import type { QueueItem } from '@/types/queue';

interface CustomerListProps {
  queue: QueueItem[];
}

export const CustomerList: React.FC<CustomerListProps> = ({ queue }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Customer Queue</h2>
      
      {queue.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-gray-500">No customers in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((customer, index) => (
            <div
              key={customer.id}
              className={`p-4 rounded-lg border-2 ${
                index === 0
                  ? 'bg-green-50 border-green-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    #{index + 1}
                    {index === 0 && (
                      <span className="ml-2 text-green-600 text-sm">NEXT</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Waiting {formatRelativeTime(customer.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Est. wait</p>
                  <p className="font-semibold text-lg">{customer.estimatedWaitTime}m</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};