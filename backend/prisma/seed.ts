// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiar BD
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Crear organización
  const org = await prisma.organization.create({
    data: {
      name: 'Acme',
    },
  });

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: hashedPassword,
      name: 'Admin User',
      organizationId: org.id,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'member1@acme.com',
      password: hashedPassword,
      name: 'Member One',
      organizationId: org.id,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'member2@acme.com',
      password: hashedPassword,
      name: 'Member Two',
      organizationId: org.id,
    },
  });

  const users = [admin, member1, member2];
  const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  const priorities = ['LOW', 'MED', 'HIGH'];
  const labelOptions = ['bug', 'feature', 'urgent', 'documentation', 'enhancement'];

  // Crear 30 issues
  for (let i = 1; i <= 30; i++) {
    const randomAssignee = users[Math.floor(Math.random() * users.length)];
    const randomCreator = users[Math.floor(Math.random() * users.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const numLabels = Math.floor(Math.random() * 3);
    const labels = Array.from({ length: numLabels }, () => 
      labelOptions[Math.floor(Math.random() * labelOptions.length)]
    );

    const issue = await prisma.issue.create({
      data: {
        title: `Issue #${i}: ${getRandomTitle()}`,
        description: `Description for issue ${i}. This is a sample markdown content.\n\n**Bold text** and *italic text*.`,
        status: randomStatus as any,
        priority: randomPriority as any,
        labels: [...new Set(labels)],
        assigneeId: Math.random() > 0.2 ? randomAssignee.id : null,
        creatorId: randomCreator.id,
        orgId: org.id,
      },
    });

    // Crear 0-3 comentarios por issue
    const numComments = Math.floor(Math.random() * 4);
    for (let j = 0; j < numComments; j++) {
      await prisma.comment.create({
        data: {
          content: `Comment ${j + 1} on issue ${i}`,
          issueId: issue.id,
          authorId: users[Math.floor(Math.random() * users.length)].id,
        },
      });
    }
  }

  console.log('✅ Seed completado');
  console.log('📧 Usuarios creados:');
  console.log('   admin@acme.com / password123');
  console.log('   member1@acme.com / password123');
  console.log('   member2@acme.com / password123');
}

function getRandomTitle(): string {
  const titles = [
    'Fix login bug',
    'Add dark mode',
    'Improve performance',
    'Update documentation',
    'Refactor API',
    'Add unit tests',
    'Fix UI alignment',
    'Implement search',
    'Add export feature',
    'Optimize database queries',
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });