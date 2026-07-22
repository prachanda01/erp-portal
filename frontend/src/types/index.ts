export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  customerName: string;
  businessName: string;
  email: string;
  mobile: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followupDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    challans: number;
    followups: number;
  };
  followups?: CustomerFollowup[];
  challans?: SalesChallan[];
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  notes: string;
  nextFollowupDate?: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    fullName: string;
    role: Role;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  warehouse?: Warehouse;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  tag?: string | null;
  unitPrice: number;
  minStock: number;
  imageUrl?: string | null;
  currentStock?: number;
  isLowStock?: boolean;
  inventories?: InventoryItem[];
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  referenceChallanId?: string | null;
  createdBy: {
    id: string;
    fullName: string;
    role: Role;
  };
  createdAt: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: string;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer: Customer;
  status: ChallanStatus;
  createdById: string;
  createdBy: {
    id: string;
    fullName: string;
    role: Role;
  };
  customerSnapshot: string;
  totalQuantity: number;
  grandTotal: number;
  notes?: string | null;
  items: SalesChallanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    fullName: string;
    role: Role;
    email: string;
  } | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalInventoryValue: number;
  todaysChallanCount: number;
  todaysChallanValue: number;
  monthlySalesValue: number;
  monthlySalesCount: number;
}
