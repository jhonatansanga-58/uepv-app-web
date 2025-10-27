import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      active: subject.active,
      courses: subject.courses.map((c) => ({
        id: c.course.id,
        name: c.course.name,
      })),
    }));

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Error loading subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        active: true
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("[POST /api/subjects]", error);
    return NextResponse.json(
      { error: "Error creating subject" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, name } = await request.json();
    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("[PATCH /api/subjects]", error);
    return NextResponse.json(
      { error: "Error updating subject" },
      { status: 500 }
    );
  }
}
