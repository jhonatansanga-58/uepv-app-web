import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Lista general de estudiantes
    const allStudents = await prisma.student.findMany({
      where: {
        user: {
          active: true,
        },
      },
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

    let assigned: { id: number; fullName: string }[] = [];
    let all: { id: number; fullName: string }[] = [];

    // Si hay userId, buscar estudiantes asignados a ese padre
    if (userId !== null) {
      const tutorId = Number(userId);
      if (Number.isNaN(tutorId)) {
        return NextResponse.json({ error: "userId inválido" }, { status: 400 });
      }

      // Obtener estudiantes asignados al tutor usando StudentTutor
      const assignedStudents = await (prisma as any).studentTutor.findMany({
        where: {
          tutorId,
          student: {
            user: {
              active: true,
            },
          },
        },
        select: {
          student: {
            select: {
              id: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });

      assigned = assignedStudents.map((st: any) => ({
        id: st.student.id,
        fullName: `${st.student.user.firstName} ${st.student.user.lastName}`,
      }));

      // Obtener IDs de estudiantes ya asignados a este tutor
      const assignedIds = new Set(assignedStudents.map((st: any) => st.student.id));

      // "all" debe contener todos los estudiantes que NO están asignados a este tutor específico
      // (pueden tener otros tutores asignados, pero eso no importa)
      all = allStudents
        .filter(s => !assignedIds.has(s.id))
        .map((s) => ({
          id: s.id,
          fullName: `${s.user.firstName} ${s.user.lastName}`,
        }));
    } else {
      // Sin userId, retornar todos los estudiantes
      all = allStudents.map((s) => ({
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
