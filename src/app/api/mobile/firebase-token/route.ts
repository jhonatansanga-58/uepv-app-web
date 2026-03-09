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

    const body = await req.json();
    const {
      userId,
      firebaseToken
    } = body;

    if (!userId || !firebaseToken ) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firebaseToken: firebaseToken
      },
    });

    return new NextResponse(
      JSON.stringify(updated),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[POST /api/firebase-token]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
