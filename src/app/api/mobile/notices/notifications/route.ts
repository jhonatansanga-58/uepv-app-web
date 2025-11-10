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

      case Role.TUTOR: {
        const tutorStudentCourses = await prisma.courseParallel.findMany({
          where: {
            students: {
              some: {
                tutorships: {
                  some: {
                    tutorId: userId
                  }
                }
              }
            }
          },
          select: {
            id: true
          }
        });

        const courseIds = tutorStudentCourses.map(c => c.id);

        const tutorNotifications = await prisma.notification.findMany({
          where: {
            active: true,
            OR: [
              { userId: userId },
              { courseParallelId: { in: courseIds } },
              {
                AND: [
                  { userId: null },
                  { courseParallelId: null }
                ]
              }
            ]
          },
          include: {
            courseParallel: {
              include: {
                course: true,
                parallel: true
              }
            }
          }
        });

        const tutorCreatorIds = Array.from(new Set(tutorNotifications.map((n) => n.creatorId)));
        const tutorCreators = tutorCreatorIds.length
          ? await prisma.user.findMany({
            where: { id: { in: tutorCreatorIds } },
            select: { id: true, firstName: true, lastName: true },
          })
          : [];
        const tutorCreatorMap = new Map(tutorCreators.map((u) => [u.id, u]));
        const tutorNotificationsWithCreator = tutorNotifications.map((n) => ({
          ...n,
          creator: tutorCreatorMap.get(n.creatorId) || null,
        }));

        return new NextResponse(
          JSON.stringify(tutorNotificationsWithCreator),
          { status: 200, headers: corsHeaders }
        );
      }

      case Role.STUDENT: {
        const student = await prisma.student.findUnique({
          where: { id: userId }
        });

        if (!student) {
          return NextResponse.json(
            { error: "Student profile not found" },
            { status: 404 }
          );
        }

        const studentNotifications = await prisma.notification.findMany({
          where: {
            active: true,
            OR: [
              { userId: userId },
              { courseParallelId: student.courseParallelId },
              {
                AND: [
                  { userId: null },
                  { courseParallelId: null }
                ]
              }
            ]
          },
          include: {
            courseParallel: {
              include: {
                course: true,
                parallel: true
              }
            }
          }
        });

        const studentCreatorIds = Array.from(new Set(studentNotifications.map((n) => n.creatorId)));
        const studentCreators = studentCreatorIds.length
          ? await prisma.user.findMany({
            where: { id: { in: studentCreatorIds } },
            select: { id: true, firstName: true, lastName: true },
          })
          : [];
        const studentCreatorMap = new Map(studentCreators.map((u) => [u.id, u]));
        const studentNotificationsWithCreator = studentNotifications.map((n) => ({
          ...n,
          creator: studentCreatorMap.get(n.creatorId) || null,
        }));

        return new NextResponse(
          JSON.stringify(studentNotificationsWithCreator),
          { status: 200, headers: corsHeaders }
        );
      }

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
