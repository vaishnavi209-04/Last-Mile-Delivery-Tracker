import { prisma } from '../../lib/prisma';
import { cacheDel, cacheGet, cacheSet } from '../../lib/redis';
import { createError } from '../../middleware/errorHandler';

export const zonesService = {
  async getAllZones() {
    return prisma.zone.findMany({ include: { areas: true } });
  },

  async createZone(name: string) {
    const zone = await prisma.zone.create({ data: { name } });
    return zone;
  },

  async updateZone(id: string, name: string) {
    return prisma.zone.update({ where: { id }, data: { name } });
  },

  async createArea(pincode: string, zoneId: string) {
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone) throw createError('Zone not found', 404);

    const area = await prisma.area.upsert({
      where: { pincode },
      create: { pincode, zoneId },
      update: { zoneId },
    });

    // Invalidate cache for this pincode
    await cacheDel(`zone:area:${pincode}`);
    return area;
  },

  async resolveZoneByPincode(pincode: string) {
    const cacheKey = `zone:area:${pincode}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const area = await prisma.area.findUnique({
      where: { pincode },
      include: { zone: true },
    });
    if (!area) throw createError(`No zone mapped for pincode: ${pincode}`, 422);

    await cacheSet(cacheKey, JSON.stringify(area.zone), 3600);
    return area.zone;
  },

  async deleteArea(pincode: string) {
    await cacheDel(`zone:area:${pincode}`);
    return prisma.area.delete({ where: { pincode } });
  },
};