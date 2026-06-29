import dotenv from 'dotenv';
dotenv.config();

import { startNotificationWorker } from './notificationWorker';

startNotificationWorker();
console.log('[WorkerRunner] All workers started');

process.on('SIGTERM', () => {
  console.log('[WorkerRunner] Shutting down');
  process.exit(0);
});