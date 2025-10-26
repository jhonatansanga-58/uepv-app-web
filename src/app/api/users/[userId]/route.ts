import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId: id } = params;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  async function tryFind(userId: number) {
    try {
      return await prisma.user.findUnique({ where: { id: userId } });
    } catch (e) {
      console.error("prisma.findUnique error (ignored):", e);
      return null;
    }
  }

  let user = null;
  user = await tryFind(+id);

  if (!user) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  // Quitar campos sensibles si existen
  // (ajusta los nombres según tu esquema si usas otro campo para la contraseña)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;

  return NextResponse.json(safeUser);
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId: id } = params;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  try {
    const body = await request.json();
    const { firstName, lastName, email, address, phone, role, active } = body;

    // Get current user to merge with updates
    const currentUser = await prisma.user.findUnique({
      where: { id: +id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided in the request
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) {
      // Check if email is already taken by another user (only if email is being changed)
      if (email !== currentUser.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: email,
            id: { not: +id }
          }
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "El email ya está en uso por otro usuario" },
            { status: 400 }
          );
        }
      }
      updateData.email = email;
    }
    if (address !== undefined) updateData.address = address || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: +id },
      data: updateData,
    });

    // Remove password from response
    const { password, ...safeUser } = updatedUser;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}