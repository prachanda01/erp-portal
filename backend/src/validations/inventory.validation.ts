import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  warehouseId: z.string().uuid('Invalid Warehouse ID'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(3, 'Reason is required for stock adjustment'),
});
