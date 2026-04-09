import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET || "fallback_secret";
    let decoded: any;

    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return NextResponse.json({ error: "Enlace inválido o expirado. Solicita uno nuevo." }, { status: 401 });
    }

    if (!decoded || !decoded.id) {
       return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Contraseña restablecida exitosamente", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: "Error interno procesando la solicitud." },
      { status: 500 }
    );
  }
}
