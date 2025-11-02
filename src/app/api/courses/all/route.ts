import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                // Course.parallels is the CourseParallel relation; include the Parallel model
                parallels: {
                    include: {
                        parallel: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        const formattedCourses = courses.map((course) => ({
            id: course.id,
            name: course.name,
            active: course.active,
            parallels: course.parallels.map((p) => ({
                courseParallelId: p.id,
                id: p.parallel.id,
                name: p.parallel.name,
                active: p.active,
            })),
        }));

        return NextResponse.json(formattedCourses);
    } catch (error) {
        console.error("[GET /api/courses/all]", error);
        return NextResponse.json(
            { error: "Error loading courses with parallels" },
            { status: 500 }
        );
    }
}
