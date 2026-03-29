// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Iniciando seeding exhaustivo...');

  // Limpieza previa profunda
  await prisma.attendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studentTutor.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.courseSubject.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.courseParallel.deleteMany();
  await prisma.course.deleteMany();
  await prisma.parallel.deleteMany();
  await prisma.subject.deleteMany();

  // Hash de contraseñas
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Crear Año Académico Activo
  const activeYear = await prisma.academicYear.create({
    data: {
      year: 2024,
      active: true,
      startDate: new Date('2024-02-01T00:00:00Z'),
      endDate: new Date('2024-11-30T23:59:59Z'),
    },
  });
  console.log('✅ Año Académico Creado.');

  // 2. Crear administradores
  await prisma.user.createMany({
    data: [
      { firstName: 'Admin', lastName: 'Principal', userName: 'adm001', email: 'admin@uepv.edu', password: defaultPassword, role: 'ADMIN' },
      { firstName: 'María', lastName: 'González', userName: 'adm002', email: 'maria.admin@uepv.edu', password: defaultPassword, role: 'ADMIN' },
    ],
  });
  const adminRecords = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log('✅ Administradores creados.');

  // 3. Crear profesores
  await prisma.user.createMany({
    data: [
      { firstName: 'Ana', lastName: 'López', userName: 'prof001', email: 'ana.lopez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123456', address: 'Av. Principal 123' },
      { firstName: 'Carlos', lastName: 'Pérez', userName: 'prof002', email: 'carlos.perez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123457', address: 'Calle 2da 456' },
      { firstName: 'Laura', lastName: 'Gómez', userName: 'prof003', email: 'laura.gomez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123458', address: 'Zona Norte 789' },
      { firstName: 'Miguel', lastName: 'Rodríguez', userName: 'prof004', email: 'miguel.rodriguez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123459', address: 'Barrio Centro 321' },
      { firstName: 'Sofia', lastName: 'Martínez', userName: 'prof005', email: 'sofia.martinez@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123460', address: 'Zona Sur 654' },
      { firstName: 'Rubén', lastName: 'Darío', userName: 'prof006', email: 'ruben.dario@uepv.edu', password: defaultPassword, role: 'TEACHER', phone: '70123461', address: 'Calle Las Lomas' },
    ],
  });
  const teacherRecords = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  console.log('✅ Profesores creados.');

  // 4. Crear tutores
  await prisma.user.createMany({
    data: [
      { firstName: 'Pedro', lastName: 'Fernández', userName: 'tut001', email: 'pedro.fernandez@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123461', address: 'Av. Libertad 100' },
      { firstName: 'Carmen', lastName: 'Vargas', userName: 'tut002', email: 'carmen.vargas@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123462', address: 'Calle 3ra 200' },
      { firstName: 'Luis', lastName: 'Suárez', userName: 'tut003', email: 'luis.suarez@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123463', address: 'Zona Este 300' },
      { firstName: 'Elena', lastName: 'Torres', userName: 'tut004', email: 'elena.torres@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123464', address: 'Barrio Oeste 400' },
      { firstName: 'Jorge', lastName: 'Jiménez', userName: 'tut005', email: 'jorge.jimenez@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123465', address: 'Av. Central 500' },
      { firstName: 'Marta', lastName: 'Díaz', userName: 'tut006', email: 'marta.diaz@email.com', password: defaultPassword, role: 'TUTOR', phone: '70123466', address: 'Av. Las Palmas' },
    ],
  });
  const tutorRecords = await prisma.user.findMany({ where: { role: 'TUTOR' } });
  console.log('✅ Tutores creados.');

  // 5. Crear materias
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Matemáticas' }, { name: 'Lenguaje y Literatura' }, { name: 'Ciencias Naturales' },
      { name: 'Ciencias Sociales' }, { name: 'Educación Física' }, { name: 'Arte y Cultura' },
      { name: 'Inglés' }, { name: 'Religión' }, { name: 'Física' }, { name: 'Química' },
      { name: 'Biología' }, { name: 'Historia' }, { name: 'Geografía' }, { name: 'Filosofía' },
      { name: 'Informática' },
    ],
  });
  const subjectRecords = await prisma.subject.findMany();
  console.log('✅ Materias creadas.');

  // 6. Crear cursos y paralelos
  await prisma.course.createMany({
    data: [
      { name: '1ro Secundaria', active: true },
      { name: '2do Secundaria', active: true },
      { name: '3ro Secundaria', active: true },
      { name: '4to Secundaria', active: true },
      { name: '5to Secundaria', active: true },
      { name: '6to Secundaria', active: true },
    ],
  });
  await prisma.parallel.createMany({
    data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  });
  
  // Vincular cursos y paralelos
  const courseParallelsData = [];
  for (let courseId = 1; courseId <= 6; courseId++) {
    for (let parallelId = 1; parallelId <= 3; parallelId++) {
      courseParallelsData.push({ courseId, parallelId, active: true });
    }
  }
  await prisma.courseParallel.createMany({ data: courseParallelsData });
  const courseParallelRecords = await prisma.courseParallel.findMany();
  console.log('✅ Cursos y paralelos vinculados.');

  // 7. Crear estudiantes (Usuario + Perfil Estudiante)
  const studentDataList = [
      { firstName: 'Lucía', lastName: 'Fernández', userName: 'stu001', email: 'lucia.fernandez@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Mario', lastName: 'Vargas', userName: 'stu002', email: 'mario.vargas@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Camila', lastName: 'Suárez', userName: 'stu003', email: 'camila.suarez@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Andrés', lastName: 'Torres', userName: 'stu004', email: 'andres.torres@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Valeria', lastName: 'Jiménez', userName: 'stu005', email: 'valeria.jimenez@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Diego', lastName: 'Morales', userName: 'stu006', email: 'diego.morales@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Isabella', lastName: 'Castro', userName: 'stu007', email: 'isabella.castro@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Sebastián', lastName: 'Rojas', userName: 'stu008', email: 'sebastian.rojas@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Natalia', lastName: 'Herrera', userName: 'stu009', email: 'natalia.herrera@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Gabriel', lastName: 'Mendoza', userName: 'stu010', email: 'gabriel.mendoza@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Alejandra', lastName: 'Guerrero', userName: 'stu011', email: 'alejandra.guerrero@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Fernando', lastName: 'Ramos', userName: 'stu012', email: 'fernando.ramos@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Paola', lastName: 'Flores', userName: 'stu013', email: 'paola.flores@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Ricardo', lastName: 'Aguilar', userName: 'stu014', email: 'ricardo.aguilar@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Daniela', lastName: 'Vega', userName: 'stu015', email: 'daniela.vega@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Joaquin', lastName: 'Molina', userName: 'stu016', email: 'joaquin.molina@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Lorena', lastName: 'Peña', userName: 'stu017', email: 'lorena.pena@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Hugo', lastName: 'Silva', userName: 'stu018', email: 'hugo.silva@student.uepv.edu', gender: 'MALE' },
      { firstName: 'Patricia', lastName: 'Cruz', userName: 'stu019', email: 'patricia.cruz@student.uepv.edu', gender: 'FEMALE' },
      { firstName: 'Esteban', lastName: 'Soto', userName: 'stu020', email: 'esteban.soto@student.uepv.edu', gender: 'MALE' },
  ];

  for (const s of studentDataList) {
    const user = await prisma.user.create({
      data: {
        firstName: s.firstName, lastName: s.lastName, userName: s.userName, email: s.email, password: defaultPassword, role: 'STUDENT'
      }
    });

    await prisma.student.create({
      data: {
        id: user.id,
        birthDate: new Date(`2008-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`),
        gender: s.gender,
      }
    });
  }
  const studentRecords = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  console.log('✅ Estudiantes (Usuario + Perfil) creados (N='+studentRecords.length+').');

  // 8. Crear Matrículas (Enrollments)
  // Distribuirlos equitativamente a lo largo de los CourseParallels
  const enrollmentsData = [];
  studentRecords.forEach((student, idx) => {
    // Un simple round robin assignment
    const assignedCpId = courseParallelRecords[idx % courseParallelRecords.length].id;
    enrollmentsData.push({
      studentId: student.id,
      courseParallelId: assignedCpId,
      academicYearId: activeYear.id,
    });
  });
  await prisma.enrollment.createMany({ data: enrollmentsData });
  console.log('✅ Matrículas (Enrollments) creadas masivamente.');

  // 9. Asignar Materias a Profesores (TeacherSubject)
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
    { teacherId: teacherRecords[5].id, subjectId: subjectRecords[14].id }, // Ruben - Informática
  ];
  await prisma.teacherSubject.createMany({ data: teacherSubjectAssignments });
  console.log('✅ Materias asignadas a profesores.');

  // 10. Asignar Estudiantes a Tutores (StudentTutor)
  const studentTutorAssignments = [];
  studentRecords.forEach((s, idx) => {
      const tutorAssignedId = tutorRecords[idx % tutorRecords.length].id;
      studentTutorAssignments.push({ studentId: s.id, tutorId: tutorAssignedId });
  });
  await prisma.studentTutor.createMany({ data: studentTutorAssignments });
  console.log('✅ Estudiantes asignados a tutores uniformemente.');

  // 11. Asignar materias a cursos (CourseSubject)
  const courseRecords = await prisma.course.findMany();
  const courseSubjectAssignments = [];
  for (const course of courseRecords) {
    for (const subject of subjectRecords) {
      courseSubjectAssignments.push({ courseId: course.id, subjectId: subject.id });
    }
  }
  await prisma.courseSubject.createMany({ data: courseSubjectAssignments });
  console.log('✅ Materias asignadas a cursos en todas sus iteraciones.');

  // ============================================
  // GENERACIÓN DE DATOS OPERATIVOS (Mock Data)
  // ============================================

  // 12. Asistencias (Random Attendance)
  const attendanceData = [];
  studentRecords.forEach((student) => {
    // 3 faltas o retrasos dispersos
    attendanceData.push({ studentId: student.id, date: new Date(Date.now() - Math.random()*10000000000), userId: teacherRecords[0].id });
    attendanceData.push({ studentId: student.id, date: new Date(Date.now() - Math.random()*10000000000), userId: teacherRecords[1].id });
  });
  await prisma.attendance.createMany({ data: attendanceData });
  console.log('✅ Registros de Asistencia Masivos generados.');

  // 13. Tareas Genéricas (Tasks)
  const taskData = [];
  courseParallelRecords.forEach((cp, idx) => {
    if (idx % 2 === 0) {
      taskData.push({
        title: `Práctica Evaluada N${idx}`,
        description: 'Resolver los ejercicios dados en clases. Subir pdf.',
        dueDate: new Date(Date.now() + 86400000 * 5), // + 5 días
        courseParallelId: cp.id,
        subjectId: subjectRecords[0].id,
      });
      taskData.push({
        title: `Investigación Teórica`,
        description: 'Ensayo manuscrito sobre la cultura Tiahuanaco, 10 páginas.',
        dueDate: new Date(Date.now() + 86400000 * 7), // + 7 días
        courseParallelId: cp.id,
        subjectId: subjectRecords[3].id,
      });
    }
  });
  await prisma.task.createMany({ data: taskData });
  console.log('✅ Registros de Tareas simuladas (Tasks) creadas.');

  // 14. Solicitudes de Permiso (LeaveRequest)
  const leaveRequestsData = [];
  for (let i = 0; i < 6; i++) {
    const sId = studentRecords[i].id;
    const tId = tutorRecords[i % tutorRecords.length].id;
    leaveRequestsData.push({
      studentId: sId,
      tutorId: tId,
      reason: 'Motivos de salud.',
      status: i % 2 === 0 ? 'PENDING' : 'APPROVED',
      message: 'Se adjunta certificado médico visado en plataforma.',
      title: 'Permiso médico de 48h',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 2),
    });
  }
  await prisma.leaveRequest.createMany({ data: leaveRequestsData });
  console.log('✅ Solicitudes de permisos generadas (LeaveRequests).');

  // 15. Notificaciones (Notifications)
  const notificationsData = [
    { title: 'Reunión Escolar General', message: 'Se exhorta a todos los tutores a la asamblea del viernes.', creatorId: adminRecords[0].id },
    { title: 'Suspensión de clases', message: 'Por el feriado, se decreta que no habrá actividad áulica este lunes.', creatorId: adminRecords[0].id },
    { title: 'Kermesse Institucional', message: 'Participe del festival anual del colegio este sabado.', creatorId: adminRecords[1].id, courseParallelId: courseParallelRecords[0].id },
  ];
  await prisma.notification.createMany({ data: notificationsData });
  console.log('✅ Comunicados y Notificaciones masivas inyectadas.');

  // 16. Reuniones (Meetings)
  const meetingsData = [];
  for (let i = 0; i < 4; i++) {
    meetingsData.push({
      studentId: studentRecords[i].id,
      userId: teacherRecords[i % teacherRecords.length].id,
      message: 'Citación para evaluación de conducta. Asistencia obligatoria.',
      topic: 'Reunión Ordinaria Disciplinaria',
      date: new Date(Date.now() + 86400000), 
    });
  }
  await prisma.meeting.createMany({ data: meetingsData });
  console.log('✅ Reuniones / Citaciones agregadas (Meetings).');

  console.log('🎉 Seeding Exhaustivo Completado con Éxito.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    return prisma.$disconnect();
  });
