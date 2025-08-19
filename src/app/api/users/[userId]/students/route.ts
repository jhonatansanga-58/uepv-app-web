import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = parseInt(params.userId);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const studentIds: number[] = body.studentIds || [];

    // Primero, eliminamos asignaciones existentes
    await prisma.student.updateMany({
      where: { tutorId: userId },
      data: { tutorId: null },
    });

    // Luego, asignamos los nuevos estudiantes
    await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { tutorId: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning students:", error);
    return NextResponse.json(
      { error: "Failed to assign students" },
      { status: 500 }
    );
  }
}
