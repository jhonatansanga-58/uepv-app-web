import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return null;
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret'
  );
  return {
    success: true,
    token,
    role: user.role,
  };
}
