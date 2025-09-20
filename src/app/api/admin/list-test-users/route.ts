import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching all users to identify test users...');

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_tier, role, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    console.log(`📊 Found ${profiles.length} total users`);

    // Identify test users based on patterns
    const testUserPatterns = [
      // Email patterns
      /test/i,
      /onboarding/i,
      /basic\.test/i,
      /premium\.test/i,
      /final\.basic/i,
      /toptiermen\.eu$/i,
      // Name patterns
      /test user/i,
      /basic tester/i,
      /premium tester/i,
      /onboarding.*tester/i,
      /final.*tester/i
    ];

    const testUsers: any[] = [];
    const realUsers: any[] = [];

    profiles.forEach(profile => {
      const isTestUser = testUserPatterns.some(pattern => 
        pattern.test(profile.email) || pattern.test(profile.full_name || '')
      );

      if (isTestUser) {
        testUsers.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          package_type: profile.subscription_tier,
          role: profile.role,
          created_at: profile.created_at,
          reason: getTestUserReason(profile)
        });
      } else {
        realUsers.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          package_type: profile.subscription_tier,
          role: profile.role,
          created_at: profile.created_at
        });
      }
    });

    console.log(`🔍 Identified ${testUsers.length} test users and ${realUsers.length} real users`);

    // Group test users by type
    const testUserGroups = {
      onboarding: testUsers.filter(u => u.email.includes('onboarding')),
      basic_test: testUsers.filter(u => u.email.includes('basic.test') || u.full_name?.includes('Basic Test')),
      premium_test: testUsers.filter(u => u.email.includes('premium.test') || u.full_name?.includes('Premium Test')),
      final_test: testUsers.filter(u => u.email.includes('final.basic')),
      other_test: testUsers.filter(u => 
        !u.email.includes('onboarding') && 
        !u.email.includes('basic.test') && 
        !u.email.includes('premium.test') && 
        !u.email.includes('final.basic')
      )
    };

    return NextResponse.json({
      success: true,
      summary: {
        total_users: profiles.length,
        test_users: testUsers.length,
        real_users: realUsers.length,
        test_percentage: Math.round((testUsers.length / profiles.length) * 100)
      },
      test_users: testUsers,
      test_user_groups: testUserGroups,
      real_users: realUsers
    });

  } catch (error) {
    console.error('❌ Error listing test users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getTestUserReason(profile: any): string {
  const reasons: string[] = [];
  
  if (profile.email.includes('test')) reasons.push('Email contains "test"');
  if (profile.email.includes('onboarding')) reasons.push('Email contains "onboarding"');
  if (profile.email.includes('basic.test')) reasons.push('Basic test user');
  if (profile.email.includes('premium.test')) reasons.push('Premium test user');
  if (profile.email.includes('final.basic')) reasons.push('Final basic test user');
  if (profile.email.includes('toptiermen.eu')) reasons.push('Test domain email');
  if (profile.full_name?.includes('Test')) reasons.push('Name contains "Test"');
  if (profile.full_name?.includes('Tester')) reasons.push('Name contains "Tester"');
  
  return reasons.join(', ');
}
