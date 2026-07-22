import { prisma } from '../utils/prisma';
import { logAudit } from './audit.service';

export class InventoryService {
  static async adjustStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    movementType: 'IN' | 'OUT',
    reason: string,
    userId: string,
    referenceChallanId?: string
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const product = await prisma.product.findFirst({ where: { id: productId, isDeleted: false } });
    if (!product) throw new Error('Product not found');

    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) throw new Error('Warehouse not found');

    let inventory = await prisma.inventory.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    if (!inventory) {
      if (movementType === 'OUT') {
        throw new Error(`Insufficient stock in warehouse ${warehouse.name}. Current stock: 0`);
      }
      inventory = await prisma.inventory.create({
        data: { productId, warehouseId, quantity: 0 },
      });
    }

    if (movementType === 'OUT' && inventory.quantity < quantity) {
      throw new Error(
        `Insufficient stock for product ${product.name} in ${warehouse.name}. Available: ${inventory.quantity}, Requested: ${quantity}`
      );
    }

    const newQuantity = movementType === 'IN' ? inventory.quantity + quantity : inventory.quantity - quantity;

    // Transaction to ensure atomicity
    const [updatedInventory, stockLog] = await prisma.$transaction([
      prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newQuantity },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType,
          reason,
          referenceChallanId: referenceChallanId || null,
          createdById: userId,
        },
      }),
    ]);

    await logAudit(
      userId,
      `STOCK_${movementType}`,
      'Inventory',
      updatedInventory.id,
      `Adjusted stock for ${product.name} (${movementType} ${quantity}). New stock: ${newQuantity}`
    );

    return { inventory: updatedInventory, stockLog };
  }

  static async getMovements(params: {
    productId?: string;
    movementType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.productId) where.productId = params.productId;
    if (params.movementType) where.movementType = params.movementType;

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, category: true } },
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
      }),
    ]);

    return {
      movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getWarehouses() {
    return prisma.warehouse.findMany({
      include: {
        _count: { select: { inventories: true } },
      },
    });
  }
}
