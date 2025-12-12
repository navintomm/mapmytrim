export interface QueueItem {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  shopId: string;
  status: QueueStatus;
  createdAt: Date;
  estimatedWaitTime: number; // in minutes
  queueNumber: number;
  serviceId?: string;
  serviceName?: string;
  serviceDuration?: number;
}

export type QueueStatus = 'waiting' | 'serving' | 'completed';
