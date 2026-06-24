import { authenticateUser } from '@/services/authService';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn() } }
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Autenticación de Usuarios', () => {
  it('Debe autenticar credenciales correctas, generar un JWT y devolver el rol del usuario', async () => {
    const mockCredentials = { email: 'director@colegio.edu', password: 'password123' };
    
    const mockUserDb = { 
      id: 1, 
      email: mockCredentials.email, 
      password: 'hashed_password',
      role: 'ADMIN',
      active: true 
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserDb);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mocked_jwt_token_12345');

    const response = await authenticateUser(mockCredentials.email, mockCredentials.password);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockCredentials.email } });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUserDb.password);
    expect(jwt.sign).toHaveBeenCalled();
    expect(response).toEqual({
      success: true,
      token: 'mocked_jwt_token_12345',
      role: 'ADMIN'
    });
  });
});
