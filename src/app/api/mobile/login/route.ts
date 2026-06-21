// src/app/api/mobile/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const allowedOrigins = [
  'http://localhost:8081',    // Expo web
  'http://192.168.0.11:8081', // Expo en red local
  'http://localhost:3000',    // Web
];

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '*';
  const isAllowed = allowedOrigins.includes(origin);

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin : '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}


export async function POST(req: Request) {


  const origin = req.headers.get('origin') || '*';
  const isAllowed = allowedOrigins.includes(origin);

  try {
    const { usernameOrEmail, password } = await req.json();

    if (!usernameOrEmail || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing username or password' }),
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': isAllowed ? origin : '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: usernameOrEmail }, { userName: usernameOrEmail }] },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (!user.active) {
      return new NextResponse(JSON.stringify({ error: 'User is inactive' }), {
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Check lockout status
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / (60 * 1000)
      );
      return new NextResponse(
        JSON.stringify({
          error: `Account locked. Please try again in ${minutesLeft} minute(s).`,
          lockout: true,
          minutesLeft,
        }),
        {
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': isAllowed ? origin : '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const newAttempts = user.loginAttempts + 1;
      const isLockout = newAttempts >= 5;
      const lockoutUntil = isLockout ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockoutUntil,
        },
      });

      const errorMessage = isLockout
        ? 'Account locked due to too many failed attempts. Try again in 15 minutes.'
        : 'Invalid credentials';

      return new NextResponse(
        JSON.stringify({
          error: errorMessage,
          lockout: isLockout,
        }),
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': isAllowed ? origin : '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Reset attempts if successful login
    if (user.loginAttempts > 0 || user.lockoutUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockoutUntil: null,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return new NextResponse(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.firstName + ' ' + user.lastName,
          role: user.role
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowed ? origin : '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}