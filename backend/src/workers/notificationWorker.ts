import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { notificationsService } from '../modules/notifications/notifications.service';
import { NotificationJobData } from '../lib/queue';

export function startNotificationWorker() {
  const worker = new Worker<NotificationJobData>(
    'notifications',
    async (job: Job<NotificationJobData>) => {
      const { outboxId, channel, payload } = job.data;

      let success = false;

      if (channel === 'EMAIL') {
        success = await notificationsService.sendEmail(payload.to, payload.subject!, payload.body);
      } else if (channel === 'SMS') {
        success = await notificationsService.sendSMS(payload.to, payload.body);
      }

      // Update outbox row
      await prisma.notificationOutbox.update({
        where: { id: outboxId },
        data: {
          status: success ? 'SENT' : 'FAILED',
          attempts: { increment: 1 },
        },
      });

      if (!success) throw new Error(`Notification delivery failed for outbox ${outboxId}`);
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => console.log(`[Worker] Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`[Worker] Job ${job?.id} failed:`, err.message));

  console.log('[Worker] Notification worker started');
  return worker;
}