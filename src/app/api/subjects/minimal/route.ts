import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // 1) Lista completa (id + name)
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true },
      where: { active: true },
      orderBy: { name: "asc" },
    });

    const all = subjects.map((s) => ({ id: s.id, name: s.name }));

    // 2) Asignados al docente (si proporcionas userId => teacherId)
    let assigned: { id: number; name: string }[] = [];

    if (userIdParam !== null) {
      const teacherId = Number(userIdParam);
      if (Number.isNaN(teacherId)) {
        return NextResponse.json({ error: "userId inválido" }, { status: 400 });
      }

      // Busca las materias asociadas al profesor en TeacherSubject
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: { teacherId, subject: { active: true } },
        select: {
          subject: { select: { id: true, name: true } },
        },
        orderBy: {
          subject: { name: "asc" },
        },
      });

      assigned = teacherSubjects.map((ts) => ({
        id: ts.subject.id,
        name: ts.subject.name,
      }));
    }

    return NextResponse.json({ all, assigned });
  } catch (error) {
    console.error("Error loading minimal subjects:", error);
    return NextResponse.json(
      { error: "Error al cargar materias" },
      { status: 500 }
    );
  }
}
