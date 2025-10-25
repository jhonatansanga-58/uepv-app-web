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
