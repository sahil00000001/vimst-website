import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Guards the admin area at the edge, so an unauthenticated request never
 * reaches a page that would query the database.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Someone already signed in has no reason to see the login form.
  if (pathname === '/admin/login') {
    if (session) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL('/admin/login', request.url);
    if (pathname !== '/admin') login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
