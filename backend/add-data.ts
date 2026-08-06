import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching first Organisation...");
  let org = await prisma.organisation.findFirst();
  
  if (!org) {
    console.log("No Organisation found. Creating a dummy Organisation...");
    org = await prisma.organisation.create({
      data: {
        name: "Test Org",
        slug: "test-org"
      }
    });
  }

  console.log("Fetching first Branch...");
  let branch = await prisma.branch.findFirst({
    where: { orgId: org.id }
  });

  if (!branch) {
    console.log("No Branch found. Creating a dummy Brand, State, City, and Branch...");
    const brand = await prisma.brand.create({
      data: {
        orgId: org.id,
        name: "Test Brand",
        tag: "TST",
      }
    });

    const state = await prisma.state.create({
        data: {
            orgId: org.id,
            name: "Test State",
            tag: "TS",
            code: "TS-1"
        }
    })

    const city = await prisma.city.create({
      data: {
        orgId: org.id,
        stateId: state.id,
        name: "Test City",
        code: "TC"
      }
    });

    branch = await prisma.branch.create({
      data: {
        orgId: org.id,
        brandId: brand.id,
        cityId: city.id,
        name: "Test Branch",
        label: "TST-001"
      }
    });
  }

  console.log("Creating 2 Users...");
  const defaultPassword = await bcrypt.hash("password123", 10);
  const defaultPin = await bcrypt.hash("1234", 10);

  const user1 = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: "user1" } },
    update: {},
    create: {
      orgId: org.id,
      username: "user1",
      name: "Alice Smith",
      passwordHash: defaultPassword,
      pinHash: defaultPin,
    }
  });

  const user2 = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: "user2" } },
    update: {},
    create: {
      orgId: org.id,
      username: "user2",
      name: "Bob Jones",
      passwordHash: defaultPassword,
      pinHash: defaultPin,
    }
  });
  console.log("Created users:", user1.username, "(Alice Smith) &", user2.username, "(Bob Jones)");
  console.log("Passwords for both are 'password123' and PIN is '1234'.");

  console.log("Creating 2 Tables...");
  let section = await prisma.tableSection.findFirst({
      where: { branchId: branch.id }
  });
  if (!section) {
      section = await prisma.tableSection.create({
          data: {
              branchId: branch.id,
              name: "Main Floor"
          }
      });
  }

  const table1 = await prisma.table.upsert({
    where: { sectionId_number: { sectionId: section.id, number: 1 } },
    update: {},
    create: {
      branchId: branch.id,
      sectionId: section.id,
      number: 1,
      name: "Table 1",
      seats: 4
    }
  });

  const table2 = await prisma.table.upsert({
    where: { sectionId_number: { sectionId: section.id, number: 2 } },
    update: {},
    create: {
      branchId: branch.id,
      sectionId: section.id,
      number: 2,
      name: "Table 2",
      seats: 2
    }
  });
  console.log("Created tables:", table1.name, "and", table2.name);

  console.log("✅ Done! Successfully created users and tables.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
