import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const courses = await prisma.course.findMany({
      select: { id: true, name: true },
      where: { active: true },
      orderBy: { name: "asc" },
    });

    const all = courses.map((s) => ({ id: s.id, name: s.name }));

    let assigned: { id: number; name: string }[] = [];

    if (id !== null) {
      const subjectId = Number(id);
      if (Number.isNaN(subjectId)) {
        return NextResponse.json({ error: "subjectId inválido" }, { status: 400 });
      }

      const subjectCourses = await prisma.courseSubject.findMany({
        where: {
          subjectId: subjectId,
          course: { active: true }
        },
        select: {
          course: { select: { id: true, name: true } },
        },
        orderBy: {
          course: { name: "asc" },
        },
      });

      assigned = subjectCourses.map((ts) => ({
        id: ts.course.id,
        name: ts.course.name,
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const courseIds: number[] = Array.isArray(body.courseIds) ? body.courseIds : [];

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "subjectId inválido" }, { status: 400 });
    }

    // Remove existing relations for the subject
    await prisma.courseSubject.deleteMany({ where: { subjectId: id } });

    if (courseIds.length > 0) {
      // Create new relations
      await prisma.courseSubject.createMany({
        data: courseIds.map((courseId) => ({
          subjectId: id,
          courseId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ message: 'Courses assigned' });
  } catch (error) {
    console.error('[POST /api/subjects/courses/[id]]', error);
    return NextResponse.json({ error: 'Error asignando cursos' }, { status: 500 });
  }
}
