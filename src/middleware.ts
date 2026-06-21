import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface RouteRule {
  pattern: RegExp;
  roles: string[];
}

const rules: RouteRule[] = [
  // Frontend Pages
  { pattern: /^\/admin(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/teacher(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/leaves(\/|$)/, roles: ['ADMIN', 'TUTOR'] },
  { pattern: /^\/attendances\/history(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  { pattern: /^\/attendances\/register-fingerprint(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/attendances\/register(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/notices\/meetings(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  { pattern: /^\/notices\/notifications(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  { pattern: /^\/notices\/tasks(\/|$)/, roles: ['TEACHER', 'TUTOR', 'STUDENT'] }, // Admin is excluded from tasks
  { pattern: /^\/dashboard(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },

  // API Endpoints
  // Admin specific namespaces
  { pattern: /^\/api\/admin(\/|$)/, roles: ['ADMIN'] },
  // Users APIs
  { pattern: /^\/api\/users\/send-credentials(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/users\/minimal\/tutors-students(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/api\/users\/minimal(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/users\/\d+\/students(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/users\/\d+\/subjects(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/users(\/\d+)?(\/|$)/, roles: ['ADMIN'] }, // /api/users or /api/users/[userId] (POST/PATCH are admin only)

  // Students APIs
  { pattern: /^\/api\/students\/allminimal(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  { pattern: /^\/api\/students\/minimal(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/students\/\d+(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] }, // GET is allowed for all, PATCH is ADMIN
  { pattern: /^\/api\/students(\/|$)/, roles: ['ADMIN', 'TEACHER'] }, // GET is ADMIN/TEACHER, POST is ADMIN

  // Courses APIs
  { pattern: /^\/api\/courses\/all(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/courses\/\d+\/parallels(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/api\/courses\/\d+(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/courses(\/|$)/, roles: ['ADMIN', 'TEACHER'] }, // GET is ADMIN/TEACHER, POST is ADMIN

  // Academic Years APIs
  { pattern: /^\/api\/academic-years\/\d+\/activate(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/academic-years(\/|$)/, roles: ['ADMIN', 'TEACHER'] }, // GET is ADMIN/TEACHER, POST is ADMIN

  // Subjects APIs
  { pattern: /^\/api\/subjects\/courses\/\d+(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/subjects\/minimal(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/api\/subjects\/\d+(\/|$)/, roles: ['ADMIN'] },
  { pattern: /^\/api\/subjects(\/|$)/, roles: ['ADMIN', 'TEACHER'] }, // GET is ADMIN/TEACHER, POST is ADMIN

  // Other APIs
  { pattern: /^\/api\/parallels(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
  { pattern: /^\/api\/reports(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  { pattern: /^\/api\/attendance(\/|$)/, roles: ['ADMIN', 'TEACHER', 'TUTOR', 'STUDENT'] },
  { pattern: /^\/api\/leaverequest(\/|$)/, roles: ['ADMIN', 'TUTOR'] },
  { pattern: /^\/api\/tutors(\/|$)/, roles: ['ADMIN', 'TUTOR'] },
  { pattern: /^\/api\/teacher(\/|$)/, roles: ['ADMIN', 'TEACHER'] },
];

// Skip these paths from middleware checks
const publicPrefixes = ['/_next', '/static', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If user has an active session and requests login/auth pages, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Skip public files, auth routes and assets
  if (
    publicPrefixes.some((p) => pathname.startsWith(p)) ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/favicon.ico' ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Find the first matching rule for the path
  const matched = rules.find((r) => r.pattern.test(pathname));
  if (!matched) return NextResponse.next();

  if (!token) {
    if (pathname.startsWith('/api')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
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
    '/login',
    '/forgot-password',
    '/reset-password',
    '/admin/:path*',
    '/teacher/:path*',
    '/api/admin/:path*',
    '/api/teacher/:path*',
    '/api/tutors/:path*',
    '/api/leaverequest/:path*',
    '/dashboard/:path*',
    '/leaves/:path*',
    '/attendances/:path*',
    '/notices/:path*',
    '/api/attendance/:path*',
    '/api/academic-years/:path*',
    '/api/courses/:path*',
    '/api/parallels/:path*',
    '/api/subjects/:path*',
    '/api/users/:path*',
    '/api/students/:path*',
    '/api/reports/:path*',
  ],
};
