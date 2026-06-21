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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const tutorId = parseInt(rawId, 10);
    if (Number.isNaN(tutorId)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid tutor id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

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

    type TokenWithRole = { sub?: string };
    const userId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    if (userId !== tutorId) {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const studentTutors = await prisma.studentTutor.findMany({
      where: { tutorId },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              where: { active: true },
              include: { courseParallel: { include: { course: true, parallel: true } } },
            },
          },
        },
      },
    });

    const students = studentTutors.map((st) => {
      const activeEnrollment = st.student.enrollments?.[0];
      return {
        id: st.student.id,
        firstName: st.student.user.firstName,
        lastName: st.student.user.lastName,
        courseParallelId: activeEnrollment?.courseParallelId ?? null,
        course: activeEnrollment?.courseParallel?.course?.name ?? null,
        parallel: activeEnrollment?.courseParallel?.parallel?.name ?? null,
      };
    });

    return new NextResponse(
      JSON.stringify(students),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[GET /api/tutors/[id]/students]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
