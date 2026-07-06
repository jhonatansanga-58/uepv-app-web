import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "TUTOR",
        active: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error loading students:", error);
    return NextResponse.json(
      { error: "Error al cargar estudiantes" },
      { status: 500 }
    );
  }
}
