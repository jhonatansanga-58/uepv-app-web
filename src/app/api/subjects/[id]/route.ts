import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Update subject name and parallels (set active=false for removed)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();

    // Handle subject activation/deactivation
    if ('active' in body) {
      const updated = await prisma.subject.update({
        where: { id },
        data: { active: body.active }
      });
      return NextResponse.json(updated);
    }

    // Handle subject updates (name and parallels)
    const { name } = body;
    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    // Update subject name
    const res = await prisma.subject.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("[PATCH /api/subjects/[id]]", error);
    return NextResponse.json({ error: "Error actualizando el curso" }, { status: 500 });
  }
}
