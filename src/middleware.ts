import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get user email from headers or cookies to identify Rick
  const userEmail = request.headers.get('x-user-email') || 
                   request.cookies.get('user-email')?.value || '';
  
  const isRick = userEmail.toLowerCase().includes('rick') || 
                 userEmail.toLowerCase().includes('cuijpers');
  
  const isChrome = request.headers.get('user-agent')?.includes('Chrome') || false;
  
  // Different cache strategies based on user and browser
  if (isRick && isChrome) {
    // Rick + Chrome: Aggressive no-cache strategy
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    // Add cache busting headers
    response.headers.set('X-Cache-Strategy', 'rick-chrome-no-cache');
    response.headers.set('X-Cache-Bust', Date.now().toString());
    
  } else if (isRick) {
    // Rick + other browsers: Moderate no-cache strategy
    response.headers.set('Cache-Control', 'no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Strategy', 'rick-other-no-cache');
    
  } else {
    // Other users: Normal caching strategy
    const path = request.nextUrl.pathname;
    
    if (path.startsWith('/api/')) {
      // API routes: Short cache
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    } else if (path.startsWith('/dashboard')) {
      // Dashboard pages: Medium cache
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    } else if (path.includes('.js') || path.includes('.css')) {
      // Static assets: Long cache
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Default: Short cache
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    }
    
    response.headers.set('X-Cache-Strategy', 'normal-caching');
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
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
