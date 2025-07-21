import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = parseInt(searchParams.get("courseId") || "");
  const parallelId = parseInt(searchParams.get("parallelId") || "");

  if (isNaN(courseId) || isNaN(parallelId)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
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
    return NextResponse.json({ error: "Error al cargar estudiantes" }, { status: 500 });
  }
}
