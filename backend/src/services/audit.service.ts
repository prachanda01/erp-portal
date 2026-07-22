import { prisma } from '../utils/prisma';

export const logAudit = async (
  userId: string | null | undefined,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: string | object | null,
  ipAddress?: string | null
) => {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: detailsStr || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
};
