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

  // Redirect old mijn-missies URL to nieuwe mijn-challenges URL
  if (req.nextUrl.pathname === '/dashboard/mijn-missies') {
    return NextResponse.redirect(new URL('/dashboard/mijn-challenges', req.url));
  }

  // Check onboarding redirects for authenticated users on dashboard routes
  if (session?.user && req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Get onboarding status - use the same table as the main onboarding API
      const { data: onboardingRecords, error } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      const onboardingData = onboardingRecords && onboardingRecords.length > 0 ? onboardingRecords[0] : null;
      
      // Calculate current_step based on completed flags - match the API logic exactly
      let current_step = 0;
      let onboarding_completed = false;
      
      if (onboardingData) {
        onboarding_completed = onboardingData.onboarding_completed;
        
        // Determine the NEXT step the user should go to (not the current step)
        if (onboardingData.onboarding_completed) {
          current_step = 5; // Completed - no redirect needed
        } else if (onboardingData.challenge_started) {
          current_step = 5; // Forum Introductie (final step)
        } else if (onboardingData.nutrition_plan_selected) {
          current_step = 5; // Next: Forum Introductie
        } else if (onboardingData.training_schema_selected) {
          current_step = 4; // Next: Voedingsplan
        } else if (onboardingData.missions_selected) {
          current_step = 3; // Next: Trainingsschema
        } else if (onboardingData.goal_set) {
          current_step = 2; // Next: Missies Selecteren
        } else if (onboardingData.welcome_video_shown) {
          current_step = 1; // Next: Doel Omschrijven
        } else {
          current_step = 0; // Next: Welkom Video
        }
      }

      // Always log onboarding status for debugging
      console.log(`🔍 Onboarding check for user ${session.user.id}:`, {
        hasData: !!onboardingData,
        onboarding_completed,
        current_step,
        path: req.nextUrl.pathname,
        onboardingData: onboardingData ? {
          welcome_video_shown: onboardingData.welcome_video_shown,
          goal_set: onboardingData.goal_set,
          missions_selected: onboardingData.missions_selected,
          training_schema_selected: onboardingData.training_schema_selected,
          nutrition_plan_selected: onboardingData.nutrition_plan_selected,
          challenge_started: onboardingData.challenge_started
        } : null
      });

      // If no onboarding data exists, redirect to welcome video
      if (!error && !onboardingData && req.nextUrl.pathname !== '/dashboard/welcome-video') {
        console.log(`🔄 No onboarding data found, redirecting to welcome video: ${req.nextUrl.pathname} -> /dashboard/welcome-video`);
        return NextResponse.redirect(new URL('/dashboard/welcome-video', req.url));
      }

      if (!error && onboardingData && !onboarding_completed) {
        const currentStep = current_step;
        const currentPath = req.nextUrl.pathname;
        
        // Define allowed paths for each onboarding step
        // Users can only access their current step and previous steps, NOT the main dashboard
        const allowedPaths = {
          0: ['/dashboard/welcome-video'],
          1: ['/dashboard/welcome-video', '/dashboard/profiel'],
          2: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges'],
          3: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges', '/dashboard/trainingsschemas'],
          4: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/voedingsplannen-v2'],
          5: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/voedingsplannen-v2', '/dashboard/brotherhood/forum', '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden']
        };

        // Special case: If user tries to access main dashboard during onboarding, redirect to current step
        if (currentPath === '/dashboard') {
          let redirectPath = '/dashboard/welcome-video';
          
          if (currentStep === 1) {
            redirectPath = '/dashboard/profiel';
          } else if (currentStep === 2) {
            redirectPath = '/dashboard/mijn-challenges';
          } else if (currentStep === 3) {
            redirectPath = '/dashboard/trainingsschemas';
          } else if (currentStep === 4) {
            redirectPath = '/dashboard/voedingsplannen-v2';
          } else if (currentStep === 5) {
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
          let redirectPath = '/dashboard/welcome-video';
          
          if (currentStep === 0) {
            redirectPath = '/dashboard/welcome-video';
          } else if (currentStep === 1) {
            redirectPath = '/dashboard/profiel';
          } else if (currentStep === 2) {
            redirectPath = '/dashboard/mijn-challenges';
          } else if (currentStep === 3) {
            redirectPath = '/dashboard/trainingsschemas';
          } else if (currentStep === 4) {
            redirectPath = '/dashboard/voedingsplannen-v2';
          } else if (currentStep === 5) {
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
