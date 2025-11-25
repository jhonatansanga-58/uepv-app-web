import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
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

export async function POST(req: NextRequest) {
  try {
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
    const tutorId = token && (token as TokenWithRole).sub ? parseInt((token as TokenWithRole).sub as string, 10) : undefined;

    const body = await req.json();
    const {
      studentId,
      title,
      message,
      reason,
      startDate,
      endDate,
    } = body;

    if (!studentId || !title || !message || !reason) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const created = await prisma.leaveRequest.create({
      data: {
        studentId: Number(studentId),
        tutorId: tutorId!,
        title,
        message,
        reason,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return new NextResponse(
      JSON.stringify(created),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[POST /api/leaverequest]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
