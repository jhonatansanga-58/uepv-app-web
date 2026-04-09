import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      phone,
      address,
      active,
    } = await req.json();

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // Constructor de contraseña predecible temporal: Uepv-PrimerNombre
    const firstWord = firstName.trim().split(' ')[0];
    const rawPassword = `Uepv-${firstWord}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    function generateRandomSuffix() {
      // Genera un número entre 10000 y 99999 (5 cifras)
      return Math.floor(10000 + Math.random() * 90000);
    }

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        userName: firstName.substring(0, 1).toLowerCase() + lastName.substring(0, 3).toLowerCase() + generateRandomSuffix(),
        password: hashedPassword,
        role,
        phone: phone || null,
        address: address || null,
        active: active ?? true,
      },
    });

    return NextResponse.json({ ...newUser, rawPassword }, { status: 201 });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
