import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub || !token?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjectId = parseInt(params.subjectId);

    // Get all course-parallels where this subject is taught
    const courseSubjects = await prisma.courseSubject.findMany({
      where: {
        subjectId: subjectId,
      },
      include: {
        course: {
          include: {
            parallels: {
              include: {
                parallel: true,
              },
            },
          },
        },
      },
    });

    // Transform the data into a flat array of course-parallels
    const courseParallels = courseSubjects.flatMap((cs) =>
      cs.course.parallels.map((cp) => ({
        id: cp.id,
        label: `${cs.course.name} ${cp.parallel.name}`,
      }))
    );

    return NextResponse.json(courseParallels);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}