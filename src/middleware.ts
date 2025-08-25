import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// V2.0: Simplified middleware with auth-first approach
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // V2.0: Auth-first approach - check auth before setting cache headers
  const path = request.nextUrl.pathname;
  
  // V2.0: Skip cache for auth-sensitive routes
  if (path.startsWith('/api/auth') || 
      path.startsWith('/login') || 
      path.startsWith('/reset-password') ||
      path.includes('auth')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Strategy', 'auth-no-cache');
    response.headers.set('X-Cache-Version', '2.0');
    return response;
  }
  
  // V2.0: Dashboard routes - user-specific, no caching
  if (path.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Strategy', 'dashboard-no-cache');
    response.headers.set('X-Cache-Version', '2.0');
    return response;
  }
  
  // V2.0: API routes - short cache with version-based invalidation
  if (path.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60');
    response.headers.set('X-Cache-Strategy', 'api-short-cache');
    response.headers.set('X-Cache-Version', '2.0');
  } else if (path.includes('.js') || path.includes('.css')) {
    // V2.0: Static assets - long cache with version-based invalidation
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Cache-Strategy', 'static-long-cache');
    response.headers.set('X-Cache-Version', '2.0');
  } else {
    // V2.0: Default - short cache
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    response.headers.set('X-Cache-Strategy', 'default-short-cache');
    response.headers.set('X-Cache-Version', '2.0');
  }
  
  // V2.0: Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // V2.0: Version header
  response.headers.set('X-TTM-Version', '2.0');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
