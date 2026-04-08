import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: { user: { active: true } },
      include: {
        user: true,
        enrollments: { include: { courseParallel: { include: { course: true, parallel: true } } } },
      },
      orderBy: { user: { lastName: "asc" } },
    });

    const result = students.map((s) => {
      const name = `${s.user.firstName} ${s.user.lastName}`;
      const cp = s.enrollments?.[0]?.courseParallel;
      const course = cp?.course?.name ?? "Sin curso";
      const parallel = cp?.parallel?.name ?? "";
      const label = parallel ? `${name} - ${course} - ${parallel}` : `${name} - ${course}`;
      return { id: s.id, label };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/students/allminimal]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
