import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { LeaveStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { sub?: string };
    const tutorId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    const body = await req.json();
    const {
      studentId,
      title,
      message,
      reason,
      startDate,
      endDate,
    } = body;

    if (!studentId || !title || !message || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure the tutor is actually assigned to the student
    const relation = await prisma.studentTutor.findFirst({ where: { tutorId, studentId: Number(studentId) } });
    if (!relation) {
      return NextResponse.json({ error: "You are not assigned to this student" }, { status: 403 });
    }

    const created = await prisma.leaveRequest.create({
      data: {
        studentId: Number(studentId),
        tutorId: tutorId!,
        title,
        message,
        reason,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("[POST /api/leaverequest]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // This handler returns leave requests filtered by status for admins only when query `status` provided
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { role?: string };
    const role = (token as TokenWithRole)?.role;

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get("status");
    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid or missing status" }, { status: 400 });
    }

    const statusParam = status as LeaveStatus;

    const requests = await prisma.leaveRequest.findMany({
      where: { status: statusParam, active: true },
      orderBy: { requestDate: "desc" },
      include: {
        student: { include: { user: true } },
        tutor: true,
      },
    });
    const formattedRequests = requests.map((lr) => ({
      id: lr.id,
      student: `${lr.student.user.firstName} ${lr.student.user.lastName}`,
      tutor: `${lr.tutor.firstName} ${lr.tutor.lastName}`,
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("[GET /api/leaverequest]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
