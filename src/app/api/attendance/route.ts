import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// POST: create attendance
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const body = await req.json();
    const studentId = Number(body.studentId ?? body.student?.id);
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // userId is optional: prefer explicit body.userId, otherwise use session token if available
    let userId: number | undefined = undefined;
    if (body.userId !== undefined && body.userId !== null) {
      const n = Number(body.userId);
      if (!Number.isNaN(n)) userId = n;
    } else if (token && token.sub) {
      const n = Number(token.sub as string);
      if (!Number.isNaN(n)) userId = n;
    }

    // verify student exists and user active
    const student = await prisma.student.findUnique({ include: { user: true }, where: { id: studentId } });
    if (!student || !student.user.active) {
      return NextResponse.json({ error: "Student not found or inactive" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { studentId };
    if (userId) data.userId = userId;

    const attendance = await prisma.attendance.create({ data });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("[POST /api/attendance]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: get attendances by student and date range
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("studentId") || "");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { studentId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        student: { include: { user: true, courseParallel: { include: { course: true, parallel: true } } } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("[GET /api/attendance]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
