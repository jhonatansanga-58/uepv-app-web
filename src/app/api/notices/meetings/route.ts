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
      case Role.TEACHER:
        // Get meetings created by the user
        const userMeetings = await prisma.meeting.findMany({
          where: {
            userId: userId,
          },
          include: {
            user: true,
            student: {
              include: {
                user: true,
                courseParallel: {
                  include: {
                    course: true,
                    parallel: true
                  }
                }
              }
            }
          }
        });
        return NextResponse.json(userMeetings);

      case Role.TUTOR:
        // Get meetings for tutor's students
        const tutorMeetings = await prisma.meeting.findMany({
          where: {
            student: {
              tutorships: {
                some: {
                  tutorId: userId
                }
              }
            },
            active: true
          },
          include: {
            user: true,
            student: {
              include: {
                user: true,
                courseParallel: {
                  include: {
                    course: true,
                    parallel: true
                  }
                }
              }
            },
          }
        });
        return NextResponse.json(tutorMeetings);

      case Role.STUDENT:
        // Get meetings where student is the target
        const studentMeetings = await prisma.meeting.findMany({
          where: {
            studentId: userId,
            active: true
          },
          include: {
            user: true,
            student: {
              include: {
                user: true,
                courseParallel: {
                  include: {
                    course: true,
                    parallel: true
                  }
                }
              }
            },
          }
        });
        return NextResponse.json(studentMeetings);

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
        { error: "Only admins and teachers can create meetings" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { studentId, topic, message } = data;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const meeting = await prisma.meeting.create({
      data: {
        userId: userId,
        studentId,
        topic,
        message
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        user: true
      }
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}