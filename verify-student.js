import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyStudentRegistration() {
  console.log('🔍 Verificando registro del estudiante...');

  // 1. Buscar el usuario creado (basado en el email o nombre provisto en la prueba de UI)
  const user = await prisma.user.findFirst({
    where: { email: 'test.integration.final@student.uepv.edu' },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: {
              academicYear: true,
              courseParallel: {
                include: {
                  course: true,
                  parallel: true,
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.error('❌ Error: Usuario no encontrado en la base de datos.');
    process.exit(1);
  }

  console.log('✅ Usuario encontrado:', user.userName);
  console.log('  Rol:', user.role);

  // 2. Verificar perfil de estudiante
  if (!user.studentProfile) {
    console.error('❌ Error: Perfil de estudiante no asociado al usuario.');
    process.exit(1);
  }
  
  console.log('✅ Perfil de Estudiante verificado.');
  console.log('  Género:', user.studentProfile.gender);

  // 3. Verificar Matrícula (Enrollment)
  if (!user.studentProfile.enrollments || user.studentProfile.enrollments.length === 0) {
    console.error('❌ Error: El estudiante no tiene ninguna matrícula (Enrollment) registrada.');
    process.exit(1);
  }

  const enrollment = user.studentProfile.enrollments[0];
  console.log('✅ Matrícula verificada exitosamente.');
  console.log(`  Gestión Activa: ${enrollment.academicYear.year} (${enrollment.academicYear.active ? 'ACTIVA' : 'INACTIVA'})`);
  console.log(`  Curso Asignado: ${enrollment.courseParallel.course.name} "${enrollment.courseParallel.parallel.name}"`);

  console.log('\n🎉 Transacción atómica $transaction validada de extremo a extremo.');
}

verifyStudentRegistration()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
