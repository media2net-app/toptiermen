import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add session-preserving cache headers for login and auth routes
  if (request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname === '/logout') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-TTM-Version', '2.0.2');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Session-Preserve', 'true'); 
    response.headers.set('Clear-Site-Data', '"cache", "storage"'); 
  }

  // Add aggressive cache-busting headers for dashboard routes to prevent caching issues
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-TTM-Version', '2.0.1');
    response.headers.set('X-Cache-Bust', Date.now().toString());
  }

  // Add aggressive cache-busting headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-TTM-Version', '2.0.1');
    response.headers.set('X-Cache-Bust', Date.now().toString());
  }

  // Add cache-busting for static assets that might be cached
  if (request.nextUrl.pathname.startsWith('/_next/') || 
      request.nextUrl.pathname.includes('.js') || 
      request.nextUrl.pathname.includes('.css')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
    response.headers.set('X-TTM-Version', '2.0.1');
  }

  // Add cache-busting for root and main pages
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname === '/voedingsplannen' ||
      request.nextUrl.pathname === '/brotherhood' ||
      request.nextUrl.pathname === '/academy') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-TTM-Version', '2.0.1');
    response.headers.set('X-Cache-Bust', Date.now().toString());
  }

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && !request.headers.get('x-forwarded-proto')?.includes('https')) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
