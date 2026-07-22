import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess } from '../utils/apiResponse';

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, logs] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, fullName: true, role: true, email: true },
            },
          },
        }),
      ]);

      return sendSuccess(res, 'Audit logs retrieved', logs, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }
}
