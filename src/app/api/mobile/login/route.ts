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

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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