import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './modules/auth/auth.routes';
import zonesRoutes from './modules/zones/zones.routes';
import rateCardsRoutes from './modules/rateCards/rateCards.routes';
import ordersRoutes from './modules/orders/orders.routes';
import agentsRoutes from './modules/agents/agents.routes';
import trackingRoutes from './modules/tracking/tracking.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/rate-cards', rateCardsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/orders', trackingRoutes);  // /api/orders/:id/timeline

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[API] Server running on port ${PORT}`));

export default app;