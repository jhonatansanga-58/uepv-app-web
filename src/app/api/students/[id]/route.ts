import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: { id: string } }) {
  const studentId = parseInt(context.params.id, 10);

  if (isNaN(studentId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        courseParallel: {
          include: {
            course: true,
            parallel: true,
          },
        },
        tutor: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("[GET /api/students/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = parseInt(context.params.id, 10);
  const data = await req.json();

  try {
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        birthDate: data.birthDate ? new Date(`${data.birthDate}T12:00:00Z`) : null,
        gender: data.gender || null,
        cardCode: data.cardCode,
        user: {
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            address: data.address || null,
          },
        },
      },
      include: {
        user: true,
        courseParallel: {
          include: {
            course: true,
            parallel: true,
          },
        },
        tutor: true,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el estudiante" },
      { status: 500 }
    );
  }
}
