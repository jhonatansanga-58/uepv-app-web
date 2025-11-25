import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export async function OPTIONS() {

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tutorId = parseInt(params.id, 10);
    if (Number.isNaN(tutorId)) return new NextResponse(
      JSON.stringify({ error: "Invalid tutor id" }),
      { status: 400, headers: corsHeaders }
    );

    let token = await getToken({ req: req });
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const jwtToken = authHeader.split(" ")[1];
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const decoded = jwt.verify(jwtToken, JWT_SECRET) as any;
          token = {
            sub: decoded.id?.toString(),
            role: decoded.role as Role,
            userName: decoded.userName
          };
        } catch (err) {
          console.error("Error decodificando token manualmente:", err);
        }
      }
    }

    if (!token?.sub || !token?.role) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    type TokenWithRole = { sub?: string };
    const userId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    if (userId !== tutorId) return new NextResponse(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: corsHeaders }
    );

    const requests = await prisma.leaveRequest.findMany({
      where: { tutorId },
      orderBy: { requestDate: "desc" },
      include: {
        student: { include: { user: true } },
      },
    });

    return new NextResponse(
      JSON.stringify(requests),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[GET /api/tutors/[id]/leaverequests]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
