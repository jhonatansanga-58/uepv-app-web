import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        course: true,
        class: true,
        guardian: true,
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching students" },
      { status: 500 }
    );
  }
}
