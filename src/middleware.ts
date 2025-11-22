import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     * - public assets (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.cookies.get('token_debug')?.value;
  const url = new URL(req.url);

  console.log('Middleware - Path:', url.pathname, 'Token exists:', !!token);

  if (token) {
    console.log('Middleware - Token source: cookie, value (first 20 chars):', token.substring(0, 20) + '...');
  }

  // Handle root path - don't auto-redirect, let user choose
  if (url.pathname === '/') {
    console.log('Middleware - Root path accessed, allowing through');
    return NextResponse.next();
  }

  // Protect admin and peserta routes
  if (!token) {
    console.log('Middleware - No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    console.log('Middleware - Decoded role:', payload.role, 'for path:', url.pathname);

    // Check role-based access
    if (url.pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      console.log('Middleware - Unauthorized admin access');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (url.pathname.startsWith('/peserta') && payload.role !== 'PESERTA') {
      console.log('Middleware - Unauthorized peserta access');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    console.log('Middleware - Access granted for', payload.role, 'to', url.pathname);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware - JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
