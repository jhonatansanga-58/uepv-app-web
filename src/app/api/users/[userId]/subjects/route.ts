import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdStr } = await params;
  const userId = parseInt(userIdStr);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const subjectIds: number[] = body.subjectIds || [];

    // Primero, eliminamos asignaciones existentes
    await prisma.teacherSubject.deleteMany({
      where: { teacherId: userId },
    });

    // Luego, agregamos las nuevas asignaciones
    const createData = subjectIds.map((subjectId) => ({
      teacherId: userId,
      subjectId,
    }));

    if (createData.length > 0) {
      await prisma.teacherSubject.createMany({ data: createData });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning subjects:", error);
    return NextResponse.json(
      { error: "Failed to assign subjects" },
      { status: 500 }
    );
  }
}
