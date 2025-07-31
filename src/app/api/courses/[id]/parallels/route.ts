import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const courseId = parseInt(params.id);

  if (isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  try {
    const parallels = await prisma.courseParallel.findMany({
      where: {
        courseId,
      },
      select: {
        id: true,
        parallel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        parallel: {
          name: "asc",
        },
      },
    });

    // Opcional: mapear para devolver un array simple
    const data = parallels.map((p) => ({
      id: p.parallel.id,
      name: p.parallel.name,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching parallels:", error);
    return NextResponse.json({ error: "Error loading parallels" }, { status: 500 });
  }
}
