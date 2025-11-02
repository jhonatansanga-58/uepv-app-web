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

    const meetingId = parseInt(id, 10);
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: {
          include: {
            user: true,
            courseParallel: {
              include: {
                course: true,
                parallel: true
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
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

    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Only admins and teachers can update meetings" },
        { status: 403 }
      );
    }
    const { id } = await context.params;

    const meetingId = parseInt(id, 10);
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Verify user owns this meeting
    if (meeting.userId !== userId) {
      return NextResponse.json(
        { error: "You did not create this meeting" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { active: data.active }
    });

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}