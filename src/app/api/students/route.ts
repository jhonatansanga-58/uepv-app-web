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
        courseParallelId: courseParallel.id,
      },
      select: {
        id: true,
        cardCode: true,
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
      cardCode,
      courseId,
      parallelId,
      tutorId,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !cardCode ||
      !courseId ||
      !parallelId
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // 1. Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password, // si estás usando bcrypt, recordá hashearlo antes
        phone: phone || null,
        address: address || null,
        role: "STUDENT",
      },
    });

    // 2. Obtener el CourseParallel
    console.log("courseId:", courseId, "parallelId:", parallelId, "tutorId:", tutorId);
    const courseParallel = await prisma.courseParallel.findFirst({
      where: {
        courseId: parseInt(body.courseId),
        parallelId: parseInt(body.parallelId),
      },
    });

    if (!courseParallel) {
      return NextResponse.json(
        { error: "Curso y paralelo no válidos" },
        { status: 400 }
      );
    }

    // 3. Crear el perfil de estudiante (sin tutorId, usaremos StudentTutor)
    const newStudent = await prisma.student.create({
      data: {
        id: newUser.id,
        birthDate: birthDate ? new Date(`${birthDate}T12:00:00Z`) : null,
        gender: gender || null,
        cardCode,
        courseParallelId: courseParallel.id,
      },
      include: {
        user: true,
        courseParallel: {
          include: {
            course: true,
            parallel: true,
          },
        },
      },
    });

    // 4. Si se proporcionó un tutorId, crear la relación en StudentTutor
    if (body.tutorId && !isNaN(parseInt(body.tutorId))) {
      await (prisma as any).studentTutor.create({
        data: {
          studentId: newStudent.id,
          tutorId: parseInt(body.tutorId),
        },
      });
    }

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("[POST /api/students]", error);
    return NextResponse.json(
      { error: "Error al crear el estudiante" },
      { status: 500 }
    );
  }
}
