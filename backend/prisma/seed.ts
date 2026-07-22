import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NexusERP Operations Suite Database Seeding...');

  // 1. Seed Users
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const salesPassword = await bcrypt.hash('Sales123!', 10);
  const warehousePassword = await bcrypt.hash('Warehouse123!', 10);
  const accountsPassword = await bcrypt.hash('Accounts123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      email: 'admin@minierp.com',
      passwordHash: adminPassword,
      fullName: 'Vikram Malhotra (Admin)',
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@minierp.com' },
    update: {},
    create: {
      email: 'sales@minierp.com',
      passwordHash: salesPassword,
      fullName: 'Ananya Sharma (Sales Exec)',
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@minierp.com' },
    update: {},
    create: {
      email: 'warehouse@minierp.com',
      passwordHash: warehousePassword,
      fullName: 'Ramesh Kumar (Warehouse Lead)',
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@minierp.com' },
    update: {},
    create: {
      email: 'accounts@minierp.com',
      passwordHash: accountsPassword,
      fullName: 'Priya Patel (Accounts Manager)',
      role: 'ACCOUNTS',
    },
  });

  console.log('  ✅ Users created (Admin, Sales, Warehouse, Accounts)');

  // 2. Seed Warehouses
  const warehouse1 = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Central Distribution Hub',
      code: 'WH-MAIN',
      location: 'Bhiwandi Logistics Park, Zone A, Maharashtra',
    },
  });

  const warehouse2 = await prisma.warehouse.upsert({
    where: { code: 'WH-NORTH' },
    update: {},
    create: {
      name: 'North Regional Depot',
      code: 'WH-NORTH',
      location: 'Okhla Industrial Area Phase 3, New Delhi',
    },
  });

  console.log('  ✅ Warehouses created');

  // 3. Seed Customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'purchase@apexelectronics.com' },
    update: {},
    create: {
      customerName: 'Rajesh Shah',
      businessName: 'Apex Electronics & Appliances Pvt Ltd',
      email: 'purchase@apexelectronics.com',
      mobile: '+91 9820012345',
      gstNumber: '27AAACA1234A1Z5',
      customerType: 'WHOLESALE',
      address: 'Plot 45, MIDC Industrial Hub, Andheri East, Mumbai',
      status: 'ACTIVE',
      notes: 'Key wholesale distributor. 30-day payment cycle.',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'info@nationaltraders.in' },
    update: {},
    create: {
      customerName: 'Sanjay Gupta',
      businessName: 'National Hardware & Tools Corp',
      email: 'info@nationaltraders.in',
      mobile: '+91 9811122334',
      gstNumber: '07BBBCB5678B1Z2',
      customerType: 'DISTRIBUTOR',
      address: '102 GB Road Commercial Complex, New Delhi',
      status: 'ACTIVE',
      notes: 'Prefers weekly bulk dispatches.',
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { email: 'sales@metroretail.com' },
    update: {},
    create: {
      customerName: 'Kavita Reddy',
      businessName: 'Metro Retail Outlets Solutions',
      email: 'sales@metroretail.com',
      mobile: '+91 9440055667',
      gstNumber: '36CCCC19101C1Z8',
      customerType: 'RETAIL',
      address: '22 Hitec City Main Road, Hyderabad',
      status: 'ACTIVE',
      notes: 'High-frequency retail partner.',
    },
  });

  const customer4 = await prisma.customer.upsert({
    where: { email: 'procurement@nexaglobal.com' },
    update: {},
    create: {
      customerName: 'Vikramaditya Roy',
      businessName: 'Nexa Enterprise Technologies',
      email: 'procurement@nexaglobal.com',
      mobile: '+91 9833344556',
      gstNumber: '19AAACN9988A1Z1',
      customerType: 'DISTRIBUTOR',
      address: 'Sector 5, Salt Lake Electronics Complex, Kolkata',
      status: 'ACTIVE',
      notes: 'Quarterly enterprise contract client.',
    },
  });

  console.log('  ✅ Customers created');

  // 4. Seed Products
  const productsData = [
    {
      name: 'Industrial Smart Energy Meter 3-Phase',
      sku: 'PRD-EM-001',
      category: 'Electronics',
      tag: 'Bestseller',
      unitPrice: 3450.0,
      minStock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop',
      initialQty: 120,
    },
    {
      name: 'High Performance Circuit Breaker 63A',
      sku: 'PRD-CB-063',
      category: 'Electronics',
      tag: 'Critical Stock',
      unitPrice: 850.0,
      minStock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop',
      initialQty: 8, // Low stock on purpose for dashboard alert testing!
    },
    {
      name: 'Stainless Steel Heavy Duty Fasteners Pack',
      sku: 'PRD-HD-100',
      category: 'Industrial Hardware',
      tag: 'Bulk Special',
      unitPrice: 420.0,
      minStock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop',
      initialQty: 350,
    },
    {
      name: 'Pneumatic Control Valve Assembly 1/2"',
      sku: 'PRD-PV-012',
      category: 'Industrial Hardware',
      tag: 'Low Stock',
      unitPrice: 1950.0,
      minStock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop',
      initialQty: 4, // Low stock on purpose!
    },
    {
      name: 'Heavy Duty Corrugated Shipping Boxes (Set of 50)',
      sku: 'PRD-PKG-50',
      category: 'Packaging',
      tag: 'Essential',
      unitPrice: 1200.0,
      minStock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop',
      initialQty: 200,
    },
    {
      name: 'Digital Optical Sensors Unit',
      sku: 'PRD-OS-200',
      category: 'Sensors & Automation',
      tag: 'High Precision',
      unitPrice: 2800.0,
      minStock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop',
      initialQty: 85,
    },
  ];

  for (const prodData of productsData) {
    const { initialQty, ...rest } = prodData;
    const product = await prisma.product.upsert({
      where: { sku: rest.sku },
      update: { tag: rest.tag },
      create: rest,
    });

    // Seed inventory for product in Main Warehouse
    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouse1.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        warehouseId: warehouse1.id,
        quantity: initialQty,
      },
    });

    // Record initial stock movement log
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: initialQty,
        movementType: 'IN',
        reason: 'Initial Opening Stock Entry',
        createdById: warehouseUser.id,
      },
    });
  }

  console.log('  ✅ Products & Inventory initialized');

  // 5. Seed Customer Follow-ups
  await prisma.customerFollowup.create({
    data: {
      customerId: customer1.id,
      notes: 'Discussed Q3 bulk supply contract for circuit breakers. Client requested a 5% volume discount.',
      nextFollowupDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      createdById: salesUser.id,
    },
  });

  console.log('  ✅ Customer Follow-up created');

  // 6. Seed Sample Sales Challan
  const sampleProduct = await prisma.product.findFirst({ where: { sku: 'PRD-EM-001' } });
  if (sampleProduct) {
    const challanNumber = 'CH-2026-000001';
    const customerSnapshot = JSON.stringify({
      customerName: customer1.customerName,
      businessName: customer1.businessName,
      email: customer1.email,
      mobile: customer1.mobile,
      gstNumber: customer1.gstNumber,
      address: customer1.address,
    });

    const productSnapshot = JSON.stringify({
      name: sampleProduct.name,
      sku: sampleProduct.sku,
      unitPrice: sampleProduct.unitPrice,
    });

    const existingChallan = await prisma.salesChallan.findUnique({ where: { challanNumber } });
    if (!existingChallan) {
      await prisma.salesChallan.create({
        data: {
          challanNumber,
          customerId: customer1.id,
          createdById: salesUser.id,
          customerSnapshot,
          status: 'CONFIRMED',
          totalQuantity: 10,
          grandTotal: sampleProduct.unitPrice * 10,
          notes: 'Urgent warehouse dispatch requested by client.',
          items: {
            create: [
              {
                productId: sampleProduct.id,
                quantity: 10,
                unitPrice: sampleProduct.unitPrice,
                totalPrice: sampleProduct.unitPrice * 10,
                productSnapshot,
              },
            ],
          },
        },
      });
    }
  }

  console.log('  ✅ Sample Sales Challan created');

  // 7. Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INIT',
      entity: 'System',
      details: 'NexusERP Operations Suite database initialized successfully.',
    },
  });

  console.log('  ✅ Audit logs recorded');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
