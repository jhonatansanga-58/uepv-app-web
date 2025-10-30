import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { role?: string; sub?: string };
    const role = (token as TokenWithRole)?.role;
    const userId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        student: { include: { user: true, courseParallel: { include: { course: true } } } },
        tutor: true,
      },
    });

    if (!leave) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If tutor, ensure they own this leave request
    if (role === 'TUTOR') {
      if (leave.tutorId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // counts of licences for the student
    const studentId = leave.studentId;
    const approvedCount = await prisma.leaveRequest.count({ where: { studentId, status: 'APPROVED' } });
    const pendingCount = await prisma.leaveRequest.count({ where: { studentId, status: 'PENDING' } });
    const rejectedCount = await prisma.leaveRequest.count({ where: { studentId, status: 'REJECTED' } });

    const result = {
      ...leave,
      studentCourse: leave.student.courseParallel?.course ?? null,
      counts: { approvedCount, pendingCount, rejectedCount },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/leaverequest/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
