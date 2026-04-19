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

import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    let token = await getToken({ req: req });
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const jwtToken = authHeader.split(" ")[1];
        try {
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

    const userId = parseInt(token.sub, 10);
    const formData = await req.formData() as any;
    
    const studentId = formData.get("studentId")?.toString();
    const title = formData.get("title")?.toString();
    const message = formData.get("message")?.toString();
    const reason = formData.get("reason")?.toString();
    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();
    const evidenceFile = formData.get("evidence") as File | null;

    if (!studentId || !title || !message || !reason) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let evidenceUrl: string | null = null;
    if (evidenceFile && evidenceFile.name) {
       const bytes = await evidenceFile.arrayBuffer();
       const buffer = Buffer.from(bytes);
       
       const uploadsDir = path.join(process.cwd(), "public", "uploads", "licencias");
       await fs.mkdir(uploadsDir, { recursive: true });
       
       const filename = `${Date.now()}_${evidenceFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
       const filepath = path.join(uploadsDir, filename);
       await fs.writeFile(filepath, buffer);
       evidenceUrl = `/uploads/licencias/${filename}`;
    }
    
    // We determine the tutor based on who's logged in. 
    // If student is logged in, grab one tutor of theirs
    let requestTutorId = userId;
    if (token.role === Role.STUDENT) {
       const studentData = await prisma.student.findUnique({
          where: { id: parseInt(studentId, 10) },
          include: { tutorships: true }
       });
       if (studentData && studentData.tutorships.length > 0) {
          requestTutorId = studentData.tutorships[0].tutorId; // Fallback assign to first tutor
       } else {
          requestTutorId = 1; // absolute fallback admin if orphaned
       }
    }

    const created = await prisma.leaveRequest.create({
      data: {
        studentId: Number(studentId),
        tutorId: requestTutorId,
        title,
        message,
        reason,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        evidenceUrl: evidenceUrl
      },
    });

    return new NextResponse(JSON.stringify(created), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("[POST /api/mobile/leaverequest]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

