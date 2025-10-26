import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Update course name and parallels (set active=false for removed)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();

    // Handle course activation/deactivation
    if ('active' in body) {
      const updated = await prisma.course.update({
        where: { id },
        data: { active: body.active },
        include: {
          parallels: {
            include: { parallel: true },
          },
        },
      });
      return NextResponse.json(updated);
    }

    // Handle course updates (name and parallels)
    const { name, parallelIds } = body;
    if (!name || !Array.isArray(parallelIds)) {
      return NextResponse.json({ error: "Nombre y paralelos requeridos" }, { status: 400 });
    }

    // Update course name
    await prisma.course.update({
      where: { id },
      data: { name },
    });

    // Get all current CourseParallel for this course
    const allCourseParallels = await prisma.courseParallel.findMany({
      where: { courseId: id },
    });

    // Set active=true for those in parallelIds, active=false for those not
    const updates = await Promise.all(
      allCourseParallels.map(async (cp) => {
        const shouldBeActive = parallelIds.includes(cp.parallelId);
        if (cp.active !== shouldBeActive) {
          return prisma.courseParallel.update({
            where: { id: cp.id },
            data: { active: shouldBeActive },
          });
        }
        return null;
      })
    );

    // Add new CourseParallel for any new parallelIds not present
    const existingParallelIds = allCourseParallels.map((cp) => cp.parallelId);
    const newParallelIds = parallelIds.filter((pid: number) => !existingParallelIds.includes(pid));
    await prisma.courseParallel.createMany({
      data: newParallelIds.map((parallelId: number) => ({
        courseId: id,
        parallelId,
        active: true,
      })),
      skipDuplicates: true,
    });

    // Return updated course with parallels
    const updated = await prisma.course.findUnique({
      where: { id },
      include: {
        parallels: {
          include: { parallel: true },
        },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/courses/[id]]", error);
    return NextResponse.json({ error: "Error actualizando el curso" }, { status: 500 });
  }
}
