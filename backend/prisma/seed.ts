import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@delivery.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@delivery.com', passwordHash: adminHash, role: 'admin' },
  });

  // Customer
  const custHash = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: { name: 'Test Customer', email: 'customer@test.com', phone: '9999999999', passwordHash: custHash, role: 'customer' },
  });

  // Zones
  const zoneA = await prisma.zone.upsert({ where: { name: 'Zone A - North' }, update: {}, create: { name: 'Zone A - North' } });
  const zoneB = await prisma.zone.upsert({ where: { name: 'Zone B - South' }, update: {}, create: { name: 'Zone B - South' } });
  const zoneC = await prisma.zone.upsert({ where: { name: 'Zone C - East' },  update: {}, create: { name: 'Zone C - East' } });

  // Areas (pincodes)
  const areas = [
    { pincode: '110001', zoneId: zoneA.id },
    { pincode: '110002', zoneId: zoneA.id },
    { pincode: '400001', zoneId: zoneB.id },
    { pincode: '400002', zoneId: zoneB.id },
    { pincode: '700001', zoneId: zoneC.id },
    { pincode: '700002', zoneId: zoneC.id },
  ];
  for (const area of areas) {
    await prisma.area.upsert({ where: { pincode: area.pincode }, update: {}, create: area });
  }

  // Rate cards
  const rateConfigs = [
    { fromZoneId: zoneA.id, toZoneId: zoneA.id, orderType: 'B2C' as const, ratePerKg: 30 },
    { fromZoneId: zoneA.id, toZoneId: zoneA.id, orderType: 'B2B' as const, ratePerKg: 25 },
    { fromZoneId: zoneA.id, toZoneId: zoneB.id, orderType: 'B2C' as const, ratePerKg: 50 },
    { fromZoneId: zoneA.id, toZoneId: zoneB.id, orderType: 'B2B' as const, ratePerKg: 40 },
    { fromZoneId: zoneB.id, toZoneId: zoneA.id, orderType: 'B2C' as const, ratePerKg: 50 },
    { fromZoneId: zoneB.id, toZoneId: zoneA.id, orderType: 'B2B' as const, ratePerKg: 40 },
    { fromZoneId: zoneB.id, toZoneId: zoneB.id, orderType: 'B2C' as const, ratePerKg: 30 },
    { fromZoneId: zoneB.id, toZoneId: zoneB.id, orderType: 'B2B' as const, ratePerKg: 25 },
    { fromZoneId: zoneA.id, toZoneId: zoneC.id, orderType: 'B2C' as const, ratePerKg: 60 },
    { fromZoneId: zoneA.id, toZoneId: zoneC.id, orderType: 'B2B' as const, ratePerKg: 48 },
    { fromZoneId: zoneB.id, toZoneId: zoneC.id, orderType: 'B2C' as const, ratePerKg: 55 },
    { fromZoneId: zoneB.id, toZoneId: zoneC.id, orderType: 'B2B' as const, ratePerKg: 45 },
    { fromZoneId: zoneC.id, toZoneId: zoneA.id, orderType: 'B2C' as const, ratePerKg: 60 },
    { fromZoneId: zoneC.id, toZoneId: zoneA.id, orderType: 'B2B' as const, ratePerKg: 48 },
    { fromZoneId: zoneC.id, toZoneId: zoneB.id, orderType: 'B2C' as const, ratePerKg: 55 },
    { fromZoneId: zoneC.id, toZoneId: zoneB.id, orderType: 'B2B' as const, ratePerKg: 45 },
    { fromZoneId: zoneC.id, toZoneId: zoneC.id, orderType: 'B2C' as const, ratePerKg: 30 },
    { fromZoneId: zoneC.id, toZoneId: zoneC.id, orderType: 'B2B' as const, ratePerKg: 25 },
  ];

  for (const rc of rateConfigs) {
    await prisma.rateCard.upsert({
      where: { fromZoneId_toZoneId_orderType: { fromZoneId: rc.fromZoneId, toZoneId: rc.toZoneId, orderType: rc.orderType } },
      update: {},
      create: rc,
    });
  }

  // COD Surcharge configs
  await prisma.codSurchargeConfig.upsert({
    where: { orderType: 'B2C' },
    update: {},
    create: { orderType: 'B2C', type: 'PERCENTAGE', value: 2 },
  });
  await prisma.codSurchargeConfig.upsert({
    where: { orderType: 'B2B' },
    update: {},
    create: { orderType: 'B2B', type: 'FLAT', value: 50 },
  });

  // Agent user
  const agentHash = await bcrypt.hash('agent123', 12);
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@delivery.com' },
    update: {},
    create: {
      name: 'Test Agent',
      email: 'agent@delivery.com',
      phone: '8888888888',
      passwordHash: agentHash,
      role: 'agent',
      agent: {
        create: {
          zoneId: zoneA.id,
          currentLat: 28.6139,
          currentLng: 77.2090,
          clockedIn: true,
          maxCapacity: 5,
          activeOrderCount: 0,
        },
      },
    },
  });

  console.log('Seed complete!');
  console.log('Admin:', admin.email, '/ admin123');
  console.log('Customer:', customer.email, '/ customer123');
  console.log('Agent:', agentUser.email, '/ agent123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());