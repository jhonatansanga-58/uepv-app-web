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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userUpdateData: any = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentUpdateData: any = {};

    if ("firstName" in data) userUpdateData.firstName = data.firstName;
    if ("lastName" in data) userUpdateData.lastName = data.lastName;
    if ("email" in data) userUpdateData.email = data.email;
    if ("phone" in data) userUpdateData.phone = data.phone || null;
    if ("address" in data) userUpdateData.address = data.address || null;
    if ("active" in data) userUpdateData.active = data.active;

    if ("birthDate" in data)
      studentUpdateData.birthDate = data.birthDate
        ? new Date(`${data.birthDate}T12:00:00Z`)
        : null;

    if ("gender" in data) studentUpdateData.gender = data.gender || null;
    if ("cardCode" in data) studentUpdateData.cardCode = data.cardCode;

    if (Object.keys(userUpdateData).length > 0) {
      studentUpdateData.user = {
        update: userUpdateData,
      };
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: studentUpdateData,
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
    console.error("[PATCH /api/students/[id]]", error);
    return NextResponse.json(
      { error: "Error al actualizar el estudiante" },
      { status: 500 }
    );
  }
}
