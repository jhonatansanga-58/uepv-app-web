import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const parallels = await prisma.parallel.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(parallels);
  } catch (error) {
    console.error("[GET /api/parallels]", error);
    return NextResponse.json({ error: "Error loading parallels" }, { status: 500 });
  }
}
