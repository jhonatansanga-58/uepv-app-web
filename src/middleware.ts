import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Role-based access mapping: path prefix => allowed roles
const roleMap: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin', roles: ['ADMIN'] },
  // Allow both ADMIN and TEACHER to access teacher routes
  { prefix: '/teacher', roles: ['ADMIN', 'TEACHER'] },
  // API namespaces for role-protected endpoints
  { prefix: '/api/admin', roles: ['ADMIN'] },
  { prefix: '/api/teacher', roles: ['ADMIN', 'TEACHER'] },
  { prefix: '/dashboard', roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  // Tutors API
  { prefix: '/api/tutors', roles: ['ADMIN', 'TUTOR'] },
  // Leave request APIs (general): tutors can create/manage their requests, admins can review
  { prefix: '/api/leaverequest', roles: ['ADMIN', 'TUTOR'] },
  // Frontend leave request routes
  { prefix: '/leaves', roles: ['ADMIN', 'TUTOR'] },
];

// Skip these paths from middleware checks
const publicPrefixes = ['/_next', '/static', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public files, auth routes and assets
  if (
    publicPrefixes.some((p) => pathname.startsWith(p)) ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Find the first matching roleMap entry for the path
  const matched = roleMap.find((m) => pathname.startsWith(m.prefix));
  if (!matched) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    // preserve where user was trying to go
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // token.role should be present thanks to NextAuth callbacks
  type TokenWithRole = { role?: string };
  const userRole = (token as TokenWithRole)?.role;
  if (!userRole) {
    // If no role present, consider unauthorized
    return NextResponse.rewrite(new URL('/unauthorized', req.url));
  }

  // Allow access if user's role is included in allowed roles
  if (!matched.roles.includes(userRole)) {
    // If request is to an API path, return 403 JSON
    if (pathname.startsWith('/api')) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Otherwise redirect to an unauthorized UI page
    return NextResponse.rewrite(new URL('/unauthorized', req.url));
  }

  // FORCE PASSWORD CHANGE LOGIC (Fase 2.2)
  if (token.forcePasswordChange === true) {
    if (!pathname.startsWith('/force-change') && !pathname.startsWith('/api/auth')) {
       // If it's an API route but not auth, return 403 forcing a change
       if (pathname.startsWith('/api')) {
          return new NextResponse(JSON.stringify({ error: 'Password change required', forcePasswordChange: true }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
       }
       // Redirect to forced password change UI
       return NextResponse.redirect(new URL('/force-change', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/api/admin/:path*',
    '/api/teacher/:path*',
    '/api/tutors/:path*',
    '/api/leaverequest/:path*',
    '/dashboard/:path*',
    '/leaves/:path*',
  ],
};
