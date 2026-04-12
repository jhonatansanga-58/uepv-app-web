import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { LeaveStatus } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { sub?: string, role?: string };
    const userSub = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;
    const userRole = (token as TokenWithRole)?.role;

    const formData = await req.formData() as any;
    const studentId = formData.get("studentId")?.toString();
    const title = formData.get("title")?.toString();
    const message = formData.get("message")?.toString();
    const reason = formData.get("reason")?.toString();
    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();
    const evidenceFile = formData.get("evidence") as File | null;

    if (!studentId || !title || !message || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let tutorId = userSub;
    if (userRole === "STUDENT") {
      const studentData = await prisma.student.findUnique({
        where: { id: parseInt(studentId, 10) },
        include: { tutorships: true }
      });
      if (studentData && studentData.tutorships.length > 0) tutorId = studentData.tutorships[0].tutorId;
      else tutorId = 1;
    } else {
      // Ensure the tutor is actually assigned to the student
      const relation = await prisma.studentTutor.findFirst({ where: { tutorId: userSub, studentId: Number(studentId) } });
      if (!relation && userRole !== "ADMIN") {
        return NextResponse.json({ error: "You are not assigned to this student" }, { status: 403 });
      }
    }

    let evidenceUrl = null;
    if (evidenceFile && evidenceFile.name && evidenceFile.size > 0) {
      const bytes = await evidenceFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads", "licencias");
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}_${evidenceFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, buffer);
      evidenceUrl = `/uploads/licencias/${filename}`;
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
        evidenceUrl: evidenceUrl
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
