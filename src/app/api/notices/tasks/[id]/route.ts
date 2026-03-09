import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const taskId = parseInt(id, 10);
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        courseParallel: {
          include: {
            course: true,
            parallel: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const token = await getToken({ req: request });
    if (!token?.sub || !token?.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = token.role as Role;
    const userId = parseInt(token.sub);

    if (!userId || role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Only teachers can update tasks" },
        { status: 403 }
      );
    }
    const { id } = await context.params;

    const taskId = parseInt(id, 10);
    const data = await request.json();

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { active: data.active }
    });

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}