import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching first Organisation...");
  const org = await prisma.organisation.findFirst();

  if (!org) {
    console.log("No Organisation found. Cannot create users.");
    return;
  }

  console.log("Deleting old users (user1, user2) if they exist...");
  await prisma.user.deleteMany({
    where: { username: { in: ["user1", "user2"] } }
  });

  console.log("Creating/Updating Super Admin...");
  const superadminPassword = await bcrypt.hash("@!786Allahis1!#", 10);
  const superadminPin = await bcrypt.hash("7860", 10);

  const superadmin = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: "superadmin" } },
    update: {
      email: "superadmin@aipos.com",
      passwordHash: superadminPassword,
      pinHash: superadminPin
    },
    create: {
      orgId: org.id,
      username: "superadmin",
      name: "Super Admin",
      email: "superadmin@aipos.com",
      passwordHash: superadminPassword,
      pinHash: superadminPin,
    }
  });

  console.log("Creating/Updating Store Admin...");
  const adminPassword = await bcrypt.hash("#admin@!", 10);
  const adminPin = await bcrypt.hash("1234", 10);

  const admin = await prisma.user.upsert({
    where: { orgId_username: { orgId: org.id, username: "admin" } },
    update: {
      email: "admin@aipos.com",
      passwordHash: adminPassword,
      pinHash: adminPin
    },
    create: {
      orgId: org.id,
      username: "admin",
      name: "Store Admin",
      email: "admin@aipos.com",
      passwordHash: adminPassword,
      pinHash: adminPin,
    }
  });

  console.log(`✅ Successfully replaced and updated users:\n1. ${superadmin.username} (${superadmin.email})\n2. ${admin.username} (${admin.email})`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
