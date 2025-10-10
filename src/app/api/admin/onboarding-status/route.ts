import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
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

    // Fetch onboarding status for all users (from correct table!)
    const { data: onboardingData, error: onboardingError } = await supabaseAdmin
      .from('onboarding_status')
      .select('*');

    if (onboardingError) {
      console.error('Error fetching onboarding status:', onboardingError);
      // If table doesn't exist yet, return empty data
      if (onboardingError.code === '42P01') {
        console.log('onboarding_status table not found, returning empty data');
        return NextResponse.json({
          users: users?.map(user => ({
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
          })) || [],
          statistics: {
            total: users?.length || 0,
            completed: 0,
            pending: users?.length || 0,
            completionRate: 0
          }
        });
      }
      return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }

    // Fetch profiles for main goals
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, main_goal');

    // Create a map of onboarding data by user_id
    const onboardingMap = new Map();
    onboardingData?.forEach(item => {
      onboardingMap.set(item.user_id, item);
    });

    // Create a map of profiles by user_id
    const profilesMap = new Map();
    profiles?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });


    
    // Transform data for better readability
    const usersWithStatus = users?.map(user => {
      const onboarding = onboardingMap.get(user.id);
      const profile = profilesMap.get(user.id);
      
      // Use current_step directly from new onboarding_status table
      const actualCurrentStep = onboarding?.current_step || 1;
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
        mainGoal: profile?.main_goal || null,
        status: isCompleted ? '✅ Voltooid' : `⏳ Stap ${actualCurrentStep}`
      };
    }) || [];

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