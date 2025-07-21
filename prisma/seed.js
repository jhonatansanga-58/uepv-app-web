// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash de contraseñas
  const hashedPw1 = await bcrypt.hash('tutor123', 10);
  const hashedPw2 = await bcrypt.hash('tutor456', 10);
  const hashedPw3 = await bcrypt.hash('student123', 10);
  const hashedPw4 = await bcrypt.hash('student456', 10);

  // Tutores
  await prisma.user.createMany({
    data: [
      {
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@email.com',
        password: hashedPw1,
        role: 'TUTOR',
      },
      {
        firstName: 'Carlos',
        lastName: 'Pérez',
        email: 'carlos@email.com',
        password: hashedPw2,
        role: 'TUTOR',
      },
    ],
  });

  // Cursos
  await prisma.course.createMany({
    data: [
      { name: '1ro Secundaria' },
      { name: '2do Secundaria' },
      { name: '3ro Secundaria' },
    ],
  });

  // Paralelos
  await prisma.parallel.createMany({
    data: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
    ],
  });

  // CourseParallel
  await prisma.courseParallel.createMany({
    data: [
      { courseId: 1, parallelId: 1 },
      { courseId: 1, parallelId: 2 },
      { courseId: 1, parallelId: 3 },
      { courseId: 2, parallelId: 1 },
      { courseId: 2, parallelId: 2 },
      { courseId: 2, parallelId: 3 },
      { courseId: 3, parallelId: 1 },
      { courseId: 3, parallelId: 2 },
      { courseId: 3, parallelId: 3 },
    ],
  });

  // Estudiantes (con Users primero)
  await prisma.user.createMany({
    data: [
      {
        id: 101,
        firstName: 'Lucía',
        lastName: 'Fernández',
        email: 'lucia@email.com',
        password: hashedPw3,
        role: 'STUDENT',
      },
      {
        id: 102,
        firstName: 'Mario',
        lastName: 'Vargas',
        email: 'mario@email.com',
        password: hashedPw4,
        role: 'STUDENT',
      },
    ],
  });

  await prisma.student.createMany({
    data: [
      {
        id: 101,
        cardCode: 'STU001',
        courseParallelId: 1, // 1ro A
        tutorId: 1,
      },
      {
        id: 102,
        cardCode: 'STU002',
        courseParallelId: 2, // 1ro B
        tutorId: 2,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('Seeding completado.');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
