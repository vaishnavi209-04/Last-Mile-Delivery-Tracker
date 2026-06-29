import { Resend } from 'resend';
import { prisma } from '../../lib/prisma';
import { notificationQueue } from '../../lib/queue';

const resend = new Resend(process.env.RESEND_API_KEY);

export const notificationsService = {
  async enqueueForOrder(orderId: string, toStatus: string, customerEmail: string, customerPhone?: string | null) {
    const subject = `Order Update: ${toStatus.replace(/_/g, ' ')}`;
    const body = `Your order status has been updated to: ${toStatus.replace(/_/g, ' ')}. Log in to track your delivery.`;

    // Insert EMAIL outbox row (within the caller's transaction context ideally, but here as fallback)
    const emailOutbox = await prisma.notificationOutbox.create({
      data: {
        orderId,
        channel: 'EMAIL',
        payload: { to: customerEmail, subject, body, orderStatus: toStatus },
        status: 'PENDING',
      },
    });

    await notificationQueue.add('send-notification', {
      outboxId: emailOutbox.id,
      orderId,
      channel: 'EMAIL',
      payload: { to: customerEmail, subject, body, orderStatus: toStatus },
    });

    if (customerPhone && process.env.SMS_PROVIDER_API_KEY) {
      const smsOutbox = await prisma.notificationOutbox.create({
        data: {
          orderId,
          channel: 'SMS',
          payload: { to: customerPhone, body, orderStatus: toStatus },
          status: 'PENDING',
        },
      });

      await notificationQueue.add('send-notification', {
        outboxId: smsOutbox.id,
        orderId,
        channel: 'SMS',
        payload: { to: customerPhone, body, orderStatus: toStatus },
      });
    }
  },

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      await resend.emails.send({
        from: 'delivery@yourdomain.com',
        to,
        subject,
        html: `<p>${body}</p>`,
      });
      return true;
    } catch (err) {
      console.error('[Email] Failed:', err);
      return false;
    }
  },

  async sendSMS(to: string, body: string): Promise<boolean> {
    // Plug in Fast2SMS / Twilio / etc. here
    console.log(`[SMS] To: ${to}, Body: ${body}`);
    return true;
  },
};