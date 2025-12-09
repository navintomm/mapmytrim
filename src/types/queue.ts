export interface QueueItem {
  id: string;
  userId: string;
  status: QueueStatus;
  createdAt: Date;
  estimatedWaitTime: number; // in minutes
}

export type QueueStatus = 'waiting' | 'serving' | 'completed';
