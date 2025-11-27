import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export async function OPTIONS() {

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) return new NextResponse(
      JSON.stringify({ error: "Invalid id" }),
      { status: 400, headers: corsHeaders }
    );

    let token = await getToken({ req: req });
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const jwtToken = authHeader.split(" ")[1];
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const decoded = jwt.verify(jwtToken, JWT_SECRET) as any;
          token = {
            sub: decoded.id?.toString(),
            role: decoded.role as Role,
            userName: decoded.userName
          };
        } catch (err) {
          console.error("Error decodificando token manualmente:", err);
        }
      }
    }

    if (!token?.sub || !token?.role) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

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

    if (!leave) return new NextResponse(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: corsHeaders }
    );

    // If tutor, ensure they own this leave request
    if (role === 'TUTOR') {
      if (leave.tutorId !== userId) return new NextResponse(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: corsHeaders }
      );
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

    return new NextResponse(
      JSON.stringify(result),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[GET /api/leaverequest/[id]]', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
