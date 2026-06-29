import { OrderType, SurchargeType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { cacheDel, cacheGet, cacheSet } from '../../lib/redis';
import { createError } from '../../middleware/errorHandler';

export const rateCardsService = {
  async getAll() {
    return prisma.rateCard.findMany({
      where: { isActive: true },
      include: { fromZone: true, toZone: true },
    });
  },

  async create(data: { fromZoneId: string; toZoneId: string; orderType: OrderType; ratePerKg: number }) {
    const card = await prisma.rateCard.create({ data });
    await cacheDel(`rate:${data.fromZoneId}:${data.toZoneId}:${data.orderType}`);
    return card;
  },

  async update(id: string, ratePerKg: number) {
    const existing = await prisma.rateCard.findUnique({ where: { id } });
    if (!existing) throw createError('Rate card not found', 404);

    const card = await prisma.rateCard.update({
      where: { id },
      data: { ratePerKg, updatedAt: new Date() },
    });

    // Invalidate cache
    await cacheDel(`rate:${existing.fromZoneId}:${existing.toZoneId}:${existing.orderType}`);
    return card;
  },

  async getRateCard(fromZoneId: string, toZoneId: string, orderType: OrderType) {
    const cacheKey = `rate:${fromZoneId}:${toZoneId}:${orderType}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const card = await prisma.rateCard.findFirst({
      where: { fromZoneId, toZoneId, orderType, isActive: true },
    });
    if (!card) throw createError(`No active rate card for this zone pair and order type`, 422);

    await cacheSet(cacheKey, JSON.stringify(card), 3600);
    return card;
  },

  async getCodSurcharges() {
    return prisma.codSurchargeConfig.findMany();
  },

  async upsertCodSurcharge(data: { orderType: OrderType; type: SurchargeType; value: number }) {
    const config = await prisma.codSurchargeConfig.upsert({
      where: { orderType: data.orderType },
      create: data,
      update: { type: data.type, value: data.value },
    });
    await cacheDel(`cod:${data.orderType}`);
    return config;
  },

  async getCodSurcharge(orderType: OrderType) {
    const cacheKey = `cod:${orderType}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const config = await prisma.codSurchargeConfig.findUnique({
      where: { orderType },
    });

    if (config) await cacheSet(cacheKey, JSON.stringify(config), 3600);
    return config;
  },
};