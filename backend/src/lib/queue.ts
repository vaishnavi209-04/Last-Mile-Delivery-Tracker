import { Queue } from 'bullmq';
import { redis } from './redis';

export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export interface NotificationJobData {
  outboxId: string;
  orderId: string;
  channel: 'EMAIL' | 'SMS';
  payload: {
    to: string;
    subject?: string;
    body: string;
    orderStatus?: string;
  };
}