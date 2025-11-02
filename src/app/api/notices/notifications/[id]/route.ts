import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(
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
    const { id } = await context.params;

    const notificationId = parseInt(id, 10);
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        courseParallel: {
          include: {
            course: true,
            parallel: true
          }
        }
      }
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
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

    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Only admins and teachers can update notifications" },
        { status: 403 }
      );
    }
    const { id } = await context.params;

    const notificationId = parseInt(id, 10);

    const data = await request.json();
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { active: data.active }
    });

    if (!updatedNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}