import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/test-login'];

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get token from cookies (Next.js automatically syncs localStorage with cookies in some cases)
  // For now, we'll let the client-side handle auth

  // Allow all requests to pass through
  // The AuthContext will handle client-side redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};