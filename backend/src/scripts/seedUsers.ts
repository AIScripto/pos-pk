// ─────────────────────────────────────────────────────────────────────────────
// Production / Initial Provisioning User Seeding Script
// Creates:
// 1. Super Admin  -> username: superadmin, password: @!786Allahis1!#
// 2. Client Admin -> username: admin,      password: #admin@!
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedInitialUsers() {
  console.log('🚀 Starting initial user provisioning...');

  // 1. Organisation
  const org = await prisma.organisation.upsert({
    where: { slug: 'crispcrumbs' },
    update: {},
    create: {
      name: 'CrispCrumbs POS',
      slug: 'crispcrumbs',
      email: 'info@crispcrumbs.com',
      addrLine1: 'Main POS Office',
      addrCity: 'Karachi',
      addrCountry: 'PK',
      createdBy: 'provisioning',
    },
  });
  // 1b. Brand
  const brand = await prisma.brand.upsert({
    where: { orgId_tag: { orgId: org.id, tag: 'CC' } },
    update: {},
    create: {
      orgId: org.id,
      tag: 'CC',
      name: 'Crisp & Crumbs',
      tagline: 'Crispy. Always.',
      primaryColor: '#F97316',
      createdBy: 'provisioning',
    },
  });
  console.log(`  ✓ Brand: ${brand.name}`);

  // 2. Admin Role
  const adminRole = await prisma.role.upsert({
    where: { orgId_tag: { orgId: org.id, tag: 'admin' } },
    update: {},
    create: {
      orgId: org.id,
      tag: 'admin',
      name: 'Admin',
      description: 'System Admin Access',
      createdBy: 'provisioning',
    },
  });
  console.log(`  ✓ Admin Role created`);

  // 3. User 1: Super Admin (Password: @!786Allahis1!#)
  const superAdminPasswordHash = await bcrypt.hash('@!786Allahis1!#', 12);
  const superAdminPinHash = await bcrypt.hash('7860', 10);

  const superAdmin = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'superadmin' } },
    update: {
      passwordHash: superAdminPasswordHash,
      pinHash: superAdminPinHash,
      isActive: true,
    },
    create: {
      orgId: org.id,
      roleId: adminRole.id,
      username: 'superadmin',
      email: 'superadmin@crispcrumbs.com',
      name: 'Super Admin',
      passwordHash: superAdminPasswordHash,
      pinHash: superAdminPinHash,
      createdBy: 'provisioning',
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId_scopeId: { userId: superAdmin.id, roleId: adminRole.id, scopeId: org.id.toString() } },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: adminRole.id,
      scopeType: 'organisation',
      scopeId: org.id.toString(),
      createdBy: 'provisioning',
    },
  });
  console.log(`  ✓ User 1 (Super Admin): superadmin / @!786Allahis1!#`);

  // 4. User 2: Store Admin (Password: admin1234)
  const clientAdminPasswordHash = await bcrypt.hash('admin1234', 12);
  const clientAdminPinHash = await bcrypt.hash('1234', 10);

  const clientAdmin = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'admin' } },
    update: {
      passwordHash: clientAdminPasswordHash,
      pinHash: clientAdminPinHash,
      isActive: true,
    },
    create: {
      orgId: org.id,
      roleId: adminRole.id,
      username: 'admin',
      email: 'admin@crispcrumbs.com',
      name: 'Store Admin',
      passwordHash: clientAdminPasswordHash,
      pinHash: clientAdminPinHash,
      createdBy: 'provisioning',
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId_scopeId: { userId: clientAdmin.id, roleId: adminRole.id, scopeId: org.id.toString() } },
    update: {},
    create: {
      userId: clientAdmin.id,
      roleId: adminRole.id,
      scopeType: 'organisation',
      scopeId: org.id.toString(),
      createdBy: 'provisioning',
    },
  });
  console.log(`  ✓ User 2 (Store Admin): admin / admin1234`);

  // 5. Cashier & Manager Roles
  const cashierRole = await prisma.role.upsert({
    where: { orgId_tag: { orgId: org.id, tag: 'pos' } },
    update: {},
    create: {
      orgId: org.id,
      tag: 'pos',
      name: 'Cashier',
      description: 'POS Cashier Access',
      createdBy: 'provisioning',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { orgId_tag: { orgId: org.id, tag: 'manager' } },
    update: {},
    create: {
      orgId: org.id,
      tag: 'manager',
      name: 'Manager',
      description: 'Store Manager Access',
      createdBy: 'provisioning',
    },
  });

  // 6. User 3: Manager (Tariq)
  const managerPasswordHash = await bcrypt.hash('manager123', 12);
  const managerPinHash = await bcrypt.hash('1234', 10);
  const managerUser = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'tariq' } },
    update: { passwordHash: managerPasswordHash, pinHash: managerPinHash, isActive: true },
    create: {
      orgId: org.id,
      roleId: managerRole.id,
      username: 'tariq',
      email: 'tariq@crispcrumbs.com',
      name: 'Tariq Manager',
      passwordHash: managerPasswordHash,
      pinHash: managerPinHash,
      createdBy: 'provisioning',
    },
  });
  console.log(`  ✓ Manager User: tariq / manager123`);

  // 7. User 4: Cashier 1
  const cashierPasswordHash = await bcrypt.hash('cashier123', 12);
  const cashierPinHash = await bcrypt.hash('8591', 10);
  const cashier1 = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'cashier1' } },
    update: { passwordHash: cashierPasswordHash, pinHash: cashierPinHash, isActive: true },
    create: {
      orgId: org.id,
      roleId: cashierRole.id,
      username: 'cashier1',
      email: 'cashier1@crispcrumbs.com',
      name: 'Cashier Counter 1',
      passwordHash: cashierPasswordHash,
      pinHash: cashierPinHash,
      createdBy: 'provisioning',
    },
  });
  console.log(`  ✓ Cashier 1: cashier1 / cashier123`);

  // 8. Auto-create default terminal (Till-01) for all active branches
  const activeBranches = await prisma.branch.findMany({ where: { orgId: org.id, isActive: true } });
  for (const b of activeBranches) {
    const existingTerminal = await prisma.terminal.findFirst({ where: { branchId: b.id, name: 'Counter 01' } });
    if (!existingTerminal) {
      await prisma.terminal.create({
        data: {
          branchId: b.id,
          name: 'Counter 01',
          code: 'TILL-01',
          type: 'counter',
          description: 'Main Register Counter',
          isActive: true,
          createdBy: 'provisioning',
        },
      });
    }
    console.log(`  ✓ Default Terminal (Counter 01) provisioned for branch: ${b.name}`);
  }

  console.log('✅ User provisioning completed successfully!');
}

seedInitialUsers()
  .catch((err) => {
    console.error('❌ User provisioning error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
