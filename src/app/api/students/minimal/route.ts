import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Lista general de estudiantes
    const students = await prisma.student.findMany({
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: "asc",
        },
      },
    });

    const all = students.map((s) => ({
      id: s.id,
      fullName: `${s.user.firstName} ${s.user.lastName}`,
    }));

    let assigned: { id: number; fullName: string }[] = [];

    // Si hay userId, buscar estudiantes asignados a ese padre
    if (userId !== null) {
      const tutorId = Number(userId);
      if (Number.isNaN(tutorId)) {
        return NextResponse.json({ error: "userId inválido" }, { status: 400 });
      }

      const assignedRows = await prisma.student.findMany({
        where: { tutorId },
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: {
          user: { firstName: "asc" },
        },
      });

      assigned = assignedRows.map((s) => ({
        id: s.id,
        fullName: `${s.user.firstName} ${s.user.lastName}`,
      }));
    }

    return NextResponse.json({
      all,
      assigned,
    });
  } catch (error) {
    console.error("Error loading minimal students:", error);
    return NextResponse.json(
      { error: "Error al cargar estudiantes" },
      { status: 500 }
    );
  }
}
