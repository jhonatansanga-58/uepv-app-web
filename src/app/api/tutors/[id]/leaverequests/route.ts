import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tutorId = parseInt(id, 10);
    if (Number.isNaN(tutorId)) return NextResponse.json({ error: "Invalid tutor id" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    type TokenWithRole = { sub?: string };
    const userId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    // Ownership check: tutors may only fetch their own requests
    if (userId !== tutorId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await prisma.leaveRequest.findMany({
      where: { tutorId },
      orderBy: { requestDate: "desc" },
      include: {
        student: { include: { user: true } },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[GET /api/tutors/[id]/leaverequests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
