import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
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

    const updated = await prisma.leaveRequest.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/leaverequest/[id]/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
