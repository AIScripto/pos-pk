import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (user.email === 'superadmin') {
      const newEmail = 'superadmin@aipos.com';
      console.log(`Reverting ${user.email} -> ${newEmail}`);
      await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    }
    else if (user.email === 'admin') {
      const newEmail = 'admin@aipos.com';
      console.log(`Reverting ${user.email} -> ${newEmail}`);
      await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
