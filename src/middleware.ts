import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ✅ Add all public path **prefixes** here
  const publicPrefixes = [
    '/login',
    '/api/auth',  // Allow authentication API routes
  ];  

  // ✅ Check if current path starts with any public prefix
  const isPublicPage = publicPrefixes.some(prefix => path.startsWith(prefix));

  // If it's a public page, allow access without token check
  if (isPublicPage) {
    return NextResponse.next();
  }

  // Only check token for protected routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isRegistered = token?.isRegistered === true;

  // 🔁 Redirect logic for pages, return 401 for API routes
  if (!isAuth) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to access this resource' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check if user is authenticated but not registered in database
  if (!isRegistered) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { 
          error: 'User not registered. Please register on tayog.in to access this dashboard.',
          details: 'You must be registered in our system to access this resource'
        },
        { status: 403 }
      );
    }
    // Redirect to login with error parameter
    return NextResponse.redirect(new URL('/login?error=not_registered', req.url));
  }

  // If user is authenticated and registered, allow access to login page but redirect to dashboard
  if (path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Protect all routes except static files and Next.js internals
export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.svg$).*)'],
};
