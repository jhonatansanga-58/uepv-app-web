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

    // Primero, eliminamos todas las asignaciones existentes del tutor
    await (prisma as any).studentTutor.deleteMany({
      where: { tutorId: userId },
    });

    // Luego, creamos las nuevas asignaciones
    if (studentIds.length > 0) {
      await (prisma as any).studentTutor.createMany({
        data: studentIds.map((studentId: number) => ({
          studentId,
          tutorId: userId,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning students:", error);
    return NextResponse.json(
      { error: "Failed to assign students" },
      { status: 500 }
    );
  }
}
