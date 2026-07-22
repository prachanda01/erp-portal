import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logAudit } from './audit.service';

export class AuthService {
  static async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled. Please contact system administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    await logAudit(user.id, 'LOGIN', 'User', user.id, `User logged in`, ipAddress);

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken: newAccessToken };
  }

  static async logout(refreshToken: string, userId?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
    if (userId) {
      await logAudit(userId, 'LOGOUT', 'User', userId, 'User logged out');
    }
    return true;
  }

  static async registerUser(data: { email: string; password: string; fullName: string; role: string }, creatorId?: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role as any,
      },
    });

    await logAudit(creatorId, 'CREATE_USER', 'User', user.id, `Created user ${user.email} (${user.role})`);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  }
}
