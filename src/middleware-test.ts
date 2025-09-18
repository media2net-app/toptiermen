import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log(`🔍 TEST Middleware executing for path: ${req.nextUrl.pathname}`);
  
  // Simple test - if accessing dashboard, log it
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log(`🚨 TEST Dashboard access detected: ${req.nextUrl.pathname}`);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
