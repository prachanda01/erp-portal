import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerName: z.string().min(2, 'Customer name required'),
  businessName: z.string().min(2, 'Business name required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(8, 'Valid mobile number required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).default('WHOLESALE'),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  followupDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowupSchema = z.object({
  notes: z.string().min(3, 'Follow-up notes required'),
  nextFollowupDate: z.string().optional().nullable(),
});
