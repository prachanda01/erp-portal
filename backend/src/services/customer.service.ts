import { prisma } from '../utils/prisma';
import { logAudit } from './audit.service';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CustomerService {
  static async getAll(params: CustomerQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    if (params.search) {
      where.OR = [
        { customerName: { contains: params.search } },
        { businessName: { contains: params.search } },
        { email: { contains: params.search } },
        { mobile: { contains: params.search } },
        { gstNumber: { contains: params.search } },
      ];
    }

    if (params.customerType) {
      where.customerType = params.customerType;
    }

    if (params.status) {
      where.status = params.status;
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { challans: true, followups: true },
          },
        },
      }),
    ]);

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, isDeleted: false },
      include: {
        followups: {
          include: {
            createdBy: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          include: {
            createdBy: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  static async create(data: any, userId?: string) {
    // Check duplicates
    const existingEmail = await prisma.customer.findFirst({
      where: { email: data.email, isDeleted: false },
    });
    if (existingEmail) throw new Error('A customer with this email already exists');

    if (data.gstNumber) {
      const existingGst = await prisma.customer.findFirst({
        where: { gstNumber: data.gstNumber, isDeleted: false },
      });
      if (existingGst) throw new Error('A customer with this GST number already exists');
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        followupDate: data.followupDate ? new Date(data.followupDate) : null,
      },
    });

    await logAudit(userId, 'CREATE_CUSTOMER', 'Customer', customer.id, `Created customer ${customer.businessName}`);
    return customer;
  }

  static async update(id: string, data: any, userId?: string) {
    const existing = await prisma.customer.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new Error('Customer not found');

    if (data.email && data.email !== existing.email) {
      const duplicateEmail = await prisma.customer.findFirst({
        where: { email: data.email, isDeleted: false, NOT: { id } },
      });
      if (duplicateEmail) throw new Error('Email is already in use by another customer');
    }

    if (data.gstNumber && data.gstNumber !== existing.gstNumber) {
      const duplicateGst = await prisma.customer.findFirst({
        where: { gstNumber: data.gstNumber, isDeleted: false, NOT: { id } },
      });
      if (duplicateGst) throw new Error('GST number is already in use by another customer');
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        ...(data.followupDate !== undefined && {
          followupDate: data.followupDate ? new Date(data.followupDate) : null,
        }),
      },
    });

    await logAudit(userId, 'UPDATE_CUSTOMER', 'Customer', updated.id, `Updated customer ${updated.businessName}`);
    return updated;
  }

  static async delete(id: string, userId?: string) {
    const existing = await prisma.customer.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new Error('Customer not found');

    await prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });

    await logAudit(userId, 'DELETE_CUSTOMER', 'Customer', id, `Soft deleted customer ${existing.businessName}`);
    return true;
  }

  static async addFollowup(customerId: string, data: { notes: string; nextFollowupDate?: string | null }, userId: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, isDeleted: false } });
    if (!customer) throw new Error('Customer not found');

    const nextDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;

    const followup = await prisma.customerFollowup.create({
      data: {
        customerId,
        notes: data.notes,
        nextFollowupDate: nextDate,
        createdById: userId,
      },
    });

    if (nextDate) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { followupDate: nextDate },
      });
    }

    await logAudit(userId, 'ADD_CUSTOMER_FOLLOWUP', 'CustomerFollowup', followup.id, `Added follow-up for customer ${customer.businessName}`);
    return followup;
  }
}
