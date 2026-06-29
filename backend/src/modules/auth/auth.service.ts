import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Role } from '../../types';
import { createError } from '../../middleware/errorHandler';

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw createError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'customer',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return user;
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw createError('Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async createAgentUser(data: { name: string; email: string; password: string; phone?: string; zoneId?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw createError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'agent',
        agent: {
          create: {
            zoneId: data.zoneId || null,
            maxCapacity: 5,
          },
        },
      },
      include: { agent: true },
    });
    return user;
  },
};