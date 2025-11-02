import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub || !token?.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = token.role as Role;
    const userId = parseInt(token.sub);

    switch (role) {
      case Role.ADMIN:
      case Role.TEACHER: {
        // Get notifications created by the user
        const userNotifications = await prisma.notification.findMany({
          where: {
            creatorId: userId,
          },
          include: {
            // target user (if notification is for a specific user)
            user: true,
            // courseParallel with nested course and parallel names
            courseParallel: {
              include: {
                course: true,
                parallel: true,
              },
            },
          },
          orderBy: { date: "desc" },
        });

        // Attach the creator user (the requesting user) to each notification so the
        // client receives a `creator` object matching the frontend Notification interface.
        const creatorUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, firstName: true, lastName: true },
        });

        const userNotificationsWithCreator = userNotifications.map((n) => ({
          ...n,
          creator: creatorUser || null,
        }));

        return NextResponse.json(userNotificationsWithCreator);
      }

      case Role.TUTOR: {
        // Get notifications where:
        // 1. Tutor is the target user
        // 2. Tutor's students' courses are target
        // 3. Global notifications (no userId/courseParallelId)

        // First get all course parallels where tutor has students
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

        // Attach creator info for each notification
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

        return NextResponse.json(tutorNotificationsWithCreator);
      }

      case Role.STUDENT: {
        // Get student's course
        const student = await prisma.student.findUnique({
          where: { id: userId }
        });

        if (!student) {
          return NextResponse.json(
            { error: "Student profile not found" },
            { status: 404 }
          );
        }

        // Get notifications where:
        // 1. Student is the target user
        // 2. Student's course is target
        // 3. Global notifications (no userId/courseParallelId)
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

        // Attach creator info for each notification
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

        return NextResponse.json(studentNotificationsWithCreator);
      }

      default:
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 403 }
        );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub || !token?.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = token.role as Role;
    const userId = parseInt(token.sub);

    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Only admins and teachers can create notifications" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { title, message, userId: targetUserId, courseParallelId } = data;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId: targetUserId ? parseInt(String(targetUserId), 10) : null,
        courseParallelId: courseParallelId ? parseInt(String(courseParallelId), 10) : null,
        creatorId: userId,
      },
      include: {
        user: true,
        courseParallel: {
          include: {
            course: true,
            parallel: true,
          },
        },
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}