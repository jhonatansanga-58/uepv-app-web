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
                enrollments: {
                  where: { active: true },
                  include: {
                    courseParallel: {
                      include: {
                        course: true,
                        parallel: true
                      }
                    }
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
                enrollments: {
                  where: { active: true },
                  include: {
                    courseParallel: {
                      include: {
                        course: true,
                        parallel: true
                      }
                    }
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
                enrollments: {
                  where: { active: true },
                  include: {
                    courseParallel: {
                      include: {
                        course: true,
                        parallel: true
                      }
                    }
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
    const { studentId: initialStudentId, topic, message } = data;
    let studentId = initialStudentId;

    // Verify student exists and fetch tokens
    let student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        tutorships: { include: { tutor: true } }
      }
    });

    if (!student) {
      // Si el ID no corresponde a un estudiante, verificamos si corresponde a un tutor y buscamos su primer estudiante asociado
      const tutorship = await prisma.studentTutor.findFirst({
        where: { tutorId: studentId },
        include: {
          student: {
            include: {
              user: true,
              tutorships: { include: { tutor: true } }
            }
          }
        }
      });
      if (tutorship) {
        student = tutorship.student;
        studentId = student.id;
      }
    }

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

    // Enviar notificación Push (Fase 3)
    const tokens: string[] = [];
    if (student.user.firebaseToken) tokens.push(student.user.firebaseToken);
    student.tutorships.forEach((ts) => {
       if (ts.tutor.firebaseToken) tokens.push(ts.tutor.firebaseToken);
    });

    if (tokens.length > 0) {
       sendMulticast(
         tokens, 
         "📌 Nueva Citación Escolar", 
         `Ha sido citado por el docente sobre: ${topic}`,
         { route: "/citaciones" } // Metadata para la App Móvil
       ).catch((err: any) => console.error("Error sending push:", err));
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}