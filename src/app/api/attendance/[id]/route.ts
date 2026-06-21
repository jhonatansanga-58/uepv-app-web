import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    // Optionally you could check ownership or roles here
    await prisma.attendance.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/attendance/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
