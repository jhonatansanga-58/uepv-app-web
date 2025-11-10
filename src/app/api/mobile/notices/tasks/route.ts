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
      case Role.ADMIN:
        return new NextResponse(
          JSON.stringify({ error: "Admins cannot access tasks" }),
          { status: 403, headers: corsHeaders }
        );

      case Role.TUTOR:
        // Get tasks from courses of tutor's students
        const tutorTasks = await prisma.task.findMany({
          where: {
            active: true,
            courseParallel: {
              students: {
                some: {
                  tutorships: {
                    some: {
                      tutorId: userId
                    }
                  }
                }
              }
            }
          },
          include: {
            subject: true,
            courseParallel: {
              include: {
                course: true,
                parallel: true
              }
            }
          }
        });
        return new NextResponse(
          JSON.stringify(tutorTasks),
          { status: 200, headers: corsHeaders }
        );

      case Role.STUDENT:
        // Get tasks from student's course
        const student = await prisma.student.findUnique({
          where: { id: userId }
        });

        if (!student) {
          return new NextResponse(
            JSON.stringify({ error: "Student profile not found" }),
            { status: 404, headers: corsHeaders }
          );
        }

        const studentTasks = await prisma.task.findMany({
          where: {
            courseParallelId: student.courseParallelId,
            active: true
          },
          include: {
            subject: true,
            courseParallel: {
              include: {
                course: true,
                parallel: true
              }
            }
          }
        });
        return new NextResponse(
          JSON.stringify(studentTasks),
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
