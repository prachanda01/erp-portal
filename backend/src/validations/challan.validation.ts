import { z } from 'zod';

export const createChallanItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(createChallanItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional().nullable(),
});

export const updateChallanStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']),
});
