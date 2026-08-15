// ─────────────────────────────────────────────────────────────────────────────
// Database Seed Script
// DEVELOPMENT ONLY — Seeds schema and test data for local development.
// Initializes Enterprise POS with: org, a branch (Downtown), terminals,
// products, categories, test users (admin, manager, cashier), tax config, deals,
// tables, discounts, and shift templates. Safely re-runable on dev databases.
// Run: npx prisma db seed
// ⚠️  WILL NOT RUN IN PRODUCTION — environment guard enforced.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Seed main function: creates or updates all foundational POS data.
// Uses upsert operations so re-running is safe (idempotent).
// Returns when all data is seeded; Prisma disconnect is handled in finally block.
async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Seed script cannot run in production. NODE_ENV=production detected.');
  }

  console.log('🌱 Seeding database…');

  // ── Organisation ──────────────────────────────────────────────────────────
  // Root tenant. Creates or retrieves Enterprise org. All entities below
  // (branches, users, products) are scoped to this org via orgId.
  const org = await prisma.organisation.upsert({
    where: { slug: 'enterprise-pos' },
    update: {},
    create: {
      name: 'Enterprise POS',
      slug: 'enterprise-pos',
      addrLine1: '123 Main Street',
      addrCity: 'Karachi',
      addrState: 'Sindh',
      addrCountry: 'PK',
      addrPostCode: '75600',
      phone: '+92-21-1234567',
      email: 'info@example.com',
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Organisation: ${org.name}`);

  // ── Org Config ────────────────────────────────────────────────────────────
  // Global settings for this org: currency (PKR), locale (en-PK), timezone,
  // receipt headers/footers. Used by all branches under this org.
  await prisma.orgConfig.upsert({
    where: { orgId: org.id },
    update: {},
    create: {
      orgId: org.id,
      currencyCode: 'PKR',
      currencySymbol: 'Rs',
      symbolPosition: 'before',
      decimalPlaces: 0,
      thousandSep: ',',
      decimalSep: '.',
      locale: 'en-PK',
      timezone: 'Asia/Karachi',
      dateFormat: 'DD/MM/YYYY',
      receiptHeader: 'Enterprise POS\n123 Main Street, Downtown',
      receiptFooter: 'Thank you for dining with us!',
      createdBy: 'seed',
    },
  });

  // ── Brand ─────────────────────────────────────────────────────────────────
  // Brand identity for Enterprise: tagline, primary color (#F97316 orange).
  // Branches reference this for consistent branding across all locations.
  const brand = await prisma.brand.upsert({
    where: { orgId_tag: { orgId: org.id, tag: 'CC' } },
    update: {},
    create: {
      orgId: org.id,
      tag: 'CC',
      name: 'Crisp & Crumbs',
      tagline: 'Crispy. Always.',
      primaryColor: '#F97316',
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Brand: ${brand.name}`);

  // ── States ────────────────────────────────────────────────────────────────
  // Pakistan provinces/states (ICT, KP, Punjab, Sindh). Provide geographic
  // hierarchy for cities and define region boundaries (e.g., delivery zones).
  const statesData = [
    { tag: 'ICT', name: 'Islamabad Capital Territory', code: 'PK-ICT', zipCode: '44000-46000', country: 'PK', region: 'South Asia' },
    { tag: 'KP', name: 'Khyber Pakhtunkhwa', code: 'PK-KP', zipCode: '25000-27000', country: 'PK', region: 'South Asia' },
    { tag: 'PJ', name: 'Punjab', code: 'PK-PJ', zipCode: '54000-62000', country: 'PK', region: 'South Asia' },
    { tag: 'SN', name: 'Sindh', code: 'PK-SN', zipCode: '75000-75500', country: 'PK', region: 'South Asia' },
  ];

  const stateMap: { [key: string]: any } = {};
  for (const s of statesData) {
    const state = await prisma.state.upsert({
      where: { orgId_tag: { orgId: org.id, tag: s.tag } },
      update: {},
      create: { ...s, orgId: org.id, createdBy: 'seed' },
    });
    stateMap[s.tag] = state;
  }
  console.log(`  ✓ States: ${statesData.length} states created`);

  // ── City ──────────────────────────────────────────────────────────────────
  // Karachi as the primary city. City code (3 letters, 'KHI') is the first
  // part of branch label: KHI-001-CLI (city-sequence-area). Linked to Sindh.
  const city = await prisma.city.upsert({
    where: { orgId_name: { orgId: org.id, name: 'Karachi' } },
    update: { stateId: stateMap['SN'].id },
    create: {
      orgId: org.id,
      stateId: stateMap['SN'].id,  // Sindh
      name: 'Karachi',
      code: 'KHI',          // used in branch label prefix
      country: 'PK',
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ City: ${city.name} [${city.code}]`);

  // ── Areas ─────────────────────────────────────────────────────────────────
  // Neighborhoods within Karachi (Clifton, DHA, Gulshan-e-Iqbal). Used in
  // branch labels (e.g., CLI for Clifton) and delivery zone calculations.
  // Each area has lat/lng for location-based services.
  const areasData = [
    {
      tag: 'CLI',
      name: 'Clifton',
      details: 'Clifton and nearby seaside commercial zones',
      latitude: 24.8138,
      longitude: 67.0298,
    },
    {
      tag: 'DHA',
      name: 'DHA',
      details: 'Defence Housing Authority phases and commercial lanes',
      latitude: 24.8049,
      longitude: 67.0631,
    },
    {
      tag: 'GUL',
      name: 'Gulshan-e-Iqbal',
      details: 'Gulshan blocks and nearby residential zones',
      latitude: 24.9206,
      longitude: 67.0880,
    },
  ];

  const areaMap: { [key: string]: any } = {};
  for (const a of areasData) {
    const area = await prisma.area.upsert({
      where: { cityId_tag: { cityId: city.id, tag: a.tag } },
      update: {
        name: a.name,
        details: a.details,
        latitude: a.latitude,
        longitude: a.longitude,
        isActive: true,
      },
      create: {
        orgId: org.id,
        cityId: city.id,
        tag: a.tag,
        name: a.name,
        details: a.details,
        latitude: a.latitude,
        longitude: a.longitude,
        createdBy: 'seed',
      },
    });
    areaMap[a.tag] = area;
  }
  console.log(`  ✓ Areas: ${areasData.length} Karachi areas`);

  const lahoreCity = await prisma.city.upsert({
    where: { orgId_name: { orgId: org.id, name: 'Lahore' } },
    update: {
      stateId: stateMap['PJ'].id,
      code: 'LHR',
      latitude: 31.5204,
      longitude: 74.3587,
      isActive: true,
    },
    create: {
      orgId: org.id,
      stateId: stateMap['PJ'].id,
      name: 'Lahore',
      code: 'LHR',
      latitude: 31.5204,
      longitude: 74.3587,
      country: 'PK',
      createdBy: 'seed',
    },
  });

  const lahoreAreasData = [
    {
      tag: 'DHA',
      name: 'DHA Lahore',
      details: 'Defence Housing Authority Lahore phases and commercial zones',
      latitude: 31.4697,
      longitude: 74.4018,
    },
    {
      tag: 'GLB',
      name: 'Gulberg',
      details: 'Gulberg Main Boulevard and surrounding commercial areas',
      latitude: 31.5204,
      longitude: 74.3587,
    },
    {
      tag: 'JHT',
      name: 'Johar Town',
      details: 'Johar Town residential and market zones',
      latitude: 31.4697,
      longitude: 74.2728,
    },
    {
      tag: 'MDT',
      name: 'Model Town',
      details: 'Model Town blocks and adjacent service areas',
      latitude: 31.4832,
      longitude: 74.3239,
    },
    {
      tag: 'WPT',
      name: 'Wapda Town',
      details: 'Wapda Town and nearby residential delivery zones',
      latitude: 31.4321,
      longitude: 74.2699,
    },
  ];

  for (const a of lahoreAreasData) {
    await prisma.area.upsert({
      where: { cityId_tag: { cityId: lahoreCity.id, tag: a.tag } },
      update: {
        name: a.name,
        details: a.details,
        latitude: a.latitude,
        longitude: a.longitude,
        isActive: true,
      },
      create: {
        orgId: org.id,
        cityId: lahoreCity.id,
        tag: a.tag,
        name: a.name,
        details: a.details,
        latitude: a.latitude,
        longitude: a.longitude,
        createdBy: 'seed',
      },
    });
  }
  console.log(`  ✓ Areas: ${lahoreAreasData.length} Lahore areas`);

  // NOTE: Lahore city and areas are seeded for future expansion, but no Lahore branch
  // is created yet. Only Clifton (Karachi) branch is active below.

  // ── Branch ────────────────────────────────────────────────────────────────
  // Bootstrap: creates a single restaurant location (Clifton, Karachi). Label format:
  // {CITY_CODE}-{SEQ_3DIGIT}-{AREA_CODE} e.g., KHI-001-CLI.
  // Branches hold terminals, tables, inventory, and staff assignments.
  // Additional branches can be created via admin panel.
  const branch = await prisma.branch.upsert({
    where: { orgId_label: { orgId: org.id, label: 'KHI-001-CLI' } },
    update: { areaId: areaMap['CLI'].id },
    create: {
      orgId: org.id,
      brandId: brand.id,
      cityId: city.id,
      areaId: areaMap['CLI'].id,
      label: 'KHI-001-CLI',             // human-readable unique ID
      name: 'Clifton Branch, Karachi',  // full descriptive name
      phone: '+92-21-1234567',
      email: 'clifton@cripcrumbs.pk',
      openTime: '09:00',
      closeTime: '23:00',
      addrLine1: '123 Clifton Road',
      addrArea: 'Clifton',
      addrCity: 'Karachi',
      addrState: 'Sindh',
      addrCountry: 'PK',
      addrPostCode: '75600',
      addrLat: 24.8138,
      addrLng: 67.0298,
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Branch: [${branch.label}] ${branch.name}`);

  // ── Terminal ──────────────────────────────────────────────────────────────
  // POS tills (checkout points). Each branch has one or more tills for
  // processing transactions. Labeled KHI-CLI-T1, KHI-CLI-T2, etc.
  // Uses (branchId, name) as unique key. Fresh databases have no legacy names.
  const terminal = await prisma.terminal.upsert({
    where: { branchId_name: { branchId: branch.id, name: 'Till 1' } },
    update: {
      code: 'KHI-CLI-T1',
      type: 'counter',
      description: 'Main counter — Till 1',
      sortOrder: 1,
    },
    create: {
      branchId: branch.id,
      name: 'Till 1',
      code: 'KHI-CLI-T1',
      type: 'counter',
      description: 'Main counter — Till 1',
      sortOrder: 1,
      createdBy: 'seed',
    },
  });

  const terminal2 = await prisma.terminal.upsert({
    where: { branchId_name: { branchId: branch.id, name: 'Till 2' } },
    update: {
      code: 'KHI-CLI-T2',
      type: 'counter',
      description: 'Main counter — Till 2',
      sortOrder: 2,
    },
    create: {
      branchId: branch.id,
      name: 'Till 2',
      code: 'KHI-CLI-T2',
      type: 'counter',
      description: 'Main counter — Till 2',
      sortOrder: 2,
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Terminals: ${terminal.name}, ${terminal2.name}`);

  // Shift templates define work hours for this branch. Staff schedules
  // reference these templates for their assigned shift timing.
  const shiftTemplates = [
    { name: 'Shift 1', startTime: '06:00', endTime: '14:00', sortOrder: 1 },
    { name: 'Shift 2', startTime: '14:00', endTime: '22:00', sortOrder: 2 },
    { name: 'Shift 3', startTime: '22:00', endTime: '06:00', sortOrder: 3 },
  ];

  for (const shift of shiftTemplates) {
    await prisma.shiftTemplate.upsert({
      where: { branchId_name: { branchId: branch.id, name: shift.name } },
      update: shift,
      create: { ...shift, branchId: branch.id, createdBy: 'seed' },
    });
  }
  console.log(`  ✓ Shifts: ${shiftTemplates.map((s) => `${s.name} ${s.startTime}-${s.endTime}`).join(', ')}`);

  // ── Tax Config ────────────────────────────────────────────────────────────
  // Default tax rules (GST 17% exclusive — added on top of item price).
  // Used for automatic tax calculation on all orders unless overridden per item.
  // Only created if no default tax config exists.
  const existingTax = await prisma.taxConfig.findFirst({
    where: { orgId: org.id, isDefault: true },
  });
  if (!existingTax) {
    await prisma.taxConfig.create({
      data: {
        orgId: org.id,
        name: 'Standard GST',
        rate: 17,           // 17% Pakistan GST
        mode: 'exclusive',  // added on top of price
        appliesTo: 'all',
        isDefault: true,
        createdBy: 'seed',
      },
    });
  }
  console.log('  ✓ Tax config: GST 17% exclusive');

  // ── Roles ─────────────────────────────────────────────────────────────────
  // Four base roles: Admin (system-wide), Manager (branch-level), Cashier (POS),
  // Kitchen (order prep). Each user is assigned one or more roles with
  // scoped permissions (org-level or branch-level).
  const rolesData = [
    { tag: 'admin', name: 'Admin', description: 'Full system access' },
    { tag: 'manager', name: 'Manager', description: 'Branch and sales management' },
    { tag: 'cashier', name: 'Cashier', description: 'Point of sale and transactions' },
    { tag: 'kitchen', name: 'Kitchen Staff', description: 'Order preparation' },
  ];

  const roles = await Promise.all(
    rolesData.map((roleData) =>
      prisma.role.upsert({
        where: { orgId_tag: { orgId: org.id, tag: roleData.tag } },
        update: {},
        create: {
          orgId: org.id,
          tag: roleData.tag,
          name: roleData.name,
          description: roleData.description,
          createdBy: 'seed',
        },
      }),
    ),
  );
  console.log(`  ✓ Roles: ${roles.map((r) => r.name).join(', ')}`);

  // Get admin role for user assignment
  const adminRole = roles.find((r) => r.tag === 'admin')!;
  const cashierRole = roles.find((r) => r.tag === 'cashier')!;

  // ── Admin User ────────────────────────────────────────────────────────────
  // System admin with org-wide access. Test user for development only.
  // CREDENTIAL: username: admin, password: admin1234, PIN: 1234
  // NOTE: Separate userRoleAssignment record required to grant role permissions.
  const passwordHash = await bcrypt.hash('admin1234', 12);
  const pinHash = await bcrypt.hash('1234', 10);

  const admin = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'admin' } },
    update: {
      roleId: adminRole.id,
      email: 'admin@aipos.pk',
      name: 'Admin User',
      passwordHash,
      pinHash,
      isActive: true,
    },
    create: {
      orgId: org.id,
      roleId: adminRole.id,
      username: 'admin',
      email: 'admin@aipos.pk',
      name: 'Admin User',
      passwordHash,
      pinHash,
      createdBy: 'seed',
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId_scopeId: { userId: admin.id, roleId: adminRole.id, scopeId: org.id.toString() } },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
      scopeType: 'organisation',
      scopeId: org.id.toString(),
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Admin: admin@aipos.pk`);

  // ── Manager User ─────────────────────────────────────────────────────────
  // Branch manager scoped to Clifton branch. Test user for development only.
  // CREDENTIAL: email: manager@aipos.pk, password: manager123, PIN: 1234
  const managerRole = roles.find((r) => r.tag === 'manager')!;
  const managerPinHash = await bcrypt.hash('1234', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'manager1' } },
    update: {
      roleId: managerRole.id,
      email: 'manager@aipos.pk',
      name: 'Branch Manager',
      passwordHash: managerPasswordHash,
      pinHash: managerPinHash,
      isActive: true,
    },
    create: {
      orgId: org.id,
      roleId: managerRole.id,
      username: 'manager1',
      email: 'manager@aipos.pk',
      name: 'Branch Manager',
      passwordHash: managerPasswordHash,
      pinHash: managerPinHash,
      createdBy: 'seed',
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId_scopeId: { userId: manager.id, roleId: managerRole.id, scopeId: branch.id.toString() } },
    update: {},
    create: {
      userId: manager.id,
      roleId: managerRole.id,
      scopeType: 'branch',
      scopeId: branch.id.toString(),
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Manager: manager@aipos.pk`);

  // ── Cashier User ─────────────────────────────────────────────────────────
  // Till operator scoped to Clifton branch. Test user for development only.
  // CREDENTIAL: email: cashier@aipos.pk, password: cashier123, PIN: 8591
  const cashierPinHash = await bcrypt.hash('8591', 10);
  const cashierPasswordHash = await bcrypt.hash('cashier123', 12);
  const cashier = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: 'cashier1' } },
    update: {
      roleId: cashierRole.id,
      email: 'cashier@aipos.pk',
      name: 'Cashier One',
      passwordHash: cashierPasswordHash,
      pinHash: cashierPinHash,
      isActive: true,
    },
    create: {
      orgId: org.id,
      roleId: cashierRole.id,
      username: 'cashier1',
      email: 'cashier@aipos.pk',
      name: 'Cashier One',
      passwordHash: cashierPasswordHash,
      pinHash: cashierPinHash,
      createdBy: 'seed',
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId_scopeId: { userId: cashier.id, roleId: cashierRole.id, scopeId: branch.id.toString() } },
    update: {},
    create: {
      userId: cashier.id,
      roleId: cashierRole.id,
      scopeType: 'branch',
      scopeId: branch.id.toString(),
      createdBy: 'seed',
    },
  });
  console.log(`  ✓ Cashier: cashier@aipos.pk`);

  // ── Food Types ────────────────────────────────────────────────────────────
  // Cuisine types (Fast Food, Chinese, Western, Asian Continental) group
  // categories for menu organization and filtering. Top-level classification.
  const foodTypesData = [
    { slug: 'FFD', name: 'Fast Food', sortOrder: 1 },
    { slug: 'CHN', name: 'Chinese', sortOrder: 2 },
    { slug: 'WST', name: 'Western', sortOrder: 3 },
    { slug: 'ASN', name: 'Asian Continental', sortOrder: 4 },
  ];

  const foodTypeMap: { [key: string]: any } = {};
  for (const ft of foodTypesData) {
    const foodType = await prisma.foodType.upsert({
      where: { orgId_slug: { orgId: org.id, slug: ft.slug } },
      update: {},
      create: { ...ft, orgId: org.id, createdBy: 'seed' },
    });
    foodTypeMap[ft.slug] = foodType;
  }
  console.log(`  ✓ Food Types: ${foodTypesData.length} food types created`);

  // ── Categories ────────────────────────────────────────────────────────────
  // Product groups (Burgers, Wraps, Chicken, Fries, Drinks, Desserts, Combos).
  // 3-letter tags form SKU prefixes (BRG-0001, CHK-0042) and appear in menus.
  // Each category links to a food type for hierarchy.
  const categoriesData = [
    { tag: 'BRG', name: 'Burgers', foodTypeSlug: 'FFD', sortOrder: 1 },
    { tag: 'WRP', name: 'Wraps', foodTypeSlug: 'FFD', sortOrder: 2 },
    { tag: 'CHK', name: 'Chicken', foodTypeSlug: 'FFD', sortOrder: 3 },
    { tag: 'FRI', name: 'Fries', foodTypeSlug: 'FFD', sortOrder: 4 },
    { tag: 'DRK', name: 'Drinks', foodTypeSlug: 'FFD', sortOrder: 5 },
    { tag: 'DES', name: 'Desserts', foodTypeSlug: 'FFD', sortOrder: 6 },
    { tag: 'CMB', name: 'Combos', foodTypeSlug: 'FFD', sortOrder: 7 },
  ];

  const categoryMap: { [key: string]: any } = {};
  for (const c of categoriesData) {
    const foodTypeId = (c as any).foodTypeSlug ? foodTypeMap[(c as any).foodTypeSlug].id : null;
    const category = await prisma.category.upsert({
      where: { orgId_tag: { orgId: org.id, tag: c.tag } },
      update: { foodTypeId, isActive: true },
      create: {
        orgId: org.id,
        tag: c.tag,
        name: c.name,
        foodTypeId,
        sortOrder: c.sortOrder,
        isActive: true,
        createdBy: 'seed',
      },
    });
    categoryMap[c.tag] = category;
  }
  console.log(`  ✓ Categories: ${categoriesData.length} categories created`);

  // ── Products ──────────────────────────────────────────────────────────────
  // 19 menu items (burgers, wraps, chicken, fries, drinks) with base prices
  // in paisa (PKR). Each product gets inventory seeded at 100 units per branch.
  // SKUs are unique identifiers for POS and inventory tracking.
  // NOTE: On re-run, prices are NOT updated (respect manual price changes).
  // Sort order and name are updated to keep menu layout in sync.
  const productData = [
    { name: 'Classic Beef Burger', sku: 'BRG-0001', categoryTag: 'BRG', basePricePaisa: 65000, sortOrder: 1 },
    { name: 'Double Stack Burger', sku: 'BRG-0002', categoryTag: 'BRG', basePricePaisa: 85000, sortOrder: 2 },
    { name: 'Crispy Chicken Burger', sku: 'BRG-0003', categoryTag: 'BRG', basePricePaisa: 70000, sortOrder: 3 },
    { name: 'BBQ Bacon Burger', sku: 'BRG-0004', categoryTag: 'BRG', basePricePaisa: 95000, sortOrder: 4 },
    { name: 'Chicken Wrap', sku: 'WRP-0001', categoryTag: 'WRP', basePricePaisa: 55000, sortOrder: 5 },
    { name: 'Beef Wrap', sku: 'WRP-0002', categoryTag: 'WRP', basePricePaisa: 60000, sortOrder: 6 },
    { name: 'Zinger Wrap', sku: 'WRP-0003', categoryTag: 'WRP', basePricePaisa: 65000, sortOrder: 7 },
    { name: 'Crispy Tenders (4 pcs)', sku: 'CHK-0001', categoryTag: 'CHK', basePricePaisa: 50000, sortOrder: 8 },
    { name: 'Crispy Tenders (8 pcs)', sku: 'CHK-0002', categoryTag: 'CHK', basePricePaisa: 95000, sortOrder: 9 },
    { name: 'Popcorn Chicken', sku: 'CHK-0003', categoryTag: 'CHK', basePricePaisa: 40000, sortOrder: 10 },
    { name: 'Regular Fries', sku: 'FRI-0001', categoryTag: 'FRI', basePricePaisa: 25000, sortOrder: 11 },
    { name: 'Large Fries', sku: 'FRI-0002', categoryTag: 'FRI', basePricePaisa: 35000, sortOrder: 12 },
    { name: 'Loaded Cheese Fries', sku: 'FRI-0003', categoryTag: 'FRI', basePricePaisa: 45000, sortOrder: 13 },
    { name: 'Soft Drink (Regular)', sku: 'DRK-0001', categoryTag: 'DRK', basePricePaisa: 15000, sortOrder: 14 },
    { name: 'Soft Drink (Large)', sku: 'DRK-0002', categoryTag: 'DRK', basePricePaisa: 20000, sortOrder: 15 },
    { name: 'Milkshake', sku: 'DRK-0003', categoryTag: 'DRK', basePricePaisa: 45000, sortOrder: 16 },
    { name: 'Fresh Juice', sku: 'DRK-0004', categoryTag: 'DRK', basePricePaisa: 30000, sortOrder: 17 },
    { name: 'Mineral Water', sku: 'DRK-0005', categoryTag: 'DRK', basePricePaisa: 8000, sortOrder: 18 },
  ];

  for (const p of productData) {
    const product = await prisma.product.upsert({
      where: { orgId_sku: { orgId: org.id, sku: p.sku } },
      update: { name: p.name, sortOrder: p.sortOrder },
      create: {
        orgId: org.id,
        categoryId: categoryMap[p.categoryTag].id,
        name: p.name,
        sku: p.sku,
        basePricePaisa: p.basePricePaisa,
        sortOrder: p.sortOrder,
        createdBy: 'seed',
      },
    });

    await prisma.inventory.upsert({
      where: { productId_branchId: { productId: product.id, branchId: branch.id } },
      update: {},
      create: {
        productId: product.id,
        branchId: branch.id,
        quantity: 100,
        minThreshold: 10,
        createdBy: 'seed',
      },
    });
  }
  console.log(`  ✓ Products: ${productData.length} items seeded with inventory`);

  // ── Deals ─────────────────────────────────────────────────────────────────
  // 5 promotional bundles (combos) with fixed discounts. Customers can buy
  // entire deals at sale price instead of individual items. Used for
  // revenue acceleration and inventory clearance campaigns.
  // NOTE: On re-run, sale prices are NOT updated (respect manual price changes).
  // Description and discount percentage updated to keep promotions current.
  const dealData = [
    {
      name: 'Classic Combo',
      tag: 'DEAL-001',
      categoryTag: 'BRG',
      description: 'Cheeseburger + Fries + Drink',
      basePricePaisa: 129700,
      salePricePaisa: 99900,
      discountPercentage: 22.98,
      availabilityType: 'all_time',
    },
    {
      name: 'Double Trouble',
      tag: 'DEAL-002',
      categoryTag: 'BRG',
      description: 'Double Stack + Large Fries + Large Drink',
      basePricePaisa: 184700,
      salePricePaisa: 149900,
      discountPercentage: 18.84,
      availabilityType: 'all_time',
    },
    {
      name: 'Chicken Feast',
      tag: 'DEAL-003',
      categoryTag: 'CHK',
      description: '5pc Tenders + Large Fries + Large Drink',
      basePricePaisa: 164700,
      salePricePaisa: 129900,
      discountPercentage: 21.13,
      availabilityType: 'all_time',
    },
    {
      name: 'Wrap & Go',
      tag: 'DEAL-004',
      categoryTag: 'WRP',
      description: 'Caesar Wrap + Fries + Drink',
      basePricePaisa: 134700,
      salePricePaisa: 109900,
      discountPercentage: 18.41,
      availabilityType: 'all_time',
    },
    {
      name: 'Family Pack',
      tag: 'DEAL-005',
      categoryTag: 'CMB',
      description: '2 Burgers + 5pc Tenders + 2 Large Fries + 2 Large Drinks',
      basePricePaisa: 459500,
      salePricePaisa: 349900,
      discountPercentage: 23.85,
      availabilityType: 'scheduled',
      availableDays: 'MON,TUE,WED,THU,FRI,SAT,SUN',
      startTime: '11:00',
      endTime: '23:00',
    },
  ];

  for (const d of dealData) {
    const catObj = categoryMap[d.categoryTag];
    await prisma.deal.upsert({
      where: { orgId_tag: { orgId: org.id, tag: d.tag.toLowerCase() } },
      update: {
        categoryId: catObj ? catObj.id : null,
        description: d.description,
        basePricePaisa: d.basePricePaisa,
        salePricePaisa: d.salePricePaisa,
        discountPercentage: d.discountPercentage,
        availabilityType: d.availabilityType || 'all_time',
        availableDays: d.availableDays || null,
        startTime: d.startTime || null,
        endTime: d.endTime || null,
        isActive: true,
      },
      create: {
        orgId: org.id,
        categoryId: catObj ? catObj.id : null,
        name: d.name,
        tag: d.tag.toLowerCase(),
        description: d.description,
        basePricePaisa: d.basePricePaisa,
        salePricePaisa: d.salePricePaisa,
        discountPercentage: d.discountPercentage,
        availabilityType: d.availabilityType || 'all_time',
        availableDays: d.availableDays || null,
        startTime: d.startTime || null,
        endTime: d.endTime || null,
        createdBy: 'seed',
      },
    });
  }
  console.log(`  ✓ Deals: ${dealData.length} promotional deals`);

  // ── Table Sections + Tables ───────────────────────────────────────────────
  // Dine-in seating layout. 8 tables: first 4 are 2-seat squares, last 4 are
  // 4-seat rectangles. Positioned in grid (4x2). Used for table-based orders
  // (dine-in) and KDS (kitchen display) routing.
  const diningSection = await prisma.tableSection.upsert({
    where: { branchId_name: { branchId: branch.id, name: 'Dining Area' } },
    update: {},
    create: { branchId: branch.id, name: 'Dining Area', sortOrder: 1, createdBy: 'seed' },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.table.upsert({
      where: { sectionId_number: { sectionId: diningSection.id, number: i } },
      update: {},
      create: {
        branchId: branch.id,
        sectionId: diningSection.id,
        number: i,
        name: `T${i}`,
        seats: i <= 4 ? 2 : 4,
        shape: i <= 4 ? 'square' : 'rectangle',
        posX: (i - 1) % 4 * 200 + 50,
        posY: Math.floor((i - 1) / 4) * 200 + 50,
        createdBy: 'seed',
      },
    });
  }
  console.log(`  ✓ Tables: 8 tables in Dining Area`);

  // ── Discount Presets ──────────────────────────────────────────────────────
  // Quick-apply discounts for cashiers: Staff (20%), Loyalty (10%), Manager
  // Override (50% — requires PIN), and fixed amounts (Rs 50, Rs 100).
  // Applied to order total, some require manager authorization.
  const discountPresets = [
    { name: 'Staff Discount', type: 'percent', value: 20, level: 'order', requiresManagerPin: false, sortOrder: 1 },
    { name: 'Loyalty Discount', type: 'percent', value: 10, level: 'order', requiresManagerPin: false, sortOrder: 2 },
    { name: 'Manager Override', type: 'percent', value: 50, level: 'order', requiresManagerPin: true, sortOrder: 3 },
    { name: 'Rs 50 Off', type: 'fixed', value: 5000, level: 'order', requiresManagerPin: false, sortOrder: 4 },
    { name: 'Rs 100 Off', type: 'fixed', value: 10000, level: 'order', requiresManagerPin: false, sortOrder: 5 },
  ];

  for (const d of discountPresets) {
    await prisma.discountPreset.upsert({
      where: { orgId_name: { orgId: org.id, name: d.name } },
      update: {},
      create: { ...d, orgId: org.id, createdBy: 'seed' },
    });
  }
  console.log(`  ✓ Discount presets: ${discountPresets.length}`);

  console.log('\n✅ Seed complete!\n');
  console.log('   Test Credentials (development only):');
  console.log(`   Admin    — email: admin@aipos.pk`);
  console.log(`   Manager  — email: manager@aipos.pk`);
  console.log(`   Cashier  — email: cashier@aipos.pk`);
  console.log(`   Branch   — label: ${branch.label}, ID: ${branch.id}`);
  console.log(`   Terminal — ID: ${terminal.id}`);
  console.log(`\n   ⚠️  Check .env for NODE_ENV=development confirmation.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
