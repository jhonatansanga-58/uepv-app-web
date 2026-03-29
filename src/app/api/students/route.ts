import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = parseInt(searchParams.get("courseId") || "");
  const parallelId = parseInt(searchParams.get("parallelId") || "");

  if (isNaN(courseId) || isNaN(parallelId)) {
    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 }
    );
  }

  try {
    const courseParallel = await prisma.courseParallel.findFirst({
      where: {
        courseId,
        parallelId: parallelId,
      },
      select: {
        id: true,
      },
    });

    if (!courseParallel) {
      return NextResponse.json({ students: [] });
    }

    const students = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            courseParallelId: courseParallel.id,
            academicYear: {
              active: true,
            },
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            active: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: "asc",
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error loading students:", error);
    return NextResponse.json(
      { error: "Error al cargar estudiantes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      birthDate,
      gender,
      courseId,
      parallelId,
      tutorId,
    } = body;
    // Removimos dependencias de cardCode del controlador tal y como se eliminó de Prisma

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !courseId ||
      !parallelId
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Usaremos un transaction para asegurar atomicidad
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener la Gestión Académica Activa
      const activeYear = await tx.academicYear.findFirst({
        where: { active: true },
      });

      if (!activeYear) {
        throw new Error("No hay una gestión académica activa");
      }

      // 2. Obtener el CourseParallel
      const courseParallel = await tx.courseParallel.findFirst({
        where: {
          courseId: parseInt(courseId),
          parallelId: parseInt(parallelId),
        },
      });

      if (!courseParallel) {
        throw new Error("Curso y paralelo no válidos");
      }

      // 3. Generar un userName basado en firstName y lastName en lugar del email
      const generateRandomSuffix = () => Math.floor(10000 + Math.random() * 90000);
      const generatedUserName =
        (firstName ? firstName.substring(0, 1).toLowerCase() : "") +
        (lastName ? lastName.substring(0, 3).toLowerCase() : "") +
        generateRandomSuffix();

      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password, // si estás usando bcrypt, recordá hashearlo antes
          phone: phone || null,
          address: address || null,
          role: "STUDENT",
          userName: generatedUserName,
        },
      });

      // 4. Crear el perfil de estudiante (sin fingerprint de momento)
      const newStudent = await tx.student.create({
        data: {
          id: newUser.id,
          birthDate: birthDate ? new Date(`${birthDate}T12:00:00Z`) : null,
          gender: gender || null,
          fingerprint: null,
        },
      });

      // 5. Crear la matrícula en Enrollment
      await tx.enrollment.create({
        data: {
          studentId: newStudent.id,
          courseParallelId: courseParallel.id,
          academicYearId: activeYear.id,
        },
      });

      // 6. Si se proporcionó un tutorId, crear la relación en StudentTutor
      if (tutorId && !isNaN(parseInt(tutorId))) {
        await tx.studentTutor.create({
          data: {
            studentId: newStudent.id,
            tutorId: parseInt(tutorId),
          },
        });
      }

      // Retornar la data estructurada del estudiante creado
      const createdStudent = await tx.student.findUnique({
        where: { id: newStudent.id },
        include: {
          user: true,
          enrollments: {
            include: {
              courseParallel: {
                include: {
                  course: true,
                  parallel: true,
                },
              },
            },
          },
        },
      });

      return createdStudent;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/students]", error);
    
    if (error instanceof Error && (error.message === "No hay una gestión académica activa" || error.message === "Curso y paralelo no válidos")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error al crear el estudiante" },
      { status: 500 }
    );
  }
}
