import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ajusta según cómo importes Prisma

import { NextRequest } from "next/server";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Error loading courses" },
      { status: 500 }
    );
  }
}


// Create a new course and assign parallels
export async function POST(req: NextRequest) {
  try {
    const { name, parallelIds } = await req.json();
    if (!name || !Array.isArray(parallelIds) || parallelIds.length === 0) {
      return NextResponse.json({ error: "Nombre y paralelos requeridos" }, { status: 400 });
    }

    // Create the course
    const course = await prisma.course.create({
      data: { name },
    });

    // Create CourseParallel relations
    await prisma.courseParallel.createMany({
      data: parallelIds.map((parallelId: number) => ({
        courseId: course.id,
        parallelId,
        active: true,
      })),
    });

    // Return the new course with its parallels
    const created = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        parallels: {
          include: { parallel: true },
        },
      },
    });
    return NextResponse.json(created);
  } catch (error) {
    console.error("[POST /api/courses]", error);
    return NextResponse.json({ error: "Error creando el curso" }, { status: 500 });
  }
}
