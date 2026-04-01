import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { NextRequest } from "next/server";

export async function GET() {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: {
        year: "desc",
      },
    });

    return NextResponse.json(academicYears);
  } catch (error) {
    console.error("Error fetching academic years:", error);
    return NextResponse.json(
      { error: "Error loading academic years" },
      { status: 500 }
    );
  }
}

// Create a new academic year
export async function POST(req: NextRequest) {
  try {
    const { year } = await req.json();
    if (!year || typeof year !== "number") {
      return NextResponse.json({ error: "Año requerido y debe ser numérico" }, { status: 400 });
    }

    // Create the academic year (active: false by default in schema)
    const academicYear = await prisma.academicYear.create({
      data: { 
        year: year,
        active: false // always create as inactive initially
      },
    });

    return NextResponse.json(academicYear);
  } catch (error) {
    console.error("[POST /api/academic-years]", error);
    // If it's a unique constraint error (P2002) for year
    if (typeof error === 'object' && error !== null && 'code' in error && (error as {code: string}).code === 'P2002') {
        return NextResponse.json({ error: "El año ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error creando la gestión" }, { status: 500 });
  }
}
