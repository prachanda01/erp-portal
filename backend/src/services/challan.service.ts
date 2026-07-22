import { prisma } from '../utils/prisma';
import { InventoryService } from './inventory.service';
import { logAudit } from './audit.service';

export interface CreateChallanInput {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string | null;
}

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CH-${year}-`;

    const latest = await prisma.salesChallan.findFirst({
      where: { challanNumber: { startsWith: prefix } },
      orderBy: { challanNumber: 'desc' },
    });

    if (!latest) {
      return `${prefix}000001`;
    }

    const currentSeqStr = latest.challanNumber.replace(prefix, '');
    const nextSeq = parseInt(currentSeqStr, 10) + 1;
    return `${prefix}${nextSeq.toString().padStart(6, '0')}`;
  }

  static async create(input: CreateChallanInput, userId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, isDeleted: false },
    });

    if (!customer) throw new Error('Customer not found');

    const customerSnapshot = JSON.stringify({
      customerName: customer.customerName,
      businessName: customer.businessName,
      email: customer.email,
      mobile: customer.mobile,
      gstNumber: customer.gstNumber,
      address: customer.address,
      customerType: customer.customerType,
    });

    let totalQuantity = 0;
    let grandTotal = 0;
    const itemsData = [];

    for (const item of input.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, isDeleted: false },
      });
      if (!product) throw new Error(`Product ID ${item.productId} not found`);

      const productSnapshot = JSON.stringify({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: item.unitPrice,
      });

      const totalPrice = item.quantity * item.unitPrice;
      totalQuantity += item.quantity;
      grandTotal += totalPrice;

      itemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        productSnapshot,
      });
    }

    const challanNumber = await this.generateChallanNumber();

    const challan = await prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: customer.id,
        createdById: userId,
        customerSnapshot,
        status: 'DRAFT',
        totalQuantity,
        grandTotal,
        notes: input.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });

    await logAudit(userId, 'CREATE_CHALLAN', 'SalesChallan', challan.id, `Created sales challan ${challan.challanNumber} (Draft)`);
    return challan;
  }

  static async updateStatus(challanId: string, newStatus: 'DRAFT' | 'CONFIRMED' | 'CANCELLED', userId: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: challanId },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!challan) throw new Error('Sales Challan not found');

    if (challan.status === newStatus) {
      return challan;
    }

    if (challan.status === 'CANCELLED') {
      throw new Error('Cancelled sales challans cannot be reopened or modified.');
    }

    // Default warehouse for inventory adjustments
    let defaultWarehouse = await prisma.warehouse.findFirst();
    if (!defaultWarehouse) {
      defaultWarehouse = await prisma.warehouse.create({
        data: { name: 'Main Central Warehouse', code: 'WH-MAIN', location: 'Primary Facility' },
      });
    }

    // Transition logic:
    // 1. DRAFT -> CONFIRMED: Reduce stock
    if (challan.status === 'DRAFT' && newStatus === 'CONFIRMED') {
      // Validate stock availability for ALL items first before deducting
      for (const item of challan.items) {
        const inventory = await prisma.inventory.findUnique({
          where: { productId_warehouseId: { productId: item.productId, warehouseId: defaultWarehouse.id } },
        });

        const currentQty = inventory ? inventory.quantity : 0;
        if (currentQty < item.quantity) {
          const prod = await prisma.product.findUnique({ where: { id: item.productId } });
          throw new Error(
            `Cannot confirm challan. Stock deficit for product "${prod?.name || item.productId}". Available: ${currentQty}, Required: ${item.quantity}`
          );
        }
      }

      // Perform stock reduction
      for (const item of challan.items) {
        await InventoryService.adjustStock(
          item.productId,
          defaultWarehouse.id,
          item.quantity,
          'OUT',
          `Sales Challan ${challan.challanNumber} Confirmed`,
          userId,
          challan.id
        );
      }
    }

    // 2. CONFIRMED -> CANCELLED: Restore stock
    if (challan.status === 'CONFIRMED' && newStatus === 'CANCELLED') {
      for (const item of challan.items) {
        await InventoryService.adjustStock(
          item.productId,
          defaultWarehouse.id,
          item.quantity,
          'IN',
          `Restored stock from cancelled Sales Challan ${challan.challanNumber}`,
          userId,
          challan.id
        );
      }
    }

    const updatedChallan = await prisma.salesChallan.update({
      where: { id: challanId },
      data: { status: newStatus },
      include: {
        customer: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });

    await logAudit(
      userId,
      'UPDATE_CHALLAN_STATUS',
      'SalesChallan',
      challanId,
      `Updated status of ${challan.challanNumber} from ${challan.status} to ${newStatus}`
    );

    return updatedChallan;
  }

  static async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search } },
        { customer: { customerName: { contains: params.search } } },
        { customer: { businessName: { contains: params.search } } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [total, challans] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          items: { include: { product: true } },
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
      }),
    ]);

    return {
      challans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        createdBy: {
          select: { id: true, fullName: true, role: true, email: true },
        },
      },
    });

    if (!challan) throw new Error('Sales Challan not found');
    return challan;
  }
}
