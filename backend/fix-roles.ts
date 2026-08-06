import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Find the intended organization. Let's just update all superadmin users.
  const users = await prisma.user.findMany({ where: { email: 'superadmin@aipos.com' } });
  
  if (users.length === 0) {
    console.log("No superadmin@aipos.com found!");
    return;
  }

  for (const user of users) {
    // Find the admin role for this user's organization
    const adminRole = await prisma.role.findFirst({
      where: { orgId: user.orgId, tag: 'admin' }
    });

    if (adminRole) {
      await prisma.userRoleAssignment.upsert({
        where: { userId_roleId_scopeId: { userId: user.id, roleId: adminRole.id, scopeId: user.orgId.toString() } },
        update: {},
        create: {
          userId: user.id,
          roleId: adminRole.id,
          scopeType: 'organisation',
          scopeId: user.orgId.toString(),
          createdBy: 'system'
        }
      });
      console.log(`Assigned admin role to user ${user.email} in org ${user.orgId}`);
    } else {
      console.log(`No admin role found in org ${user.orgId}`);
    }
    
    // Also, let's explicitly update the password just to be 100% sure.
    const passwordHash = await bcrypt.hash("@!786Allahis1!#", 10);
    const pinHash = await bcrypt.hash("7860", 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, pinHash, isActive: true }
    });
    console.log(`Updated password for user ${user.email} in org ${user.orgId}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
