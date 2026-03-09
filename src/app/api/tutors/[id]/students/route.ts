import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tutorId = parseInt(params.id, 10);
    if (Number.isNaN(tutorId)) {
      return NextResponse.json({ error: "Invalid tutor id" }, { status: 400 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { sub?: string };
    const userId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    // Tutors can only fetch their own students (ownership check stays here)
    if (userId !== tutorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentTutors = await prisma.studentTutor.findMany({
      where: { tutorId },
      include: {
        student: {
          include: {
            user: true,
            courseParallel: {
              include: { course: true, parallel: true },
            },
          },
        },
      },
    });

    const students = studentTutors.map((st) => ({
      id: st.student.id,
      firstName: st.student.user.firstName,
      lastName: st.student.user.lastName,
      cardCode: st.student.cardCode,
      courseParallelId: st.student.courseParallelId,
      course: st.student.courseParallel?.course?.name ?? null,
      parallel: st.student.courseParallel?.parallel?.name ?? null,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error("[GET /api/tutors/[id]/students]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
