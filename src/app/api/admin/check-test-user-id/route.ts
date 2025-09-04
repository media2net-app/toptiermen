import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const testUserEmail = 'test.user.1756630044380@toptiermen.test';
    
    console.log('🔍 Looking for user with email:', testUserEmail);
    
    // Get user by email
    const { data: user, error } = await supabase.auth.admin.getUserByEmail(testUserEmail);
    
    if (error) {
      console.error('❌ Error fetching user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('👤 Found user:', user);
    
    if (!user.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Now check onboarding status with the real UUID
    const { data: onboardingRecords, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
    
    if (onboardingError) {
      console.error('❌ Error fetching onboarding records:', onboardingError);
      return NextResponse.json({ 
        error: onboardingError.message,
        user: user.user 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      email: testUserEmail,
      userId: user.user.id,
      userCreatedAt: user.user.created_at,
      onboardingRecordCount: onboardingRecords?.length || 0,
      onboardingRecords: onboardingRecords || [],
      latestOnboardingRecord: onboardingRecords?.[0] || null
    });
    
  } catch (error) {
    console.error('❌ Error in check-test-user-id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
