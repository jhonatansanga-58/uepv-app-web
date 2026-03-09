import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { sub?: string };
    const userId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only tutor who created the request can toggle
    if (leave.tutorId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.leaveRequest.update({ where: { id }, data: { active: !leave.active } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/leaverequest/[id]/toggle]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
