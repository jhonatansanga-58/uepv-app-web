import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const academicYearId = parseInt(id, 10);
    if (isNaN(academicYearId)) {
      return NextResponse.json({ error: "ID Inválido" }, { status: 400 });
    }

    // Using transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Set all academic years to inactive
      await tx.academicYear.updateMany({
        data: { active: false },
      });

      // 2. Set the requested academic year to active
      const updatedYear = await tx.academicYear.update({
        where: { id: academicYearId },
        data: { active: true },
      });

      return updatedYear;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PATCH /api/academic-years/[id]/activate]", error);
    return NextResponse.json(
      { error: "Error activando la gestión académica" },
      { status: 500 }
    );
  }
}
