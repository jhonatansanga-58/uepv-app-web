import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      where: {
        active: true,
        role: {
          in: ["TUTOR", "STUDENT"],
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching minimal tutors and students:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
