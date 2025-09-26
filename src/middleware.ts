import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  console.log(`🔍 Middleware executing for path: ${req.nextUrl.pathname}`);
  
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if this is a protected route
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                          req.nextUrl.pathname.startsWith('/api/') ||
                          req.nextUrl.pathname.startsWith('/admin');
  
  if (isProtectedRoute) {
    try {
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Session error:', error.message);
        // Redirect to login if there's a session error
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } else if (!session) {
        console.log('❌ No session found for protected route');
        // Redirect to login if no session
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } else {
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        
        if (now >= expiresAt) {
          console.log('❌ Session expired, redirecting to login');
          // Clear the expired session
          await supabase.auth.signOut();
          if (req.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', req.url));
          }
        } else {
          console.log('✅ Valid session found');
        }
      }
    } catch (error) {
      console.error('❌ Middleware error:', error);
      // On error, redirect to login for dashboard routes
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
