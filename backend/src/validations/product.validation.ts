import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name required'),
  sku: z.string().min(3, 'SKU required'),
  category: z.string().min(2, 'Category required'),
  tag: z.string().optional().nullable().or(z.literal('')),
  unitPrice: z.number().positive('Unit price must be positive'),
  minStock: z.number().int().nonnegative().default(10),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  initialStock: z.number().int().nonnegative().optional().default(0),
  warehouseId: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
