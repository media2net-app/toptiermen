import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Allow access to /books/ directory (ebooks are public)
  // if (req.nextUrl.pathname.startsWith('/books/')) {
  //   return NextResponse.redirect(new URL('/dashboard/academy', req.url));
  // }

  // Refresh session if expired - required for Server Components
  // Skip session refresh for logout-related requests to prevent conflicts
  const isLogoutRequest = req.nextUrl.pathname === '/login' && 
    (req.nextUrl.searchParams.get('logout') === 'success' || 
     req.nextUrl.searchParams.get('logout') === 'error');
  
  // Get session for all routes - this is normal behavior
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect old mijn-missies URL to nieuwe mijn-uitdagingen URL
  if (req.nextUrl.pathname === '/dashboard/mijn-missies') {
    return NextResponse.redirect(new URL('/dashboard/mijn-uitdagingen', req.url));
  }

  // Only check onboarding redirects for authenticated users on dashboard routes
  if (session?.user && req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Get onboarding status
      const { data: onboardingData, error } = await supabase
        .from('onboarding_status')
        .select('current_step, onboarding_completed')
        .eq('user_id', session.user.id)
        .single();

      if (!error && onboardingData && !onboardingData.onboarding_completed) {
        const currentStep = onboardingData.current_step;
        const currentPath = req.nextUrl.pathname;
        
        // Define allowed paths for each onboarding step
        // Users can only access their current step and onboarding pages, NOT the main dashboard
        const allowedPaths = {
          0: ['/dashboard/welcome-video'],
          1: ['/dashboard/welcome-video', '/dashboard/profiel'],
          2: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen'],
          3: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas'],
          4: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen'],
          5: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/challenges'],
          6: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/challenges', '/dashboard/brotherhood/forum', '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden']
        };

        // Special case: If user tries to access main dashboard during onboarding, redirect to current step
        if (currentPath === '/dashboard') {
          let redirectPath = '/dashboard/welcome-video';
          
          if (currentStep === 1) {
            redirectPath = '/dashboard/profiel';
          } else if (currentStep === 2) {
            redirectPath = '/dashboard/mijn-uitdagingen';
          } else if (currentStep === 3) {
            redirectPath = '/dashboard/trainingsschemas';
          } else if (currentStep === 4) {
            redirectPath = '/dashboard/voedingsplannen';
          } else if (currentStep === 5) {
            redirectPath = '/dashboard/challenges';
          } else if (currentStep === 6) {
            redirectPath = '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';
          }
          
          console.log(`🚫 Dashboard access blocked during onboarding: ${currentPath} -> ${redirectPath} (step ${currentStep})`);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }

        // Check if current path is allowed for this step
        const isAllowedPath = allowedPaths[currentStep]?.some(allowedPath => 
          currentPath === allowedPath || currentPath.startsWith(allowedPath + '/')
        );

        if (!isAllowedPath) {
          // Redirect to the correct step - use the most specific path for each step
          let redirectPath = '/dashboard';
          
          if (currentStep === 0) {
            redirectPath = '/dashboard/welcome-video';
          } else if (currentStep === 1) {
            redirectPath = '/dashboard/profiel';
          } else if (currentStep === 2) {
            redirectPath = '/dashboard/mijn-uitdagingen';
          } else if (currentStep === 3) {
            redirectPath = '/dashboard/trainingsschemas';
          } else if (currentStep === 4) {
            redirectPath = '/dashboard/voedingsplannen';
          } else if (currentStep === 5) {
            redirectPath = '/dashboard/challenges';
          } else if (currentStep === 6) {
            redirectPath = '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';
          }
          
          console.log(`🔄 Onboarding redirect: ${currentPath} -> ${redirectPath} (step ${currentStep})`);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
    } catch (error) {
      console.error('❌ Onboarding middleware error:', error);
    }
  }

  return res;
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
