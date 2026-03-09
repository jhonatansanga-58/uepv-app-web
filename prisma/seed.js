// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Iniciando seeding...');

  // Limpieza previa (opcional para desarrollo)
  await prisma.attendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studentTutor.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.courseSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.courseParallel.deleteMany();
  await prisma.course.deleteMany();
  await prisma.parallel.deleteMany();
  await prisma.subject.deleteMany();

  // Hash de contraseñas
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Crear administradores
  const admins = await prisma.user.createMany({
    data: [
      { firstName: 'Admin', lastName: 'Principal', userName: 'adm001', email: 'admin@uepv.edu', password: defaultPassword, role: 'ADMIN' },
      { firstName: 'María', lastName: 'González', userName: 'adm002', email: 'maria.admin@uepv.edu', password: defaultPassword, role: 'ADMIN' },
    ],
  });
  console.log('✅ Administradores creados.');

  // Crear profesores
  const teachers = await prisma.user.createMany({
    data: [
      { firstName: 'Ana', lastName: 'López', userName: 'prof001', email: 'ana.lopez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123456', address: 'Av. Principal 123' },
      { firstName: 'Carlos', lastName: 'Pérez', userName: 'prof002', email: 'carlos.perez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123457', address: 'Calle 2da 456' },
      { firstName: 'Laura', lastName: 'Gómez', userName: 'prof003', email: 'laura.gomez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123458', address: 'Zona Norte 789' },
      { firstName: 'Miguel', lastName: 'Rodríguez', userName: 'prof004', email: 'miguel.rodriguez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123459', address: 'Barrio Centro 321' },
      { firstName: 'Sofia', lastName: 'Martínez', userName: 'prof005', email: 'sofia.martinez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123460', address: 'Zona Sur 654' },
    ],
  });
  console.log('✅ Profesores creados.');

  // Crear tutores
  const tutors = await prisma.user.createMany({
    data: [
      { firstName: 'Pedro', lastName: 'Fernández', userName: 'tut001', email: 'pedro.fernandez@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123461', address: 'Av. Libertad 100' },
      { firstName: 'Carmen', lastName: 'Vargas', userName: 'tut002', email: 'carmen.vargas@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123462', address: 'Calle 3ra 200' },
      { firstName: 'Luis', lastName: 'Suárez', userName: 'tut003', email: 'luis.suarez@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123463', address: 'Zona Este 300' },
      { firstName: 'Elena', lastName: 'Torres', userName: 'tut004', email: 'elena.torres@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123464', address: 'Barrio Oeste 400' },
      { firstName: 'Jorge', lastName: 'Jiménez', userName: 'tut005', email: 'jorge.jimenez@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123465', address: 'Av. Central 500' },
    ],
  });
  console.log('✅ Tutores creados.');

  // Crear materias
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Matemáticas' },
      { name: 'Lenguaje y Literatura' },
      { name: 'Ciencias Naturales' },
      { name: 'Ciencias Sociales' },
      { name: 'Educación Física' },
      { name: 'Arte y Cultura' },
      { name: 'Inglés' },
      { name: 'Religión' },
      { name: 'Física' },
      { name: 'Química' },
      { name: 'Biología' },
      { name: 'Historia' },
      { name: 'Geografía' },
      { name: 'Filosofía' },
      { name: 'Informática' },
    ],
  });
  console.log('✅ Materias creadas.');

  // Crear cursos y paralelos
  const courses = await prisma.course.createMany({
    data: [
      { name: '1ro Secundaria', active: true },
      { name: '2do Secundaria', active: true },
      { name: '3ro Secundaria', active: true },
    ],
  });

  const parallels = await prisma.parallel.createMany({
    data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  });

  // Vincular cursos y paralelos
  const courseParallelsData = [];
  for (let courseId = 1; courseId <= 3; courseId++) {
    for (let parallelId = 1; parallelId <= 3; parallelId++) {
      courseParallelsData.push({ 
        courseId, 
        parallelId,
        active: true
      });
    }
  }
  await prisma.courseParallel.createMany({ data: courseParallelsData });
  console.log('✅ Cursos y paralelos creados.');

  // Crear estudiantes
  const students = await prisma.user.createMany({
    data: [
      { firstName: 'Lucía', lastName: 'Fernández', userName: 'stu001', email: 'lucia.fernandez@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Mario', lastName: 'Vargas', userName: 'stu002', email: 'mario.vargas@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Camila', lastName: 'Suárez', userName: 'stu003', email: 'camila.suarez@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Andrés', lastName: 'Torres', userName: 'stu004', email: 'andres.torres@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Valeria', lastName: 'Jiménez', userName: 'stu005', email: 'valeria.jimenez@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Diego', lastName: 'Morales', userName: 'stu006', email: 'diego.morales@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Isabella', lastName: 'Castro', userName: 'stu007', email: 'isabella.castro@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Sebastián', lastName: 'Rojas', userName: 'stu008', email: 'sebastian.rojas@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Natalia', lastName: 'Herrera', userName: 'stu009', email: 'natalia.herrera@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Gabriel', lastName: 'Mendoza', userName: 'stu010', email: 'gabriel.mendoza@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Alejandra', lastName: 'Guerrero', userName: 'stu011', email: 'alejandra.guerrero@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Fernando', lastName: 'Ramos', userName: 'stu012', email: 'fernando.ramos@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Paola', lastName: 'Flores', userName: 'stu013', email: 'paola.flores@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Ricardo', lastName: 'Aguilar', userName: 'stu014', email: 'ricardo.aguilar@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
      { firstName: 'Daniela', lastName: 'Vega', userName: 'stu015', email: 'daniela.vega@student.uepv.edu', password: defaultPassword, role: 'STUDENT' },
    ],
  });
  
  const studentRecords = await prisma.user.findMany({ where: { role: 'STUDENT' } });

  // Crear registros de estudiantes
  const studentProfiles = await prisma.student.createMany({
    data: [
      { id: studentRecords[0].id, cardCode: 'STU001', courseParallelId: 1, birthDate: new Date('2008-03-15'), gender: 'FEMALE' },
      { id: studentRecords[1].id, cardCode: 'STU002', courseParallelId: 1, birthDate: new Date('2008-07-22'), gender: 'MALE' },
      { id: studentRecords[2].id, cardCode: 'STU003', courseParallelId: 2, birthDate: new Date('2008-01-10'), gender: 'FEMALE' },
      { id: studentRecords[3].id, cardCode: 'STU004', courseParallelId: 2, birthDate: new Date('2008-11-05'), gender: 'MALE' },
      { id: studentRecords[4].id, cardCode: 'STU005', courseParallelId: 3, birthDate: new Date('2008-09-18'), gender: 'FEMALE' },
      { id: studentRecords[5].id, cardCode: 'STU006', courseParallelId: 3, birthDate: new Date('2008-04-12'), gender: 'MALE' },
      { id: studentRecords[6].id, cardCode: 'STU007', courseParallelId: 4, birthDate: new Date('2008-08-30'), gender: 'FEMALE' },
      { id: studentRecords[7].id, cardCode: 'STU008', courseParallelId: 4, birthDate: new Date('2008-12-14'), gender: 'MALE' },
      { id: studentRecords[8].id, cardCode: 'STU009', courseParallelId: 5, birthDate: new Date('2008-06-25'), gender: 'FEMALE' },
      { id: studentRecords[9].id, cardCode: 'STU010', courseParallelId: 5, birthDate: new Date('2008-02-08'), gender: 'MALE' },
      { id: studentRecords[10].id, cardCode: 'STU011', courseParallelId: 6, birthDate: new Date('2008-10-03'), gender: 'FEMALE' },
      { id: studentRecords[11].id, cardCode: 'STU012', courseParallelId: 6, birthDate: new Date('2008-05-17'), gender: 'MALE' },
      { id: studentRecords[12].id, cardCode: 'STU013', courseParallelId: 7, birthDate: new Date('2008-09-28'), gender: 'FEMALE' },
      { id: studentRecords[13].id, cardCode: 'STU014', courseParallelId: 7, birthDate: new Date('2008-03-21'), gender: 'MALE' },
      { id: studentRecords[14].id, cardCode: 'STU015', courseParallelId: 8, birthDate: new Date('2008-07-11'), gender: 'FEMALE' },
    ],
  });
  console.log('✅ Estudiantes creados.');

  // Asignar materias a profesores
  const teacherRecords = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  const subjectRecords = await prisma.subject.findMany();

  const teacherSubjectAssignments = [
    { teacherId: teacherRecords[0].id, subjectId: subjectRecords[0].id }, // Ana - Matemáticas
    { teacherId: teacherRecords[0].id, subjectId: subjectRecords[8].id }, // Ana - Física
    { teacherId: teacherRecords[1].id, subjectId: subjectRecords[1].id }, // Carlos - Lenguaje
    { teacherId: teacherRecords[1].id, subjectId: subjectRecords[6].id }, // Carlos - Inglés
    { teacherId: teacherRecords[2].id, subjectId: subjectRecords[2].id }, // Laura - Ciencias Naturales
    { teacherId: teacherRecords[2].id, subjectId: subjectRecords[10].id }, // Laura - Biología
    { teacherId: teacherRecords[3].id, subjectId: subjectRecords[3].id }, // Miguel - Ciencias Sociales
    { teacherId: teacherRecords[3].id, subjectId: subjectRecords[11].id }, // Miguel - Historia
    { teacherId: teacherRecords[4].id, subjectId: subjectRecords[4].id }, // Sofia - Educación Física
    { teacherId: teacherRecords[4].id, subjectId: subjectRecords[5].id }, // Sofia - Arte
  ];

  await prisma.teacherSubject.createMany({ data: teacherSubjectAssignments });
  console.log('✅ Materias asignadas a profesores.');

  // Asignar estudiantes a tutores (usando el nuevo modelo StudentTutor)
  const tutorRecords = await prisma.user.findMany({ where: { role: 'TUTOR' } });
  
  const studentTutorAssignments = [
    { studentId: studentRecords[0].id, tutorId: tutorRecords[0].id }, // Lucía - Pedro
    { studentId: studentRecords[1].id, tutorId: tutorRecords[0].id }, // Mario - Pedro
    { studentId: studentRecords[2].id, tutorId: tutorRecords[1].id }, // Camila - Carmen
    { studentId: studentRecords[3].id, tutorId: tutorRecords[1].id }, // Andrés - Carmen
    { studentId: studentRecords[4].id, tutorId: tutorRecords[2].id }, // Valeria - Luis
    { studentId: studentRecords[5].id, tutorId: tutorRecords[2].id }, // Diego - Luis
    { studentId: studentRecords[6].id, tutorId: tutorRecords[3].id }, // Isabella - Elena
    { studentId: studentRecords[7].id, tutorId: tutorRecords[3].id }, // Sebastián - Elena
    { studentId: studentRecords[8].id, tutorId: tutorRecords[4].id }, // Natalia - Jorge
    { studentId: studentRecords[9].id, tutorId: tutorRecords[4].id }, // Gabriel - Jorge
    { studentId: studentRecords[10].id, tutorId: tutorRecords[0].id }, // Alejandra - Pedro
    { studentId: studentRecords[11].id, tutorId: tutorRecords[1].id }, // Fernando - Carmen
    { studentId: studentRecords[12].id, tutorId: tutorRecords[2].id }, // Paola - Luis
    { studentId: studentRecords[13].id, tutorId: tutorRecords[3].id }, // Ricardo - Elena
    { studentId: studentRecords[14].id, tutorId: tutorRecords[4].id }, // Daniela - Jorge
  ];

  await prisma.studentTutor.createMany({ data: studentTutorAssignments });
  console.log('✅ Estudiantes asignados a tutores.');

  // Asignar materias a cursos
  const courseRecords = await prisma.course.findMany();
  const courseSubjectAssignments = [];
  
  // Asignar todas las materias a todos los cursos
  for (const course of courseRecords) {
    for (const subject of subjectRecords) {
      courseSubjectAssignments.push({
        courseId: course.id,
        subjectId: subject.id
      });
    }
  }

  await prisma.courseSubject.createMany({ data: courseSubjectAssignments });
  console.log('✅ Materias asignadas a cursos.');

  console.log('🎉 Seeding completado con éxito.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    return prisma.$disconnect();
  });
