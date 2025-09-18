import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get session for all routes
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
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, package_type, role')
        .eq('email', session.user.email)
        .single();

      if (profileError) {
        console.error('❌ Profile error in middleware:', profileError);
        return res;
      }

      // Get onboarding status
      const { data: onboardingRecords, error: onboardingError } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      const onboardingStatus = onboardingRecords && onboardingRecords.length > 0 ? onboardingRecords[0] : null;

      // Determine access control
      const packageType = profile.package_type || 'Basic Tier';
      const isAdmin = profile.role === 'admin';
      const hasTrainingAccess = isAdmin || packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';
      const hasNutritionAccess = isAdmin || packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';

      // Calculate current step
      let currentStep = null;
      let isCompleted = false;

      if (onboardingStatus) {
        if (onboardingStatus.onboarding_completed) {
          isCompleted = true;
          currentStep = null;
        } else {
          // Determine current step based on completed flags
          if (!onboardingStatus.welcome_video_shown) {
            currentStep = 0; // Welcome video
          } else if (!onboardingStatus.goal_set) {
            currentStep = 1; // Set goal
          } else if (!onboardingStatus.missions_selected) {
            currentStep = 2; // Select challenges
          } else if (hasTrainingAccess && !onboardingStatus.training_schema_selected) {
            currentStep = 3; // Select training
          } else if (hasNutritionAccess && !onboardingStatus.nutrition_plan_selected) {
            currentStep = 4; // Select nutrition
          } else if (!onboardingStatus.challenge_started) {
            currentStep = 5; // Forum intro
          } else {
            // All steps completed, mark as completed
            currentStep = null;
            isCompleted = true;
          }
        }
      } else {
        // No onboarding data, start at step 0
        currentStep = 0;
      }

      console.log(`🔍 Onboarding V2 middleware check for ${session.user.email}:`, {
        currentStep,
        isCompleted,
        hasTrainingAccess,
        hasNutritionAccess,
        path: req.nextUrl.pathname
      });

      // If onboarding is not completed, redirect to appropriate step
      if (!isCompleted && currentStep !== null) {
        let redirectPath = '/dashboard/welcome-video';

        switch (currentStep) {
          case 0:
            redirectPath = '/dashboard/welcome-video';
            break;
          case 1:
            redirectPath = '/dashboard/profiel';
            break;
          case 2:
            redirectPath = '/dashboard/mijn-challenges';
            break;
          case 3:
            redirectPath = '/dashboard/trainingsschemas';
            break;
          case 4:
            redirectPath = '/dashboard/voedingsplannen-v2';
            break;
          case 5:
            redirectPath = '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';
            break;
        }

        // Special case: If user tries to access main dashboard during onboarding, redirect to current step
        if (req.nextUrl.pathname === '/dashboard') {
          console.log(`🚫 Dashboard access blocked during onboarding: ${req.nextUrl.pathname} -> ${redirectPath} (step ${currentStep})`);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }

        // Check if current path is allowed for this step
        const allowedPaths = {
          0: ['/dashboard/welcome-video'],
          1: ['/dashboard/welcome-video', '/dashboard/profiel'],
          2: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges'],
          3: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges', '/dashboard/trainingsschemas'],
          4: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/voedingsplannen-v2'],
          5: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-challenges', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/voedingsplannen-v2', '/dashboard/brotherhood/forum', '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden']
        };

        const isAllowedPath = allowedPaths[currentStep]?.some(allowedPath => 
          req.nextUrl.pathname === allowedPath || req.nextUrl.pathname.startsWith(allowedPath + '/')
        );

        if (!isAllowedPath) {
          console.log(`🔄 Onboarding V2 redirect: ${req.nextUrl.pathname} -> ${redirectPath} (step ${currentStep})`);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }

    } catch (error) {
      console.error('❌ Onboarding V2 middleware error:', error);
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
