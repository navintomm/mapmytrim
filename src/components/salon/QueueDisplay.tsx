import React from 'react';
import { formatRelativeTime } from '@/lib/utils/time';
import type { QueueItem } from '@/types/queue';

interface QueueDisplayProps {
  queue: QueueItem[];
  currentUserId?: string;
}

export const QueueDisplay: React.FC<QueueDisplayProps> = ({ queue, currentUserId }) => {
  const userPosition = queue.findIndex((item) => item.userId === currentUserId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Current Queue</h2>
      
      {queue.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No one in queue</p>
      ) : (
        <div className="space-y-3">
          {queue.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border-2 ${
                item.userId === currentUserId
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    Position #{index + 1}
                    {item.userId === currentUserId && (
                      <span className="ml-2 text-blue-600">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Joined {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Est. wait</p>
                  <p className="font-semibold">{item.estimatedWaitTime} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {userPosition >= 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-center text-green-700 font-semibold">
            You are #{userPosition + 1} in the queue
          </p>
        </div>
      )}
    </div>
  );
};