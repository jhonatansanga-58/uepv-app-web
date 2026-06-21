import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "@prisma/client";
import { sendPushNotification } from "@/utils/notifications";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { role?: string };
    const role = (token as TokenWithRole)?.role;

    if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { status, rejectionReason } = body as { status?: string; rejectionReason?: string | null };
    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const statusEnum = status as LeaveStatus;
    const data: { status: LeaveStatus; rejectionReason?: string | null } = { status: statusEnum };
    if (statusEnum === 'REJECTED') data.rejectionReason = rejectionReason ?? null;

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data,
      include: {
        student: { include: { user: true } },
        tutor: true,
      },
    });

    // Send push notification to the tutor (who created the leave request)
    try {
      console.log('Preparing to send push notification for leave request update');
      const tutor = updated.tutor;
      const firebaseToken = tutor?.firebaseToken;

      if (firebaseToken && firebaseToken.trim() !== '') {
        const notificationTitle =
          statusEnum === 'APPROVED' ? 'Licencia Aprobada' : 'Licencia Rechazada';
        const notificationBody =
          statusEnum === 'APPROVED'
            ? `La solicitud de licencia "${updated.title}" para ${updated.student?.user?.firstName} ${updated.student?.user?.lastName} ha sido aprobada.`
            : `La solicitud de licencia "${updated.title}" para ${updated.student?.user?.firstName} ${updated.student?.user?.lastName} ha sido rechazada.`;

        const notificationData = {
          requestId: String(updated.id),
          status: statusEnum,
          studentId: String(updated.studentId),
          ...(statusEnum === 'REJECTED' && { rejectionReason: updated.rejectionReason || '' }),
        };

        await sendPushNotification(
          firebaseToken,
          notificationTitle,
          notificationBody,
          notificationData
        );
      }
    } catch (notificationError) {
      console.warn('Error sending push notification for leave request update', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/leaverequest/[id]/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
