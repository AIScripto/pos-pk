import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (user.email.startsWith('superadmin@') || user.email.startsWith('admin@')) {
      const newEmail = user.email.split('@')[0]; // Extract just "superadmin" or "admin"
      console.log(`Updating ${user.email} -> ${newEmail}`);
      
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: newEmail }
        });
        console.log(`✅ Successfully updated ${user.email}`);
      } catch (err: any) {
        console.error(`❌ Failed to update ${user.email}:`, err.message);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
