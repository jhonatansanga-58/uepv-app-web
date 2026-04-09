import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Por seguridad, siempre retornamos 200 aunque el correo no exista,
    // para evitar enumeración de cuentas.
    if (!user) {
      return NextResponse.json({ message: "Si el correo existe, se ha enviado un enlace de recuperación." }, { status: 200 });
    }

    const payload = { id: user.id, email: user.email };
    const secret = process.env.JWT_SECRET || "fallback_secret";
    
    // El token expira en 15 minutos (900 segundos)
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    // Link a redirigir
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Soporte UEPV" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: "Recuperación de Contraseña - UEPV",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Recuperación de Contraseña</h2>
          <p>Hola <strong>${user.firstName}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña en el Portal Académico de la UEPV.</p>
          <p>Por favor, haz clic en el siguiente botón para continuar. Este enlace expirará en 15 minutos.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi Contraseña</a>
          </div>
          <p style="font-size: 12px; color: #888;">Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Si el correo existe, se ha enviado un enlace de recuperación." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { error: "Error interno procesando la solicitud." },
      { status: 500 }
    );
  }
}
