import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CDN headers for Supabase video files
  if (request.nextUrl.hostname === 'wkjvstuttbeyqzyjayxj.supabase.co') {
    // Cache video files for 24 hours on CDN
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    response.headers.set('CDN-Cache-Control', 'public, max-age=86400');
    
    // Enable compression for video files
    response.headers.set('Accept-Encoding', 'gzip, deflate, br');
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Add performance headers for all responses
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
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