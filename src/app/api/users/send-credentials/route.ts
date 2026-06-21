import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, name, userName, rawPassword, role } = await req.json();

    if (!email || !name || !userName || !rawPassword || !role) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para el envío" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const getRoleLabel = (r: string) => {
      switch (r) {
        case "ADMIN":
          return "Administrador del Sistema";
        case "TEACHER":
          return "Docente / Personal Escolar";
        case "TUTOR":
          return "Tutor / Padre de Familia";
        case "STUDENT":
          return "Estudiante";
        default:
          return r;
      }
    };

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const roleLabel = getRoleLabel(role);

    const mailOptions = {
      from: `"Soporte UEPV" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Tus Credenciales de Acceso - UEPV",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #842d9c; margin: 0;">Portal Académico UEPV</h2>
            <p style="color: #888; font-size: 14px; margin: 5px 0 0 0;">Unidad Educativa Plenitud de Vida</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <div style="padding: 10px 0;">
            <p>Estimado(a) <strong>${name}</strong>,</p>
            <p>Se ha creado con éxito tu cuenta para acceder a la plataforma escolar de la UEPV. A continuación se detallan tus credenciales de inicio de sesión temporal:</p>
            
            <div style="background-color: #f9f1fb; padding: 20px; border-radius: 8px; border-left: 4px solid #842d9c; margin: 25px 0;">
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Nombre de Usuario:</strong> <span style="font-family: monospace; font-size: 17px; font-weight: bold; color: #333;">${userName}</span></p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Contraseña Temporal:</strong> <span style="font-family: monospace; font-size: 17px; font-weight: bold; color: #a84cc3;">${rawPassword}</span></p>
              <p style="margin: 0; font-size: 15px;"><strong>Rol de Acceso:</strong> <span style="color: #666;">${roleLabel}</span></p>
            </div>
            
            <p>Por motivos de seguridad, <strong>el sistema te solicitará cambiar esta contraseña</strong> la primera vez que ingreses.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/login" style="background-color: #842d9c; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Ingresar al Portal</a>
            </div>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <div style="text-align: center; font-size: 11px; color: #aaa; margin-top: 20px;">
            Este es un correo automático, por favor no respondas a este mensaje.<br />
            Si tienes algún inconveniente, comunícate con la dirección del colegio.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/users/send-credentials]", error);
    return NextResponse.json(
      { error: "Error al enviar el correo con las credenciales" },
      { status: 500 }
    );
  }
}
