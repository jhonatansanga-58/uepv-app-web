// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Iniciando seeding...');

  // Limpieza previa (opcional para desarrollo)
  await prisma.attendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.courseParallel.deleteMany();
  await prisma.course.deleteMany();
  await prisma.parallel.deleteMany();

  // Hash de contraseñas
  const [hashedTutor1, hashedTutor2, hashedTutor3] = await Promise.all([
    bcrypt.hash('tutor123', 10),
    bcrypt.hash('tutor456', 10),
    bcrypt.hash('tutor789', 10),
  ]);

  const [hashedStu1, hashedStu2, hashedStu3, hashedStu4, hashedStu5] = await Promise.all([
    bcrypt.hash('student123', 10),
    bcrypt.hash('student456', 10),
    bcrypt.hash('student789', 10),
    bcrypt.hash('student321', 10),
    bcrypt.hash('student654', 10),
  ]);

  // Crear tutores
  const tutors = await prisma.user.createMany({
    data: [
      { firstName: 'Ana', lastName: 'López', email: 'ana@email.com', password: hashedTutor1, role: 'TUTOR' },
      { firstName: 'Carlos', lastName: 'Pérez', email: 'carlos@email.com', password: hashedTutor2, role: 'TUTOR' },
      { firstName: 'Laura', lastName: 'Gómez', email: 'laura@email.com', password: hashedTutor3, role: 'TUTOR' },
    ],
  });
  if (tutors.count !== 3)
    console.log('✅ Tutores creados.');

  // Crear cursos y paralelos
  const courses = await prisma.course.createMany({
    data: [
      { name: '1ro Secundaria' },
      { name: '2do Secundaria' },
      { name: '3ro Secundaria' },
    ],
  });

  const parallels = await prisma.parallel.createMany({
    data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  });

  // Vincular cursos y paralelos
  const courseParallelsData = [];
  for (let courseId = 1; courseId <= 3; courseId++) {
    for (let parallelId = 1; parallelId <= 3; parallelId++) {
      courseParallelsData.push({ courseId, parallelId });
    }
  }
  if (courses.count > 0 && parallels.count > 0) {
    await prisma.courseParallel.createMany({ data: courseParallelsData });
    console.log('✅ Cursos y paralelos creados.');
  }
  // Crear estudiantes
  const students = await prisma.user.createMany({
    data: [
      { firstName: 'Lucía', lastName: 'Fernández', email: 'lucia@email.com', password: hashedStu1, role: 'STUDENT' },
      { firstName: 'Mario', lastName: 'Vargas', email: 'mario@email.com', password: hashedStu2, role: 'STUDENT' },
      { firstName: 'Camila', lastName: 'Suárez', email: 'camila@email.com', password: hashedStu3, role: 'STUDENT' },
      { firstName: 'Andrés', lastName: 'Torres', email: 'andres@email.com', password: hashedStu4, role: 'STUDENT' },
      { firstName: 'Valeria', lastName: 'Jiménez', email: 'valeria@email.com', password: hashedStu5, role: 'STUDENT' },
    ],
  });
  
  const studentRecords = await prisma.user.findMany({ where: { role: 'STUDENT' } });

  await prisma.student.createMany({
    data: [
      { id: studentRecords[0].id, cardCode: 'STU001', courseParallelId: 1, tutorId: 1 },
      { id: studentRecords[1].id, cardCode: 'STU002', courseParallelId: 2, tutorId: 1 },
      { id: studentRecords[2].id, cardCode: 'STU003', courseParallelId: 3, tutorId: 2 },
      { id: studentRecords[3].id, cardCode: 'STU004', courseParallelId: 4, tutorId: 2 },
      { id: studentRecords[4].id, cardCode: 'STU005', courseParallelId: 5, tutorId: 3 },
    ],
  });
  if (students.count !== 5)
    console.log('✅ Estudiantes creados.');

  console.log('🎉 Seeding completado con éxito.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    return prisma.$disconnect();
  });
