import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

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

export async function GET(request: NextRequest) {
  try {
    let token = await getToken({ req: request });
    if (!token) {
      const authHeader = request.headers.get("authorization");
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

    const role = token.role as Role;
    const userId = parseInt(token.sub);

    switch (role) {
      case Role.TUTOR:
        const tutorMeetings = await prisma.meeting.findMany({
          where: {
            student: { tutorships: { some: { tutorId: userId } } },
            active: true
          },
          include: {
            user: true,
            student: {
              include: {
                user: true,
                enrollments: { include: { courseParallel: { include: { course: true, parallel: true } } } }
              }
            },
          }
        });
        
        const mappedTutorMeetings = tutorMeetings.map((m: any) => ({
           ...m,
           student: {
              ...m.student,
              courseParallel: m.student.enrollments?.[0]?.courseParallel || null
           }
        }));

        return new NextResponse(
          JSON.stringify(mappedTutorMeetings),
          { status: 200, headers: corsHeaders }
        );

      case Role.STUDENT:
        const studentMeetings = await prisma.meeting.findMany({
          where: { studentId: userId, active: true },
          include: {
            user: true,
            student: {
              include: {
                user: true,
                enrollments: { include: { courseParallel: { include: { course: true, parallel: true } } } }
              }
            },
          }
        });

        const mappedStudentMeetings = studentMeetings.map((m: any) => ({
           ...m,
           student: {
              ...m.student,
              courseParallel: m.student.enrollments?.[0]?.courseParallel || null
           }
        }));

        return new NextResponse(
          JSON.stringify(mappedStudentMeetings),
          { status: 200, headers: corsHeaders }
        );

      default:
        return new NextResponse(
          JSON.stringify({ error: "Invalid role" }),
          { status: 403, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
