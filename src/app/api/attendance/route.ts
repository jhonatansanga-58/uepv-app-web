import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { sendMulticast } from "@/utils/notifications";

// POST: create attendance
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json();

    // Enforce authentication and role check (ADMIN/TEACHER only) for all attendance registrations
    if (!token?.sub || !token?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (token.role !== 'ADMIN' && token.role !== 'TEACHER') {
      return NextResponse.json({ error: "Only administrators and teachers can register attendances" }, { status: 403 });
    }

    let studentId = Number(body.studentId ?? body.student?.id);

    // 1. FLUJO BIOMÉTRICO (AFIS)
    if (body.probeBase64) {
      console.log("Biometric capture received. Fetching candidates for AFIS...");

      // Obtener todas las huellas de estudiantes activos
      const candidates = await prisma.student.findMany({
        where: { user: { active: true }, fingerprint: { not: null } },
        select: { id: true, fingerprint: true },
      });

      if (candidates.length === 0) {
        return NextResponse.json({ error: "No hay huellas registradas en BD." }, { status: 404 });
      }

      // Preparar payload exacto para microservicio AFIS de Python (app.py)
      const payload = {
        probe: body.probeBase64,
        candidates: candidates.map(c => {
          let templates = [];
          try {
            // Parseamos el string JSON guardado en base de datos ["b64..", "b64.."]
            templates = JSON.parse(c.fingerprint || "[]");
          } catch (e) { }

          return {
            id: c.id,
            templates: templates
          };
        })
      };

      try {
        const afisReq = await fetch("http://127.0.0.1:5000/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const afisRes = await afisReq.json();

        // Flask microservice returns { "match": True, "studentId": best_id }
        if (afisReq.ok && afisRes.match) {
          studentId = afisRes.studentId;
          console.log(`AFIS Match Success: Student ${studentId}`);
        } else {
          console.log("AFIS Match Failed:", afisRes);
          return NextResponse.json({ error: "Huella no reconocida." }, { status: 404 });
        }
      } catch (afisErr) {
        console.warn("AFIS Service unreachable, attempting exact database fallback match for simulation:", afisErr);
        // Fallback simulation: find an active student whose fingerprint column contains this exact probe string
        const exactMatch = candidates.find(c => c.fingerprint && c.fingerprint.includes(body.probeBase64));
        if (exactMatch) {
          studentId = exactMatch.id;
          console.log(`Simulation Match Success (Fallback): Student ${studentId}`);
        } else {
          return NextResponse.json({ error: "Servicio biométrico AFIS fuera de línea o huella no coincide." }, { status: 503 });
        }
      }
    }

    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // userId is optional: prefer explicit body.userId, otherwise use session token if available
    let userId: number | undefined = undefined;
    if (body.userId !== undefined && body.userId !== null) {
      const n = Number(body.userId);
      if (!Number.isNaN(n)) userId = n;
    } else if (token && token.sub) {
      const n = Number(token.sub as string);
      if (!Number.isNaN(n)) userId = n;
    }

    // verify student exists and user active
    const student = await prisma.student.findUnique({
      include: {
        user: true,
        enrollments: {
          include: { courseParallel: { include: { course: true, parallel: true } } }
        }
      },
      where: { id: studentId }
    });

    if (!student || !student.user?.active) {
      return NextResponse.json({ error: "Student not found or inactive" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { studentId };
    if (userId) data.userId = userId;

    const attendance = await prisma.attendance.create({
      data,
      include: {
        student: {
          include: {
            user: true,
            enrollments: { include: { courseParallel: { include: { course: true, parallel: true } } } }
          }
        },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Send notification to all student's tutors (unless skipNotification is true)
    if (!body.skipNotification) {
      try {
        const tutors = await prisma.studentTutor.findMany({
          where: { studentId },
          include: {
            tutor: {
              select: { id: true, firebaseToken: true, firstName: true, lastName: true },
            },
          },
        });

        const tutorTokens = tutors
          .map(st => st.tutor.firebaseToken)
          .filter((token): token is string => token !== null && token.trim() !== '');

        if (tutorTokens.length > 0) {
          const notificationTitle = 'Asistencia Registrada';
          const notificationBody = `Se registró asistencia para ${attendance.student?.user?.firstName} ${attendance.student?.user?.lastName} el ${new Date(attendance.date).toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' })} a las ${new Date(attendance.date).toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz' })}`;

          const notificationData = {
            attendanceId: String(attendance.id),
            studentId: String(studentId),
            date: attendance.date.toISOString(),
          };

          await sendMulticast(tutorTokens, notificationTitle, notificationBody, notificationData);
        }
      } catch (notificationError) {
        console.warn('Error sending attendance notification to tutors', notificationError);
        // Don't fail the request if notification fails
      }
    }

    // Return flat data for frontend UX and raw attendance
    return NextResponse.json({
      ...attendance,
      firstName: attendance.student?.user?.firstName || "",
      lastName: attendance.student?.user?.lastName || "",
      courseName: attendance.student?.enrollments?.[0]?.courseParallel?.course?.name || "Sin Curso",
      parallelName: attendance.student?.enrollments?.[0]?.courseParallel?.parallel?.name || "Sin Paralelo"
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/attendance]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: get attendances by student and date range
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("studentId") || "");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const stats = searchParams.get("stats") === "true";

    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { studentId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(`${from}T00:00:00.000-04:00`);
      if (to) where.date.lte = new Date(`${to}T23:59:59.999-04:00`);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        student: {
          include: {
            user: true,
            enrollments: { include: { courseParallel: { include: { course: true, parallel: true } } } }
          }
        },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (stats) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereLeaves: any = {
        studentId,
        status: "APPROVED",
      };
      if (to) {
        whereLeaves.startDate = { lte: new Date(`${to}T23:59:59.999-04:00`) };
      }
      if (from) {
        whereLeaves.endDate = { gte: new Date(`${from}T00:00:00.000-04:00`) };
      }

      const leaves = await prisma.leaveRequest.findMany({
        where: whereLeaves,
      });

      return NextResponse.json({ attendances, leaves });
    }

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("[GET /api/attendance]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
