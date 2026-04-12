import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { sendMulticast } from "@/utils/notifications";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub || !token?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = token.role as Role;
    const userId = parseInt(token.sub);

    switch (role) {
      case Role.ADMIN:
      case Role.TEACHER: {
        const userNotifications = await prisma.notification.findMany({
          where: { creatorId: userId },
          include: {
            user: true,
            courseParallel: { include: { course: true, parallel: true } },
          },
          orderBy: { date: "desc" },
        });

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
        const tutorStudentCourses = await prisma.courseParallel.findMany({
          where: {
            enrollments: {
              some: { student: { tutorships: { some: { tutorId: userId } } } }
            }
          },
          select: { id: true }
        });

        const courseIds = tutorStudentCourses.map(c => c.id);

        const tutorNotifications = await prisma.notification.findMany({
          where: {
            active: true,
            OR: [
              { userId: userId },
              { courseParallelId: { in: courseIds } },
              { AND: [{ userId: null }, { courseParallelId: null }] }
            ]
          },
          include: {
            courseParallel: { include: { course: true, parallel: true } }
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

        return NextResponse.json(tutorNotificationsWithCreator);
      }

      case Role.STUDENT: {
        const studentEnrollments = await prisma.enrollment.findMany({
          where: { studentId: userId, academicYear: { active: true } },
        });

        const courseParallelIds = studentEnrollments.map(e => e.courseParallelId);

        const studentNotifications = await prisma.notification.findMany({
          where: {
            active: true,
            OR: [
              { userId: userId },
              { courseParallelId: { in: courseParallelIds } },
              { AND: [{ userId: null }, { courseParallelId: null }] }
            ]
          },
          include: {
            courseParallel: { include: { course: true, parallel: true } }
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

        return NextResponse.json(studentNotificationsWithCreator);
      }

      default: return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub || !token?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        courseParallel: { include: { course: true, parallel: true } },
      },
    });

    // --- Firebase Push Notification Logic ---
    const tokens: string[] = [];

    if (targetUserId) {
       // Individual user 
       const targetUser = await prisma.user.findUnique({
          where: { id: parseInt(String(targetUserId), 10) },
          include: { studentProfile: { include: { tutorships: { include: { tutor: true } } } } }
       });
       if (targetUser?.firebaseToken) tokens.push(targetUser.firebaseToken);
       if (targetUser?.studentProfile) {
          targetUser.studentProfile.tutorships.forEach(ts => {
             if (ts.tutor.firebaseToken) tokens.push(ts.tutor.firebaseToken);
          });
       }
    } else if (courseParallelId) {
       // A whole parallel (Students + Tutors)
       const enrollments = await prisma.enrollment.findMany({
          where: { courseParallelId: parseInt(String(courseParallelId), 10), academicYear: { active: true } },
          include: { student: { include: { user: true, tutorships: { include: { tutor: true } } } } }
       });
       enrollments.forEach(en => {
          if (en.student.user?.firebaseToken) tokens.push(en.student.user.firebaseToken);
          en.student.tutorships.forEach(ts => {
             if (ts.tutor.firebaseToken) tokens.push(ts.tutor.firebaseToken);
          });
       });
    } else {
       // Broadcast to everyone via Global topic or fetching all tokens
       const allUsersWithToken = await prisma.user.findMany({
          where: { firebaseToken: { not: null }, active: true },
          select: { firebaseToken: true }
       });
       allUsersWithToken.forEach(u => tokens.push(u.firebaseToken as string));
    }

    // Filter duplicates and push
    if (tokens.length > 0) {
       const uniqueTokens = [...new Set(tokens)];
       sendMulticast(uniqueTokens, title, message, { route: "/comunicados" })
         .catch((err: any) => console.error("Error multicasting push:", err));
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}