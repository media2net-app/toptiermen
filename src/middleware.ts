import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // MODERATE cache-busting for login and auth routes - REMOVED Clear-Site-Data to prevent logout
  if (request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname === '/logout') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-TTM-Version', '3.0.0');
    response.headers.set('X-Cache-Bust', Date.now().toString());
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Session-Preserve', 'true'); 
    // REMOVED: response.headers.set('Clear-Site-Data', '"cache", "storage"'); - This was causing automatic logout
  }

  // Moderate cache-busting for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-TTM-Version', '3.0.0');
  }

  // Moderate cache-busting headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-TTM-Version', '3.0.0');
  }

  // MODERATE cache-busting for static assets - REMOVED aggressive headers to prevent logout
  if (request.nextUrl.pathname.startsWith('/_next/') || 
      request.nextUrl.pathname.includes('.js') || 
      request.nextUrl.pathname.includes('.css')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-TTM-Version', '3.0.0');
    // REMOVED aggressive cache-busting headers that were causing logout issues
  }

  // MODERATE cache-busting for root and main pages - REMOVED aggressive headers to prevent logout
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname === '/voedingsplannen' ||
      request.nextUrl.pathname === '/brotherhood' ||
      request.nextUrl.pathname === '/academy') {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-TTM-Version', '3.0.0');
    // REMOVED aggressive cache-busting headers that were causing logout issues
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
