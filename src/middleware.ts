import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  const path = req.nextUrl.pathname;

  // ✅ Add all public path **prefixes** here
  const publicPrefixes = [
    '/login',
    '/api/auth',  // Allow authentication API routes
  ];  

  // ✅ Check if current path starts with any public prefix
  const isPublicPage = publicPrefixes.some(prefix => path.startsWith(prefix));

  // 🔁 Redirect logic for pages, return 401 for API routes
  if (!isAuth && !isPublicPage) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to access this resource' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuth && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Protect all routes except static files and Next.js internals
export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.svg$).*)'],
};
