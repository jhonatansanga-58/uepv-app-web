import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { sendMulticast } from "@/utils/notifications";

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
        const tutorTasks = await prisma.task.findMany({
          where: {
            active: true,
            courseParallel: {
              enrollments: {
                some: {
                  student: {
                    tutorships: {
                      some: { tutorId: userId }
                    }
                  }
                }
              }
            }
          },
          include: {
            subject: true,
            courseParallel: {
              include: { course: true, parallel: true }
            }
          }
        });
        return NextResponse.json(tutorTasks);

      case Role.STUDENT:
        const studentEnrollments = await prisma.enrollment.findMany({
          where: { studentId: userId, academicYear: { active: true } }
        });
        
        if (studentEnrollments.length === 0) {
           return NextResponse.json([], { status: 200 });
        }
        
        const courseParallelIds = studentEnrollments.map(e => e.courseParallelId);

        const studentTasks = await prisma.task.findMany({
          where: {
            courseParallelId: { in: courseParallelIds },
            active: true
          },
          include: {
            subject: true,
            courseParallel: {
              include: { course: true, parallel: true }
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
      },
      include: {
         subject: true
      }
    });

    // Enviar notificación Push (Fase 3)
    const enrollments = await prisma.enrollment.findMany({
       where: { courseParallelId, academicYear: { active: true } },
       include: {
          student: {
             include: {
                user: true,
                tutorships: { include: { tutor: true } }
             }
          }
       }
    });

    const tokens: string[] = [];
    enrollments.forEach(en => {
       if (en.student.user?.firebaseToken) tokens.push(en.student.user.firebaseToken);
       en.student.tutorships.forEach(ts => {
          if (ts.tutor.firebaseToken) tokens.push(ts.tutor.firebaseToken);
       });
    });

    if (tokens.length > 0) {
       // Filtramos para eliminar duplicados si hay hermanos o tutores compartidos
       const uniqueTokens = [...new Set(tokens)];
       sendMulticast(
         uniqueTokens, 
         "📘 Nueva Tarea Escolar", 
         `Se asignó una tarea de ${task.subject.name}: ${title}`,
         { route: "/tareas" }
       ).catch((err: any) => console.error("Error sending push:", err));
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}