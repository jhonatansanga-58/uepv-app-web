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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("studentId") || "");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

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

    if (Number.isNaN(studentId)) {
      return new NextResponse(
        JSON.stringify({ error: "studentId is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { studentId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        student: { include: { user: true, courseParallel: { include: { course: true, parallel: true } } } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return new NextResponse(
      JSON.stringify(attendances),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[GET /api/attendance]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
