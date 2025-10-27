import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Helper function to validate JWT token
function isValidToken(token: string): boolean {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

// Helper function to check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  // Check for access token in cookies first
  const cookieToken = request.cookies.get('accessToken')?.value;
  if (cookieToken && isValidToken(cookieToken)) {
    return true;
  }
  
  // Check for access token in headers (for API requests)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7);
    if (isValidToken(headerToken)) {
      return true;
    }
  }
  
  return false;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/campaigns', '/search', '/influencers'];

  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (isAuthenticated(request) && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated(request) && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('message', 'Please log in to access this page');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

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
  ]
};
