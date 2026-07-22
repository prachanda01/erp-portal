import { prisma } from '../utils/prisma';
import { logAudit } from './audit.service';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  static async getAll(params: ProductQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { sku: { contains: params.search } },
        { category: { contains: params.search } },
        { tag: { contains: params.search } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          inventories: {
            include: { warehouse: true },
          },
        },
      }),
    ]);

    // Format products with total calculated current stock across all warehouses
    const formattedProducts = products.map((prod) => {
      const currentStock = prod.inventories.reduce((acc, inv) => acc + inv.quantity, 0);
      const isLowStock = currentStock <= prod.minStock;
      return {
        ...prod,
        currentStock,
        isLowStock,
      };
    });

    const finalProducts = params.lowStockOnly
      ? formattedProducts.filter((p) => p.isLowStock)
      : formattedProducts;

    return {
      products: finalProducts,
      meta: {
        total: params.lowStockOnly ? finalProducts.length : total,
        page,
        limit,
        totalPages: Math.ceil((params.lowStockOnly ? finalProducts.length : total) / limit),
      },
    };
  }

  static async getById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        inventories: {
          include: { warehouse: true },
        },
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!product) throw new Error('Product not found');

    const currentStock = product.inventories.reduce((acc, inv) => acc + inv.quantity, 0);
    return {
      ...product,
      currentStock,
      isLowStock: currentStock <= product.minStock,
    };
  }

  static async create(data: any, userId?: string) {
    const existingSku = await prisma.product.findFirst({
      where: { sku: data.sku, isDeleted: false },
    });
    if (existingSku) throw new Error('Product with this SKU already exists');

    const { initialStock, warehouseId, ...productData } = data;

    const product = await prisma.product.create({
      data: productData,
    });

    // Handle initial stock setup if provided
    if (initialStock && initialStock > 0) {
      let targetWarehouseId = warehouseId;
      if (!targetWarehouseId) {
        let defaultWh = await prisma.warehouse.findFirst();
        if (!defaultWh) {
          defaultWh = await prisma.warehouse.create({
            data: { name: 'Main Central Warehouse', code: 'WH-MAIN', location: 'Primary Distribution Facility' },
          });
        }
        targetWarehouseId = defaultWh.id;
      }

      await prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseId: targetWarehouseId,
          quantity: initialStock,
        },
      });

      if (userId) {
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            quantity: initialStock,
            movementType: 'IN',
            reason: 'Initial stock on product creation',
            createdById: userId,
          },
        });
      }
    }

    await logAudit(userId, 'CREATE_PRODUCT', 'Product', product.id, `Created product ${product.name} (SKU: ${product.sku})`);
    return product;
  }

  static async update(id: string, data: any, userId?: string) {
    const existing = await prisma.product.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new Error('Product not found');

    if (data.sku && data.sku !== existing.sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: { sku: data.sku, isDeleted: false, NOT: { id } },
      });
      if (duplicateSku) throw new Error('Product SKU is already in use');
    }

    const { initialStock, warehouseId, ...updateData } = data;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, 'UPDATE_PRODUCT', 'Product', updated.id, `Updated product ${updated.name}`);
    return updated;
  }

  static async delete(id: string, userId?: string) {
    const existing = await prisma.product.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new Error('Product not found');

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    await logAudit(userId, 'DELETE_PRODUCT', 'Product', id, `Soft deleted product ${existing.name}`);
    return true;
  }

  static async getCategories() {
    const categories = await prisma.product.findMany({
      where: { isDeleted: false },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map((c) => c.category);
  }
}
