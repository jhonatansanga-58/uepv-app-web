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
        return NextResponse.json(
          { error: "Admins cannot access tasks" },
          { status: 403 }
        );

      case Role.TEACHER:
        // Get tasks for courses where teacher teaches subjects
        const teacherTasks = await prisma.task.findMany({
          where: {
            subject: {
              teachers: {
                some: {
                  teacherId: userId
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
        return NextResponse.json(teacherTasks);

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
        return NextResponse.json(tutorTasks);

      case Role.STUDENT:
        // Get tasks from student's course
        const student = await prisma.student.findUnique({
          where: { id: userId }
        });

        if (!student) {
          return NextResponse.json(
            { error: "Student profile not found" },
            { status: 404 }
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
        return NextResponse.json(studentTasks);

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

    if (role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Only teachers can create tasks" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { subjectId, courseParallelId, title, description, dueDate } = data;

    const task = await prisma.task.create({
      data: {
        subjectId,
        courseParallelId,
        title,
        description,
        dueDate: new Date(dueDate)
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}