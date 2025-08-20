import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get user email from headers or cookies
  const userEmail = request.headers.get('x-user-email') || 
                   request.cookies.get('user-email')?.value || '';
  
  const isRick = userEmail.toLowerCase().includes('rick') || 
                 userEmail.toLowerCase().includes('cuijpers');
  
  // Unified cache strategy for all users
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/api/')) {
    // API routes: Short cache with version-based invalidation
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    response.headers.set('X-Cache-Strategy', 'api-short-cache');
    response.headers.set('X-Cache-Version', '1.2.0');
  } else if (path.startsWith('/dashboard')) {
    // Dashboard pages: Medium cache with user-specific invalidation
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.headers.set('X-Cache-Strategy', 'dashboard-medium-cache');
    response.headers.set('X-Cache-Version', '1.2.0');
    response.headers.set('X-User-ID', userEmail);
  } else if (path.includes('.js') || path.includes('.css')) {
    // Static assets: Long cache with version-based invalidation
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Cache-Strategy', 'static-long-cache');
    response.headers.set('X-Cache-Version', '1.2.0');
  } else {
    // Default: Short cache
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    response.headers.set('X-Cache-Strategy', 'default-short-cache');
    response.headers.set('X-Cache-Version', '1.2.0');
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Add unified cache headers
  response.headers.set('X-Unified-Cache', 'enabled');
  response.headers.set('X-Cache-Invalidation', 'version-based');
  
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
