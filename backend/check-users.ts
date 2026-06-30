import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  console.log('Users in DB:', users.length);
  if (users.length > 0) {
    console.log(users.map(u => ({ email: u.email, role: u.role })));
  }
}).catch(console.error).finally(() => prisma.$disconnect());
