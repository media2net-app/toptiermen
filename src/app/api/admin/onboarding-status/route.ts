import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Disable caching and ensure this runs dynamically so admin sees freshest data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        subscription_tier,
        subscription_status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Define filtering helpers to align with members-data logic and real member definition
    const isTestUser = (profile: any) => {
      const email = (profile?.email || '').toLowerCase();
      const name = (profile?.full_name || '').toLowerCase();
      return (
        email.includes('test') ||
        name.includes('test') ||
        email.includes('onboarding.') ||
        email.includes('final.') ||
        email.includes('premium.test') ||
        email.includes('basic.test') ||
        email.includes('v2.test') ||
        email.includes('v3.test')
      );
    };

    // Filter to real members: only exclude test/demo accounts; include admins and all subscription statuses
    const filteredUsers = (users || []).filter((u: any) => !isTestUser(u));

    // Fetch onboarding status for all filtered users (from CORRECT table!)
    const { data: onboardingData, error: onboardingError } = await supabaseAdmin
      .from('user_onboarding_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (onboardingError) {
      console.error('Error fetching onboarding status:', onboardingError);
      // If table doesn't exist yet, return empty data
      if (onboardingError.code === '42P01') {
        console.log('user_onboarding_status table not found, returning empty data');
        return NextResponse.json({
          users: filteredUsers.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role || 'member',
            subscriptionTier: user.subscription_tier || 'basic',
            subscriptionStatus: user.subscription_status || 'active',
            createdAt: user.created_at,
            onboardingCompleted: false,
            currentStep: 1,
            mainGoal: null,
            status: '⏳ In Progress'
          })),
          statistics: {
            total: filteredUsers.length,
            completed: 0,
            pending: filteredUsers.length,
            completionRate: 0
          }
        });
      }
      return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }

    // Fetch profiles for main goals (primary source)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, main_goal');

    // Fetch legacy users table for main_goal (fallback source)
    let legacyUsers: Array<{ id: string; main_goal: string | null }> | null = null;
    try {
      const { data: legacy, error: legacyErr } = await supabaseAdmin
        .from('users')
        .select('id, main_goal');
      if (!legacyErr) legacyUsers = legacy as any;
    } catch {}

    // Create a map of onboarding data by user_id
    const onboardingMap = new Map<string, any>();
    // onboardingData is ordered newest-first, so keep the first occurrence per user
    onboardingData?.forEach(item => {
      if (!onboardingMap.has(item.user_id)) {
        onboardingMap.set(item.user_id, item);
      }
    });

    // Create a map of profiles by user_id
    const profilesMap = new Map<string, { id: string; main_goal: string | null }>();
    profiles?.forEach(profile => {
      profilesMap.set(profile.id, { id: profile.id, main_goal: profile.main_goal });
    });

    // Create a map of legacy users by id for main_goal fallback
    const legacyUsersMap = new Map<string, { id: string; main_goal: string | null }>();
    legacyUsers?.forEach(u => legacyUsersMap.set(u.id, u));


    
    // Helper function to calculate current step from user_onboarding_status
    const calculateCurrentStep = (onboarding: any, profile: any) => {
      // If no onboarding record, check profile for legacy data
      if (!onboarding) {
        // Legacy users: if they have a main_goal, they at least completed step 2
        if (profile?.main_goal && profile.main_goal.trim() !== '') {
          return 2; // They set a goal
        }
        return 1; // Default to step 1
      }
      
      // New users with onboarding records
      if (onboarding.onboarding_completed) return 7; // Completed
      if (onboarding.challenge_started) return 6;
      if (onboarding.nutrition_plan_selected) return 5;
      if (onboarding.training_schema_selected) return 4;
      if (onboarding.missions_selected) return 3;
      if (onboarding.goal_set) return 2;
      if (onboarding.welcome_video_shown) return 2;
      return 1;
    };

    // Transform data for better readability
    const usersWithStatus = filteredUsers.map(user => {
      const onboarding = onboardingMap.get(user.id);
      const profile = profilesMap.get(user.id);
      const legacy = legacyUsersMap.get(user.id);
      
      // Calculate current step from user_onboarding_status fields + legacy fallback
      const actualCurrentStep = calculateCurrentStep(onboarding, profile);
      const isCompleted = onboarding?.onboarding_completed || false;
      
      return {
        id: user.id,
        email: user.email,
        role: user.role || 'member',
        subscriptionTier: user.subscription_tier || 'basic',
        subscriptionStatus: user.subscription_status || 'active',
        createdAt: user.created_at,
        onboardingCompleted: isCompleted,
        currentStep: actualCurrentStep,
        mainGoal: (() => {
          const primary = profile?.main_goal?.trim();
          if (primary) return primary;
          const fallback = legacy?.main_goal?.trim();
          return fallback && fallback.length > 0 ? fallback : null;
        })(),
        status: isCompleted ? '✅ Voltooid' : `⏳ Stap ${actualCurrentStep}`
      };
    });

    // Calculate statistics
    const totalUsers = usersWithStatus.length;
    const completedOnboarding = usersWithStatus.filter(u => u.onboardingCompleted).length;
    const pendingOnboarding = totalUsers - completedOnboarding;

    return NextResponse.json({
      users: usersWithStatus,
      statistics: {
        total: totalUsers,
        completed: completedOnboarding,
        pending: pendingOnboarding,
        completionRate: totalUsers > 0 ? Math.round((completedOnboarding / totalUsers) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error in onboarding status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 